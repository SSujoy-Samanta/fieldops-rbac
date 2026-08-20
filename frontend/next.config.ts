import type { NextConfig } from "next";

// Server-only — used by Next.js to proxy /api/* directly to the backend.
const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

const nextConfig: NextConfig = {
  // ── API Proxy (Same-Domain Pattern) ─────────────────────────────────────────
  // Browser calls localhost:3000/api/* → Next.js forwards to Backend (localhost:5000/api/*).
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
