import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

let prisma: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log:
        process.env['NODE_ENV'] === 'development'
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'error' },
              { emit: 'stdout', level: 'warn' },
            ]
          : [{ emit: 'stdout', level: 'error' }],
    });

    if (process.env['NODE_ENV'] === 'development') {
      (prisma as any).$on('query', (e: any) => {
        logger.debug({ duration: e.duration, query: e.query }, 'prisma query');
      });
    }
  }
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
}

export type { PrismaClient };
