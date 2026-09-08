import express from 'express';
import cors from 'cors';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { env } from './config/env';
import { emailQueue } from './queues/emailQueue';
import { startEmailWorker } from './workers/emailWorker';
import campaignsRouter from './routes/campaigns';
import emailsRouter from './routes/emails';

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());

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

app.use('/api/campaigns', campaignsRouter);
app.use('/api/emails', emailsRouter);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  console.log(`Bull Board: http://localhost:${env.PORT}/admin/queues`);
});

startEmailWorker();

export default app;
