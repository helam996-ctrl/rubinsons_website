import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Limit pg pool connection size to prevent pool exhaustion in serverless environments
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 2, 
  });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 5,
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
export default prisma;
