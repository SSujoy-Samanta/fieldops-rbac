# ==============================================================================
# Frontend Dockerfile — Next.js 16 Standalone (pnpm Workspace Monorepo)
# ==============================================================================
# Build from monorepo root (ALWAYS build from root, not from frontend/):
#   docker build -f frontend/Dockerfile -t fieldops-frontend \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
#     --build-arg NEXT_PUBLIC_APP_URL=https://yourdomain.com .
# Run:
#   docker run -p 3000:3000 fieldops-frontend
# ==============================================================================

# ── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
# corepack is the official Node.js pnpm manager (no npm install -g needed)
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# ── Stage 2: Dependencies ─────────────────────────────────────────────────────
FROM base AS deps

# Copy root workspace manifests & frontend package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/

# Install frontend-only deps with BuildKit store cache
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter frontend...

# ── Stage 3: Builder ──────────────────────────────────────────────────────────
FROM base AS builder

# NEXT_PUBLIC_ vars MUST be set at build time — they are baked into
# the client-side JS bundle by Next.js and cannot be changed at runtime.
ARG NEXT_PUBLIC_API_URL=http://localhost:5000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Restore root node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Restore frontend node_modules from deps stage
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy full frontend source
COPY frontend ./frontend

# Run Next.js 16 production build → emits to frontend/.next/standalone
RUN pnpm --filter frontend build

# ── Stage 4: Production Runner ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

WORKDIR /app

# ── IMPORTANT: In a monorepo, Next.js standalone output is placed at:
#   frontend/.next/standalone/frontend/  (includes server.js at that level)
#   Copy it so server.js is at /app/server.js (root of WORKDIR)
# BUG FIX: Do NOT copy from /app/frontend/.next/standalone/ directly to ./
#   because in monorepo mode Next.js nests the output under the package name.
COPY --from=builder /app/frontend/.next/standalone ./
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public

# Transfer ownership before switching to non-root user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => r.statusCode < 500 ? process.exit(0) : process.exit(1))"

# Next.js standalone server entry point
# In monorepo mode, server.js lives at: /app/frontend/server.js
CMD ["node", "frontend/server.js"]
