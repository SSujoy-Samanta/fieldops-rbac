import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "../config/env";
import { logger } from "./logger";

// Explicitly cap connections per service instance to prevent postgres pool
// exhaustion across a horizontally scaled architecture.
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => logger.error({ err }, "[db] Pool error"));

const adapter = new PrismaPg(pool);

// Singleton — prevents multiple instances in dev hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Log Level Decisioning: Show queries only in debug/trace mode
const showQueries = ["debug", "trace"].includes(env.LOG_LEVEL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: showQueries ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function shutdown() {
  await prisma.$disconnect();
  await pool.end();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default prisma;
