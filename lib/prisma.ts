// lib/prisma.ts
import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
loadEnvConfig(process.cwd());
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not configured.');
}
const adapter = new PrismaPg({
  connectionString,
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