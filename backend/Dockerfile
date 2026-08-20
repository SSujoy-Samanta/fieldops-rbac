# ==============================================================================
# Backend Dockerfile — Multi-Stage Build (pnpm Workspace Monorepo)
# ==============================================================================
# Build from monorepo root (ALWAYS build from root, not from backend/):
#   docker build -f backend/Dockerfile -t fieldops-backend .
# Run:
#   docker run -p 5000:5000 --env-file ./backend/.env fieldops-backend
# ==============================================================================

# ── Stage 1: Base ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
# corepack is the official Node.js pnpm manager (no npm install -g needed)
RUN corepack enable && corepack prepare pnpm@10 --activate

WORKDIR /app

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM base AS builder

# Copy monorepo workspace configuration & lockfile FIRST for layer cache.
# Only re-runs pnpm install when these files change — not on every src change.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma

# Install backend-only deps using pnpm workspace filter.
# --filter backend... = backend + any workspace packages it depends on.
# BuildKit cache mount prevents re-downloading from registry on every build.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter backend...

# Copy full backend source BEFORE prisma generate.
# IMPORTANT: prisma generate outputs to src/generated/prisma/.
# If we generate BEFORE COPY, the COPY would overwrite the generated files!
COPY backend ./backend

# Generate Prisma Client (reads schema.prisma → emits typed client to src/generated/prisma/)
RUN pnpm --filter backend exec prisma generate

# Compile TypeScript → dist/ using tsup
RUN pnpm --filter backend build

# ── Stage 3: Production Runner ─────────────────────────────────────────────────
FROM base AS runner

ENV NODE_ENV=production

# Create a non-root system user for security (never run as root in production)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs fieldops

WORKDIR /app

# Copy manifests for production-only install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma

# Install PRODUCTION-only dependencies (no devDependencies = smaller image)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter backend...

# Prisma Client must also be generated in runner (runtime needs query engine)
RUN pnpm --filter backend exec prisma generate

# Copy compiled dist from builder stage (TypeScript → plain JS)
COPY --from=builder /app/backend/dist ./backend/dist

# Transfer ownership BEFORE switching user
RUN chown -R fieldops:nodejs /app

USER fieldops

# Set working dir to backend so `node dist/index.js` resolves correctly
WORKDIR /app/backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/index.js"]
