import { Router, Request, Response } from 'express';
import { db } from '../db';
import { campaigns } from '../db/schema';
import { scheduleCampaign } from '../services/campaignService';
import { eq } from 'drizzle-orm';
import type { User } from '../db/schema';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const user = req.user as User;
  const { senderId, subject, body, recipients, scheduledAt, delaySeconds, hourlyLimit } = req.body;

  if (!senderId || !subject || !body || !recipients?.length || !scheduledAt) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (!Array.isArray(recipients) || recipients.some((r) => typeof r !== 'string')) {
    res.status(400).json({ error: 'recipients must be an array of email strings' });
    return;
  }

  const campaign = await scheduleCampaign({
    userId: user.id,
    senderId,
    subject,
    body,
    recipients,
    scheduledAt: new Date(scheduledAt),
    delaySeconds: delaySeconds ?? 2,
    hourlyLimit: hourlyLimit ?? 200,
  });

  res.status(201).json(campaign);
});

router.get('/', async (req: Request, res: Response) => {
  const user = req.user as User;

  const result = await db.query.campaigns.findMany({
    where: eq(campaigns.userId, user.id),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  res.json(result);
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
    with: { emails: true },
  });

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }

  res.json(campaign);
});

export default router;
