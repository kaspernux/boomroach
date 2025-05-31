import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8000'),
  HOST: z.string().default('localhost'),
  API_VERSION: z.string().default('v1'),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // Redis Configuration
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Solana Configuration
  SOLANA_RPC_URL: z.string().url().default('https://api.mainnet-beta.solana.com'),
  SOLANA_WS_URL: z.string().url().default('wss://api.mainnet-beta.solana.com'),
  JUPITER_API_URL: z.string().url().default('https://price.jup.ag/v4'),
  RAYDIUM_API_URL: z.string().url().default('https://api.raydium.io'),

  // Security
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),

  // WebSocket Configuration
  WS_PORT: z.string().transform(Number).default('8001'),
  WS_PING_INTERVAL: z.string().transform(Number).default('30000'),
  WS_PING_TIMEOUT: z.string().transform(Number).default('5000'),

  // External APIs
  COINGECKO_API_KEY: z.string().optional(),
  BIRDEYE_API_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_REAL_TRADING: z.string().transform(val => val === 'true').default('false'),
  ENABLE_NOTIFICATIONS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('true'),
  ENABLE_DEBUG_LOGS: z.string().transform(val => val === 'true').default('true'),

  // Admin Configuration
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
});

// Validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;

// Environment utilities
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Database URL for Prisma
export const DATABASE_URL = env.DATABASE_URL;

// CORS origins array
export const CORS_ORIGINS = env.CORS_ORIGIN.split(',').map(origin => origin.trim());

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
};

// JWT configuration
export const JWT_CONFIG = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshSecret: env.JWT_REFRESH_SECRET,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
};

// WebSocket configuration
export const WS_CONFIG = {
  port: env.WS_PORT,
  pingInterval: env.WS_PING_INTERVAL,
  pingTimeout: env.WS_PING_TIMEOUT,
};

// Solana configuration
export const SOLANA_CONFIG = {
  rpcUrl: env.SOLANA_RPC_URL,
  wsUrl: env.SOLANA_WS_URL,
  jupiterApiUrl: env.JUPITER_API_URL,
  raydiumApiUrl: env.RAYDIUM_API_URL,
};

// Feature flags
export const FEATURES = {
  realTrading: env.ENABLE_REAL_TRADING,
  notifications: env.ENABLE_NOTIFICATIONS,
  analytics: env.ENABLE_ANALYTICS,
  debugLogs: env.ENABLE_DEBUG_LOGS,
};

export default env;