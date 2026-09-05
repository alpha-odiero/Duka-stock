import dotenv from 'dotenv';
import path from 'path';

// Load env files from the server working directory. In development we load
// `.env` (local PostgreSQL). In production we load `.env.production` (cloud
// PostgreSQL); real deployment-platform variables still take precedence
// because dotenv does not override already-set process.env variables.
const envName = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, `../../${envName}`), override: false });

function required(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  port: Number(required('PORT', '4000')),
  nodeEnv: required('NODE_ENV', 'development'),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173,https://duka-stock-client.vercel.app'),
  sessionSecret: required('SESSION_SECRET'),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  isProduction: required('NODE_ENV', 'development') === 'production',
  isTest: required('NODE_ENV', 'development') === 'test',
  // Optional Cloudinary config for product images.
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

// ===== Redis (cache / queues / locks / rate limiting / coordination) =====
// Redis is an infrastructure component for fast reads and coordination. The
// PostgreSQL database remains the single source of truth for all business data.
export interface RedisConfig {
  url: string;
  enabled: boolean;
  keyPrefix: string;
  // Connection
  maxRetriesPerRequest: number;
  connectTimeout: number;
  keepAlive?: number;
  // Limits / tuning
  commandTimeout: number;
  // Safety: when Redis is unavailable, cache lookups degrade to DB reads rather
  // than failing the request.
  failOpen: boolean;
}

export const redisConfig: RedisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  enabled: process.env.REDIS_ENABLED !== 'false',
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'dukastock',
  maxRetriesPerRequest: Number(process.env.REDIS_MAX_RETRIES || 2),
  connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT || 5000),
  keepAlive: process.env.REDIS_KEEP_ALIVE ? Number(process.env.REDIS_KEEP_ALIVE) : undefined,
  commandTimeout: Number(process.env.REDIS_COMMAND_TIMEOUT || 2000),
  failOpen: process.env.REDIS_FAIL_OPEN !== 'false',
};

export const cloudinaryConfigured =
  Boolean(env.cloudinaryCloudName) && Boolean(env.cloudinaryApiKey) && Boolean(env.cloudinaryApiSecret);

export const SESSION_COOKIE = 'dukastock_session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
