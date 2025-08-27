import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.NODE_ENV === 'production' 
        ? `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=20&connect_timeout=30`
        : process.env.DATABASE_URL,
    },
  },
  // Only show errors in production
  log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'info', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
