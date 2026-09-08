import { Router, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { senders } from '../db/schema';
import type { User } from '../db/schema';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await db.query.senders.findMany({
    where: eq(senders.userId, user.id),
    orderBy: (s, { asc }) => [asc(s.createdAt)],
  });
  res.json(result);
});

router.post('/', async (req: Request, res: Response) => {
  const user = req.user as User;
  const { email, name, smtpHost, smtpPort, smtpUser, smtpPass } = req.body;

  if (!email || !name || !smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const [sender] = await db
    .insert(senders)
    .values({ userId: user.id, email, name, smtpHost, smtpPort, smtpUser, smtpPass })
    .returning();

  res.status(201).json(sender);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const user = req.user as User;
  const { id } = req.params;

  await db
    .delete(senders)
    .where(eq(senders.id, id));

  res.json({ success: true });
});

export default router;
