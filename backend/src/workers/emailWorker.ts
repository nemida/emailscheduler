import { Worker, Job } from 'bullmq';
import { eq, sql } from 'drizzle-orm';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { db } from '../db';
import { emails, campaigns, senders } from '../db/schema';
import { sendEmail } from '../services/mailerService';
import { notifyRateLimitHit } from '../services/slackService';
import { indexEmail, updateEmailStatus, ensureIndex } from '../services/elasticService';
import { EmailJobData } from '../queues/emailQueue';

const RATE_LIMIT_KEY = (senderId: string) => {
  const hour = Math.floor(Date.now() / 3_600_000);
  return `rate:${senderId}:${hour}`;
};

async function checkAndIncrementRateLimit(senderId: string, limit: number): Promise<boolean> {
  const key = RATE_LIMIT_KEY(senderId);
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, 3600);
  }
  return count <= limit;
}

async function processEmail(job: Job<EmailJobData>) {
  const { emailId, campaignId, senderId, recipient, subject, body, idempotencyKey } = job.data;

  const existingEmail = await db.query.emails.findFirst({
    where: eq(emails.idempotencyKey, idempotencyKey),
  });

  if (!existingEmail) {
    throw new Error(`Email record not found for idempotencyKey: ${idempotencyKey}`);
  }

  if (existingEmail.status === 'sent') {
    console.log(`Email ${emailId} already sent, skipping.`);
    return;
  }

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
  });

  const hourlyLimit = campaign?.hourlyLimit ?? env.MAX_EMAILS_PER_HOUR;

  const withinLimit = await checkAndIncrementRateLimit(senderId, hourlyLimit);

  if (!withinLimit) {
    const msUntilNextHour = 3_600_000 - (Date.now() % 3_600_000);
    console.log(`Rate limit hit for sender ${senderId}, rescheduling in ${msUntilNextHour}ms`);

    const sender = await db.query.senders.findFirst({ where: eq(senders.id, senderId) });
    if (sender) {
      await notifyRateLimitHit(sender.userId, sender.email).catch(() => {});
    }

    await job.moveToDelayed(Date.now() + msUntilNextHour);
    return;
  }

  const sender = await db.query.senders.findFirst({
    where: eq(senders.id, senderId),
  });

  const fromAddress = sender
    ? `"${sender.name}" <${sender.email}>`
    : 'scheduler@ethereal.email';

  try {
    await sendEmail({
      from: fromAddress,
      to: recipient,
      subject,
      html: body,
    });

    await db
      .update(emails)
      .set({ status: 'sent', sentAt: new Date(), errorMessage: null })
      .where(eq(emails.id, emailId));

    const sentAt = new Date().toISOString();

    await indexEmail({
      emailId,
      campaignId,
      userId: existingEmail.userId,
      recipient,
      subject,
      body,
      status: 'sent',
      sentAt,
      scheduledAt: existingEmail.scheduledAt.toISOString(),
      createdAt: existingEmail.createdAt.toISOString(),
    }).catch(() => {});

    await db
      .update(campaigns)
      .set({ sentCount: sql`${campaigns.sentCount} + 1` })
      .where(eq(campaigns.id, campaignId));

    const updated = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (updated && updated.sentCount >= updated.totalCount) {
      await db
        .update(campaigns)
        .set({ status: 'completed' })
        .where(eq(campaigns.id, campaignId));
    }

    await new Promise((resolve) => setTimeout(resolve, env.MIN_DELAY_BETWEEN_SENDS_MS));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await db
      .update(emails)
      .set({ status: 'failed', errorMessage: message })
      .where(eq(emails.id, emailId));

    await updateEmailStatus(emailId, 'failed').catch(() => {});

    throw err;
  }
}

export function startEmailWorker() {
  ensureIndex().catch((err) => console.error('Failed to ensure ES index:', err));

  const worker = new Worker<EmailJobData>('emails', processEmail, {
    connection: redis,
    concurrency: env.WORKER_CONCURRENCY,
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  console.log(`Email worker started (concurrency: ${env.WORKER_CONCURRENCY})`);

  return worker;
}
