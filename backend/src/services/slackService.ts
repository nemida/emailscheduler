import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function notifyRateLimitHit(
  userId: string,
  senderEmail: string,
  context: {
    recipientCount: number;
    subject: string;
    nextFireAt: Date;
  }
) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user?.slackToken || !user?.slackChannel) return;

  const nextTime = context.nextFireAt.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const message = [
    `*Rate limit hit* for sender *${senderEmail}*`,
    ``,
    `• *Subject:* ${context.subject}`,
    `• *Affected emails:* ${context.recipientCount} remaining in queue`,
    `• *Rescheduled to:* ${nextTime} IST`,
    ``,
    `Jobs have been moved to the next hour window and will send automatically.`,
  ].join('\n');

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.slackToken}`,
    },
    body: JSON.stringify({
      channel: user.slackChannel,
      text: message,
    }),
  });

  const result = await response.json() as { ok: boolean; error?: string };
  if (!result.ok) {
    console.error('Slack postMessage failed:', result.error);
  } else {
    console.log('Slack notification sent successfully');
  }
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  channel: string;
}> {
  const { env } = await import('../config/env');

  const params = new URLSearchParams({
    client_id: env.SLACK_CLIENT_ID,
    client_secret: env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri: env.SLACK_REDIRECT_URI,
  });

  const response = await fetch(`https://slack.com/api/oauth.v2.access?${params.toString()}`, {
    method: 'POST',
  });

  const data = await response.json() as {
    ok: boolean;
    access_token?: string;
    incoming_webhook?: { channel: string };
    error?: string;
  };

  if (!data.ok) {
    throw new Error(`Slack OAuth failed: ${data.error}`);
  }

  return {
    accessToken: data.access_token!,
    channel: data.incoming_webhook?.channel ?? '',
  };
}
