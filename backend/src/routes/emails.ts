import { Router, Request, Response } from 'express';
import { db } from '../db';
import { emails } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { searchEmails } from '../services/elasticService';
import type { User } from '../db/schema';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const user = req.user as User;
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    res.status(400).json({ error: 'q query param required' });
    return;
  }

  const results = await searchEmails(user.id, q);
  res.json(results);
});

router.get('/', async (req: Request, res: Response) => {
  const user = req.user as User;
  const { status } = req.query;

  const conditions = [eq(emails.userId, user.id)];

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
