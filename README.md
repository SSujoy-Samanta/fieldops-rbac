# FieldOps - Enterprise RBAC & Field Operations Platform

A complete, production-ready full-stack TypeScript platform for **Role-Based Access Control (RBAC)**, real-time employee attendance tracking with live shift timers, GPS-verified customer field visit management, and high-throughput security auditing.

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Monorepo Structure](#-monorepo-structure)
- [Core Platform Capabilities](#-core-platform-capabilities)
- [Technology Stack](#-technology-stack)
- [🧪 Seeded Test Accounts & Credentials](#-seeded-test-accounts--credentials)
- [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
- [Monorepo Scripts Reference](#-monorepo-scripts-reference)
- [Security & Authentication Architecture](#-security--authentication-architecture)
- [Subsystem Deep Dives](#-subsystem-deep-dives)

---

## 🏛 Overview & Architecture

FieldOps is architected as a clean, high-performance monorepo separating a **Next.js 16 App Router frontend** from an **Express.js & TypeScript modular backend**, backed by **PostgreSQL (Prisma ORM)** and **Redis**.

```
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                               FRONTEND: Next.js 16 (App Router)                        │
 │  • Turbopack Engine        • Tailwind CSS v4 Glassmorphism    • TanStack React Query  │
 │  • Same-Domain API Proxy   • Double-Submit CSRF Interceptors  • Dynamic RBAC Gates    │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │  /api/* (Proxy Rewrites)
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │                             BACKEND: Express.js & TypeScript API                       │
 │  • Trust Proxy & Correlation IDs          • Structured Pino HTTP Logging               │
 │  • Helmet & HPP Security Hardening        • Redis-Backed Distributed Rate Limiting     │
 │  • Dual-Token HttpOnly Auth Engine        • Zod Validation & Domain Business Services  │
 └─────────────────────────────────────┬──────────────────┬───────────────────────────────┘
                                       │                  │
                                       ▼                  ▼
                    ┌────────────────────────────┐      ┌────────────────────────────┐
                    │   PostgreSQL (Prisma ORM)  │      │     Redis Cache & Limits   │
                    │  • Users & RBAC Matrix     │      │  • Rate Limiting Buckets   │
                    │  • Shifts & Attendances    │      │  • Active Session Caching  │
                    │  • Customer Field Visits   │      │  • Token Blacklists        │
                    └────────────────────────────┘      └────────────────────────────┘
```

---

## 📂 Monorepo Structure

```text
RBAC/
├── backend/                    # Express.js, TypeScript & Prisma REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema & relation mappings
│   │   └── seed.ts             # Seed script (Roles, Permissions, Test Accounts)
│   ├── src/
│   │   ├── config/             # Zod environment variable parsing
│   │   ├── middlewares/        # Auth, RBAC, CSRF, Rate Limiting, Error handling
│   │   ├── modules/            # Feature modules (auth, users, roles, attendance, visits)
│   │   ├── routes/             # Root API routing router
│   │   ├── services/           # Core business logic layer
│   │   └── app.ts              # Express application factory
│   ├── .dockerignore           # Backend container exclusions
│   ├── .env.example            # Backend environment template
│   └── package.json            # Backend dependencies
│
├── frontend/                   # Next.js 16 App Router Client Application
│   ├── src/
│   │   ├── app/                # App Router pages ((auth), (dashboard), /api proxy)
│   │   ├── components/         # Feature components (attendance, visits, roles, users)
│   │   ├── hooks/              # React Query hooks with optimistic cache updates
│   │   ├── lib/api/            # Typed Axios API clients with CSRF headers
│   │   └── types/              # Domain interfaces, RBAC enums & DTOs
│   ├── .dockerignore           # Frontend container exclusions
│   ├── .env.example            # Frontend environment template
│   ├── next.config.ts          # API rewrite proxy configuration
│   └── package.json            # Frontend dependencies
│
├── .dockerignore               # Monorepo root container exclusions
├── .gitignore                  # Workspace Git tracking rules
├── package.json                # Monorepo orchestration scripts
└── pnpm-workspace.yaml         # pnpm workspace package definitions
```

---

## ✨ Core Platform Capabilities

### 1. 🛡️ NIST-Standard Role-Based Access Control
- **Dynamic 8-Category Permission Matrix**: Real-time permission evaluation on both client (`RequirePermission`, `usePermissions`) and server (`requirePermission`).
- **Executive Owner Bypass**: `OWNER` role possesses root access across all routes and operations.
- **Self vs. All Scoping**: Differentiates personal record operations (`READ_SELF_ATTENDANCE`, `READ_SELF_VISIT`) from company-wide telemetry (`READ_ALL_ATTENDANCE`, `READ_ALL_VISIT`).

### 2. ⏱️ Shift Attendance & Live Clock
- **Live Active Shift Timer**: Real-time ticker calculating hours and minutes worked during open shifts.
- **Shift Punch In / Clock Out**: Captures timestamp, location notes, and auto-computes session duration in minutes.
- **Company Telemetry**: Real-time on-duty pulse feed, daily hours breakdown, and full-spectrum CSV export.

### 3. 📍 GPS-Verified Field Visits with Shift Gate
- **Client Interaction Logging**: Routine inspections, product demos, maintenance, order collections, and client meetings.
- **GPS Auto-Detection**: One-click geolocation capture attaching verified coordinates (`±accuracy`).
- **Operational Shift Compliance**: Non-owners must be actively clocked in before recording visits; forms automatically lock with a direct link to punch in.

### 4. 👥 Enterprise Staff Management
- Search, filter by role/status, provision new staff with temporary credentials, copy to clipboard, and modify roles or statuses (`Active`, `Suspended`, `Deactivated`).

---

## 🛠 Technology Stack

| Domain | Backend | Frontend |
|---|---|---|
| **Framework** | Express.js 4.x | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5.x (Strict) | TypeScript 5.x (Strict) |
| **Database / ORM** | PostgreSQL + Prisma 6.x | — |
| **Caching & Limits**| Redis (`ioredis`) | TanStack React Query v5 |
| **Styling** | — | Tailwind CSS v4, Glassmorphism, CSS Tokens |
| **Authentication** | JWT (`jsonwebtoken`) + Argon2/bcrypt | HttpOnly Cookies + CSRF Double-Submit |
| **Icons & Typography**| — | Lucide React, Google Fonts (`Urbanist`, `Righteous`) |
| **Validation** | Zod Runtime Schemas | TypeScript Strict Contracts |
| **Package Manager** | `pnpm` (Workspace Monorepo) | `pnpm` (Workspace Monorepo) |

---

## 🧪 Seeded Test Accounts & Credentials

The repository includes pre-seeded test accounts for testing each role hierarchy:

| Role | Name | Email | Password | Access Privileges |
|---|---|---|---|---|
| 👑 **Executive Owner** | Sujoy Samanta | `owner@fieldops.dev` | `Owner@1234` | **Full Root Matrix Access** (All routes, permissions & user management) |
| 🛡️ **Operations Manager** | Rajesh Kumar | `manager@fieldops.dev` | `Manager@1234` | Staff Directory, Team Attendance, Team Field Visits & CSV Exports |
| 👷 **Field Employee** | Priya Sharma | `employee@fieldops.dev` | `Employee@1234` | Personal Shift Clock In/Out, Personal Attendance & Field Visit Logging |

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher (`npm install -g pnpm`)
- **PostgreSQL**: PostgreSQL 15+ database instance (or Supabase / Neon connection)
- **Redis**: Redis 6+ instance (optional for local development, recommended)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/SSujoy-Samanta/fieldops-rbac.git
cd fieldops-rbac

# Install all monorepo dependencies
pnpm install
```

### 3. Configure Environment Variables

#### A. Backend Configuration (`backend/.env`)
```bash
cp backend/.env.example backend/.env
```
Fill in your database and security credentials in `backend/.env`:
```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/fieldops?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secure-jwt-secret-key-at-least-32-chars"
JWT_ACCESS_TTL=900
REFRESH_TOKEN_TTL=604800
```

#### B. Frontend Configuration (`frontend/.env`)
```bash
cp frontend/.env.example frontend/.env
```
Ensure the API URL points to the backend:
```dotenv
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to PostgreSQL
pnpm --filter backend prisma db push

# Seed system roles, permissions, and test accounts
pnpm seed
```

### 5. Launch the Development Environment
Run both backend (port 5000) and frontend (port 3000) concurrently:
```bash
pnpm dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend
pnpm dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser and log in with any test account!

---

## 📜 Monorepo Scripts Reference

| Command | Description |
|---|---|
| `pnpm dev` | Starts both frontend and backend concurrently in parallel |
| `pnpm dev:backend` | Starts the Express backend development server with hot-reload |
| `pnpm dev:frontend` | Starts the Next.js development server with Turbopack |
| `pnpm build` | Compiles production bundles for both backend and frontend |
| `pnpm seed` | Seeds default roles, permissions, and demo users |
| `pnpm lint` | Runs ESLint 9 across all frontend and backend code |
| `pnpm typecheck` | Validates TypeScript types across the entire monorepo |

---

## 🔒 Security & Authentication Architecture

1. **Same-Domain Proxy Pattern**: Next.js rewrites forward browser `/api/*` calls directly to the Express backend, allowing secure `HttpOnly` session cookies to flow naturally without cross-origin complications.
2. **Double-Submit Cookie CSRF Defense**: Mutating endpoints require an `x-csrf-token` header that matches the active `csrfToken` cookie.
3. **Single-Flight Token Refresh**: Transparently catches `401 Unauthorized` responses, queues pending concurrent requests, executes a single refresh handshake, and replays queued requests.
4. **Argon2 / Bcrypt Password Hashing**: Passwords are salted and hashed using modern cryptographic standards.
5. **Tiered Rate Limiting**: Distributed Redis token buckets protect login endpoints (10 attempts / 15 mins) and shift punching (30 requests / min).

---

## 📖 Subsystem Deep Dives

- [**Frontend Documentation**](./frontend/README.md): Detailed App Router layout, React Query cache invalidations, and UI design tokens.
- [**Backend Documentation**](./backend/README.md): Complete REST endpoint reference table, Prisma ORM indexes, and Express middleware chain.
