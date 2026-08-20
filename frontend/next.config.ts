import type { NextConfig } from "next";
import path from "path";

// Server-only — used by Next.js to proxy /api/* directly to the backend.
const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

// Detect if running inside Vercel's build environment
const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  // ── Standalone Output (Docker Only) ──────────────────────────────────────────
  // Docker needs `output: "standalone"` and `outputFileTracingRoot` to build
  // lightweight containers.
  // On Vercel, Vercel natively optimizes Next.js serverless functions, so
  // standalone mode is bypassed to prevent `next-server.js.nft.json` ENOENT conflicts.
  ...(isVercel
    ? {}
    : {
        output: "standalone",
        outputFileTracingRoot: path.join(__dirname, "../"),
      }),

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
