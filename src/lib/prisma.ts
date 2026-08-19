import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Database Connection Pool உருவாக்கவும்
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // <-- Driver Adapter-ஐ இங்கே வழங்க வேண்டும்
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;