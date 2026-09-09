import { Router, Request, Response } from 'express';
import passport from 'passport';
import { env } from '../config/env';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${env.FRONTEND_URL}/login?error=auth_failed` }),
  (_req: Request, res: Response) => {
    res.redirect(`${env.FRONTEND_URL}/dashboard`);
  }
);

router.get('/me', (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json(req.user);
});

router.post('/logout', (req: Request, res: Response, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

export default router;
