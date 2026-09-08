import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { campaigns, emails } from '../db/schema';
import { emailQueue } from '../queues/emailQueue';

export interface ScheduleCampaignInput {
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  scheduledAt: Date;
  delaySeconds: number;
  hourlyLimit: number;
}

export async function scheduleCampaign(input: ScheduleCampaignInput) {
  const {
    userId,
    senderId,
    subject,
    body,
    recipients,
    scheduledAt,
    delaySeconds,
    hourlyLimit,
  } = input;

  const [campaign] = await db
    .insert(campaigns)
    .values({
      userId,
      senderId,
      subject,
      body,
      scheduledAt,
      delaySeconds,
      hourlyLimit,
      totalCount: recipients.length,
      sentCount: 0,
      status: 'scheduled',
    })
    .returning();

  const emailRows = recipients.map((recipient, index) => {
    const delayMs = index * delaySeconds * 1000;
    const emailScheduledAt = new Date(scheduledAt.getTime() + delayMs);
    return {
      id: uuidv4(),
      campaignId: campaign.id,
      userId,
      senderId,
      recipient,
      subject,
      body,
      scheduledAt: emailScheduledAt,
      status: 'scheduled' as const,
      idempotencyKey: uuidv4(),
    };
  });

  await db.insert(emails).values(emailRows);

  const now = Date.now();

  for (const emailRow of emailRows) {
    const delayMs = Math.max(0, emailRow.scheduledAt.getTime() - now);

    const job = await emailQueue.add(
      'send-email',
      {
        emailId: emailRow.id,
        campaignId: campaign.id,
        userId,
        senderId,
        recipient: emailRow.recipient,
        subject,
        body,
        idempotencyKey: emailRow.idempotencyKey,
      },
      {
        delay: delayMs,
        jobId: emailRow.idempotencyKey,
      }
    );

    await db
      .update(emails)
      .set({ jobId: job.id ?? null })
      .where({ id: emailRow.id } as never);
  }

  return campaign;
}
