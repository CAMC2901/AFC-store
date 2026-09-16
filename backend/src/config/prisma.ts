import { PrismaClient } from '@prisma/client';
import { isProduction } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
  });

if (!isProduction) {
  globalThis.prismaGlobal = prisma;
}

