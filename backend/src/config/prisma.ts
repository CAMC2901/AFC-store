import { PrismaClient } from '@prisma/client';
import { isProduction } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

// Patch Supabase URL to use transaction pooler automatically to prevent hanging connections
let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl.includes('supabase.com') && dbUrl.includes(':5432')) {
  dbUrl = dbUrl.replace(':5432', ':6543');
}
if (dbUrl.includes('supabase.com') && dbUrl.includes(':6543')) {
  if (!dbUrl.includes('pgbouncer=true')) dbUrl += dbUrl.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
  if (!dbUrl.includes('connection_limit=')) dbUrl += '&connection_limit=1';
  if (!dbUrl.includes('pool_timeout=')) dbUrl += '&pool_timeout=10';
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  });

if (!isProduction) {
  globalThis.prismaGlobal = prisma;
}

