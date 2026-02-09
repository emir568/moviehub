import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { billingRouter } from './routes/billing.js';
import { contentRouter } from './routes/content.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
app.use('/billing/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'moviehub-api' });
});

app.use('/auth', authRouter);
app.use('/billing', billingRouter);
app.use('/content', contentRouter);

app.listen(Number(env.PORT), () => {
  console.log(`API listening on :${env.PORT}`);
});
