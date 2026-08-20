import { Router, type Request, type Response } from "express";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";
import { redisHealthCheck } from "@/lib/redis";

export const healthRouter: Router = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  const [redisStatus] = await Promise.allSettled([redisHealthCheck()]);

  let dbStatus = "healthy";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = `unhealthy: ${err instanceof Error ? err.message : String(err)}`;
  }

  const isHealthy =
    dbStatus === "healthy" &&
    redisStatus.status === "fulfilled" &&
    redisStatus.value.status === "healthy";

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "degraded",
    service: env.SERVICE_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    components: {
      database: dbStatus,
      redis: redisStatus.status === "fulfilled" ? redisStatus.value : "unhealthy",
    },
  });
});

export default healthRouter;
