import { createHttpServer } from "@/app";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { disconnectRedis } from "@/lib/redis";
import { logger } from "@/lib/logger";

const server = createHttpServer();

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      environment: env.NODE_ENV,
      health: `http://localhost:${PORT}/health`,
      authApi: `http://localhost:${PORT}/api/auth`,
    },
    `🚀 FieldOps RBAC API Server running on port ${PORT}`
  );
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.warn({ signal }, `🛑 Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info("HTTP server closed.");

    try {
      // Disconnect Prisma
      await prisma.$disconnect();
      logger.info("Database connection pool closed.");

      // Disconnect Redis
      await disconnectRedis();
      logger.info("Redis connection closed.");

      logger.info("👋 Graceful shutdown complete. Exiting.");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  });

  // Force exit if shutdown hangs after 10s
  setTimeout(() => {
    logger.error("⚠️ Force closing server after 10s timeout.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "💥 Uncaught Exception");
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "💥 Unhandled Rejection");
  gracefulShutdown("unhandledRejection");
});
