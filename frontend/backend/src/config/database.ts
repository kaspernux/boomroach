import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Prisma Client singleton pattern for development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'colorless',
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Database connection health check
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test the connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database query test passed');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('📝 Database disconnected gracefully');
  } catch (error) {
    logger.error('❌ Error disconnecting from database:', error);
  }
};

// Database health check endpoint helper
export const checkDatabaseHealth = async (): Promise<{ status: string; timestamp: Date }> => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const duration = Date.now() - start;
    
    return {
      status: `healthy (${duration}ms)`,
      timestamp: new Date()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    throw new Error('Database connection failed');
  }
};

export { prisma };
export default prisma;