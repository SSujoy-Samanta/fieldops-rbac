import Redis, { type RedisOptions } from "ioredis";
import { env } from "../config/env";
import { keys, authKeys, rbacKeys } from "../config/keys";
import { TOKEN, REDIS_TTL, LOCKOUT } from "../config/constants";
import { logger } from "./logger";

export { keys, authKeys, rbacKeys, TOKEN, REDIS_TTL, LOCKOUT };
export type { Redis, RedisOptions } from "ioredis";

function getRedisOptions(): RedisOptions {
  const url = env.REDIS_URL || "redis://localhost:6379";

  const baseOptions: RedisOptions = {
    enableOfflineQueue: true,
    connectTimeout: 10000,
    keepAlive: 30000,

    retryStrategy(times) {
      const delay = Math.max(Math.min(Math.exp(times) * 100, 20000), 1000);
      if (times > 8) {
        return null;
      }
      return delay;
    },

    reconnectOnError(err) {
      return err.message.includes("READONLY");
    },
  };

  try {
    const parsed = new URL(url);
    const options: RedisOptions = {
      ...baseOptions,
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
    };
    if (parsed.password) options.password = decodeURIComponent(parsed.password);
    if (parsed.username) options.username = decodeURIComponent(parsed.username);
    if (parsed.pathname && parsed.pathname !== "/") {
      options.db = parseInt(parsed.pathname.slice(1), 10);
    }
    if (parsed.protocol === "rediss:") {
      options.tls = {};
    }
    return options;
  } catch (err) {
    logger.error({ err, url }, "[redis] Error parsing REDIS_URL");
    return baseOptions;
  }
}

// Global singleton instance for development hot reloading
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const options = getRedisOptions();
  const client = new Redis(options);
  let reconnectCount = 0;

  client.on("error", (err) => {
    if (reconnectCount <= 3) {
      logger.error({ err: err.message }, "[redis] Connection error");
    }
  });

  client.on("ready", () => {
    if (reconnectCount > 0) {
      logger.info(`[redis] Reconnected after ${reconnectCount} attempt(s)`);
    } else {
      logger.info("[redis] Connected and ready");
    }
    reconnectCount = 0;
  });

  client.on("reconnecting", () => {
    reconnectCount++;
    if (reconnectCount <= 3 || reconnectCount % 10 === 0) {
      logger.warn(`[redis] Reconnecting... (attempt ${reconnectCount})`);
    }
  });

  client.on("end", () => {
    logger.error("[redis] Connection closed / retries exhausted.");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

/**
 * Graceful shutdown helper
 */
export async function disconnectRedis(): Promise<void> {
  try {
    await redis.quit();
    logger.info("[redis] Disconnected cleanly.");
  } catch (err) {
    logger.error({ err }, "[redis] Force closing connection on error");
    redis.disconnect();
  }
}

/**
 * Quick Health Check
 */
export async function redisHealthCheck(): Promise<{ status: "healthy" | "unhealthy"; latencyMs?: number; error?: string }> {
  const start = Date.now();
  try {
    const pingPromise = redis.ping();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 2000)
    );
    await Promise.race([pingPromise, timeoutPromise]);
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

process.on("SIGTERM", disconnectRedis);
process.on("SIGINT", disconnectRedis);

export default redis;
