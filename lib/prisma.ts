import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
loadEnvConfig(process.cwd());
const rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error('DATABASE_URL is not configured.');
}

const databaseUrl = new URL(rawConnectionString);
const sslMode = databaseUrl.searchParams.get('sslmode');

if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
  databaseUrl.searchParams.set('sslmode', 'verify-full');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl.toString(),
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
