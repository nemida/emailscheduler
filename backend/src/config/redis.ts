import IORedis from 'ioredis';
import { env } from './env';

export const redis = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});
