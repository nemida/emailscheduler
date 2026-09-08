import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/emailscheduler',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),

  MAX_EMAILS_PER_HOUR: parseInt(process.env.MAX_EMAILS_PER_HOUR || '200', 10),
  WORKER_CONCURRENCY: parseInt(process.env.WORKER_CONCURRENCY || '5', 10),
  MIN_DELAY_BETWEEN_SENDS_MS: parseInt(process.env.MIN_DELAY_BETWEEN_SENDS_MS || '2000', 10),

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',

  SESSION_SECRET: process.env.SESSION_SECRET || 'change-me-in-production',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
  SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || '',
  SLACK_REDIRECT_URI: process.env.SLACK_REDIRECT_URI || 'http://localhost:3001/slack/callback',

  ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
} as const;
