import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';
import { db } from '../db';
import { users } from '../db/schema';
import { exchangeCodeForToken } from '../services/slackService';

const router = Router();

router.get('/connect', (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId query param required' });
    return;
  }

  const scopes = 'incoming-webhook,chat:write';
  const url = `https://slack.com/oauth/v2/authorize?client_id=${env.SLACK_CLIENT_ID}&scope=${scopes}&redirect_uri=${encodeURIComponent(env.SLACK_REDIRECT_URI)}&state=${userId}`;

  res.redirect(url);
});

router.get('/callback', async (req: Request, res: Response) => {
  const { code, state: userId, error } = req.query;

  if (error) {
    res.redirect(`${env.FRONTEND_URL}/dashboard?slack=error`);
    return;
  }

  if (!code || typeof code !== 'string' || !userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'Missing code or state' });
    return;
  }

  const { accessToken, channel } = await exchangeCodeForToken(code);

  await db
    .update(users)
    .set({ slackToken: accessToken, slackChannel: channel })
    .where(eq(users.id, userId));

  res.redirect(`${env.FRONTEND_URL}/dashboard?slack=connected`);
});

router.post('/disconnect', async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId required' });
    return;
  }

  await db
    .update(users)
    .set({ slackToken: null, slackChannel: null })
    .where(eq(users.id, userId));

  res.json({ success: true });
});

router.get('/status', async (req: Request, res: Response) => {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId query param required' });
    return;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  res.json({ connected: !!user?.slackToken, channel: user?.slackChannel ?? null });
});

export default router;
