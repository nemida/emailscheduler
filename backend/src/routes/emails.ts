import { Router, Request, Response } from 'express';
import { db } from '../db';
import { emails } from '../db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { userId, status } = req.query;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId query param required' });
    return;
  }

  const conditions = [eq(emails.userId, userId)];

  if (status && typeof status === 'string') {
    conditions.push(eq(emails.status, status as 'scheduled' | 'sent' | 'failed'));
  }

  const result = await db.query.emails.findMany({
    where: and(...conditions),
    orderBy: (e, { desc }) => [desc(e.scheduledAt)],
  });

  res.json(result);
});

router.patch('/:id/star', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isStarred } = req.body;

  const [updated] = await db
    .update(emails)
    .set({ isStarred: Boolean(isStarred) })
    .where(eq(emails.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'Email not found' });
    return;
  }

  res.json(updated);
});

export default router;
