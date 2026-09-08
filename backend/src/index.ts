import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { env } from './config/env';
import './config/passport';
import passport from 'passport';
import { emailQueue } from './queues/emailQueue';
import { startEmailWorker } from './workers/emailWorker';
import authRouter from './routes/auth';
import campaignsRouter from './routes/campaigns';
import emailsRouter from './routes/emails';
import slackRouter from './routes/slack';
import { requireAuth } from './middleware/auth';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

app.use('/admin/queues', serverAdapter.getRouter());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);
app.use('/api/campaigns', requireAuth, campaignsRouter);
app.use('/api/emails', requireAuth, emailsRouter);
app.use('/slack', requireAuth, slackRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  console.log(`Bull Board: http://localhost:${env.PORT}/admin/queues`);
});

startEmailWorker();

export default app;
