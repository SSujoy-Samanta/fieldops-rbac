import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  SERVICE_NAME: z.string().default("rbac-backend"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  PLATFORM_DOMAIN: z.string().default("localhost"), // e.g. 'fieldops.dev' in production, 'localhost' in dev
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "trace"]).default("info"),

  // Database & Cache
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  // JWT & Security
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_TTL: z.coerce.number().default(900), // 15 minutes in seconds
  REFRESH_TOKEN_TTL: z.coerce.number().default(604800), // 7 days in seconds

  // Google OAuth - Required
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // Email (Resend) - Required
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required").default("FieldOps Security <onboarding@resend.dev>"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;

export const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
];
