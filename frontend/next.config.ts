import type { NextConfig } from "next";
import path from "path";

// Server-only — used by Next.js to proxy /api/* directly to the backend.
const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

const nextConfig: NextConfig = {
  // ── Standalone Output (Docker Production) ────────────────────────────────────
  // Generates a self-contained `.next/standalone` bundle with only the files
  // required to run the app. Makes Docker images 10-30x smaller.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  output: "standalone",

  // ── Monorepo File Tracing Root ────────────────────────────────────────────────
  // In a pnpm workspace, Next.js must trace dependencies from the monorepo root,
  // not just the frontend/ subdirectory. Without this, the standalone output
  // may miss shared node_modules resolved via pnpm workspace symlinks.
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/outputFileTracingRoot
  outputFileTracingRoot: path.join(__dirname, "../"),

  // ── API Proxy (Same-Domain Pattern) ─────────────────────────────────────────
  // Browser calls localhost:3000/api/* → Next.js forwards to Backend (localhost:5000/api/*)
  // HttpOnly cookies flow seamlessly between client and server without CORS/domain hurdles.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
