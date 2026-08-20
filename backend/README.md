# FieldOps - Enterprise RBAC & Field Operations Platform (Backend)

A robust, enterprise-grade **Node.js, Express & TypeScript** backend API built for **Role-Based Access Control (RBAC)**, real-time employee attendance tracking with live shift calculations, GPS-verified customer field visit management, and high-throughput security auditing.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture & Design Patterns](#-system-architecture--design-patterns)
- [Technology Stack](#-technology-stack)
- [RBAC & Permission Engine](#-rbac--permission-engine)
- [Authentication & Security Architecture](#-authentication--security-architecture)
- [API Modules & Endpoints](#-api-modules--endpoints)
- [Database & Prisma Schema](#-database--prisma-schema)
- [Directory Structure](#-directory-structure)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)

---

## ✨ Key Features

- **🔐 NIST-Standard Role-Based Access Control**: Dynamic database-backed permission matrix with granular middleware gates (`requirePermission`) and executive owner bypass.
- **⏱️ Shift Attendance Engine**: Shift punch-in/out lifecycle, concurrency controls (1 active shift per employee), automatic duration calculations, and daily session aggregation.
- **📍 Field Visit Tracking with Shift Gate**: Log client interactions, product demos, and inspections with GPS coordinates. Non-owners are strictly required to be clocked in before recording visits.
- **👥 Staff Directory & User Lifecycle**: Account provisioning with temporary credential generation, role elevation, and account status transitions (Active, Suspended, Deactivated).
- **🛡️ OWASP-Compliant Security Pipeline**: Double-Submit Cookie CSRF protection, HttpOnly JWT cookies, single-flight token refresh, Redis-backed rate limiting, Helmet, and HPP.
- **📊 Real-Time Analytics & Telemetry**: Aggregated company-wide metrics for active on-duty personnel, deals closed, follow-up queues, and work hours.
- **🩺 Production Health & Observability**: Structured JSON logging with correlation IDs (`X-Request-Id`) and `/health` readiness probes.

---

## 🏛 System Architecture & Design Patterns

```
                                  ┌────────────────────────────────┐
                                  │      Client (Next.js App)      │
                                  └───────────────┬────────────────┘
                                                  │ (Same-Domain Proxy /api/*)
                                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   EXPRESS MIDDLEWARE PIPELINE                                   │
 ├──────────────┬──────────────────┬─────────────────┬─────────────────┬──────────────┬────────────┤
 │ Trust Proxy  │ Request Context  │ Pino HTTP Logs  │ Security Helmet │ CORS Policy  │ Cookie     │
 │ (Load Bal.)  │ (Correlation ID) │ (Structured)    │ & HPP Defense   │ & Preflight  │ Parser     │
 └──────────────┴──────────────────┴─────────────────┴─────────────────┴──────────────┴────────────┘
                                                  │
                                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                     SECURITY & GATEWAY LAYER                                    │
 ├─────────────────────────────────────────┬───────────────────────────────────────────────────────┤
 │ Redis Rate Limiter (200 req/min)        │ Double-Submit Cookie CSRF Defense (x-csrf-token)      │
 └─────────────────────────────────────────┴───────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                        MODULAR ROUTERS                                          │
 ├──────────────┬──────────────┬──────────────────┬──────────────┬────────────────┬────────────────┤
 │ /api/auth    │ /api/users   │ /api/roles       │ /api/rbac    │ /api/attendance│ /api/visits    │
 └──────────────┴──────────────┴──────────────────┴──────────────┴────────────────┴────────────────┘
                                                  │
                                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                             CONTROLLERS ➔ SERVICES ➔ REPOSITORIES                              │
 ├─────────────────────────────────────────────────────────────────────────────────────────────────┤
 │ Zod Validation ➔ Domain Business Rules ➔ Prisma ORM & Transaction Manager                       │
 └────────────────────────────────┬────────────────────────────────┬───────────────────────────────┘
                                  │                                │
                                  ▼                                ▼
                    ┌───────────────────────────┐    ┌───────────────────────────┐
                    │   PostgreSQL (Supabase)   │    │       Redis Cache         │
                    └───────────────────────────┘    └───────────────────────────┘
```

### Clean Architecture Principles
1. **Controller Layer**: Handles HTTP request parsing, Zod schema validation, status codes, and JSON response formatting.
2. **Service Layer**: Pure business logic (e.g., active shift verification before visit logging, password hashing, credential generation, duration math).
3. **Repository Layer**: Data access encapsulation utilizing Prisma Client with query optimizations and transactional consistency.

---

## 🛠 Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **Runtime** | Node.js (v20+ LTS) | Asynchronous backend runtime |
| **Framework** | Express.js 4.x | Fast, unopinionated HTTP routing framework |
| **Language** | TypeScript 5.x | Strict-mode type safety |
| **Database** | PostgreSQL | Relational data persistence with strict foreign keys and indexes |
| **ORM** | Prisma Client 6.x | Type-safe database queries and automated schema migrations |
| **Cache & Limiter** | Redis (`ioredis`) | Global/Auth/Attendance rate limiting and session caching |
| **Authentication** | JWT (`jsonwebtoken`) & Argon2 | Dual-token authentication with Argon2 password hashing |
| **Validation** | Zod | Runtime request body, query, and parameter validation |
| **Logging** | Pino & Pino-HTTP | High-performance structured JSON logging with correlation IDs |
| **Security** | Helmet, HPP, CORS, Cookie-Parser | OWASP security hardening |

---

## 🔐 RBAC & Permission Engine

### System Roles
- **`OWNER` (Executive Owner)**: Root access bypass. Possesses all permissions across the platform automatically.
- **`MANAGER` (Operations Manager)**: Administrative oversight over team attendance, customer visit reports, and user directories.
- **`FIELD_EMPLOYEE` (Field Agent)**: Scoped access for clocking in/out, recording personal customer visits, and viewing own history.

### Permission Keys (`PERMISSION_KEY`)

| Permission Key | Module | Description | Scoping |
|---|---|---|---|
| `CLOCK_IN_OUT` | `ATTENDANCE` | Start and end personal work shifts | Personal |
| `READ_SELF_ATTENDANCE` | `ATTENDANCE` | View personal shift history and live clock | Personal |
| `READ_ALL_ATTENDANCE` | `ATTENDANCE` | View company-wide attendance telemetry & reports | Organization |
| `SAVE_VISIT` | `VISITS` | Create, update, or delete personal field visits | Personal |
| `READ_SELF_VISIT` | `VISITS` | View personal field visit history | Personal |
| `READ_ALL_VISIT` | `VISITS` | View company-wide customer visit logs & analytics | Organization |
| `MANAGE_ROLES` | `ROLES` | View and edit role permission matrices | Administrative |
| `MANAGE_USERS` | `USERS` | Create users, assign roles, and toggle status | Administrative |

---

## 🛡️ Authentication & Security Architecture

### 1. Dual-Token Cookie Strategy
- **`accessToken`**: Short-lived (15 minutes), signed JWT containing user ID, email, role, and permission keys.
- **`refreshToken`**: Long-lived (7 days), stored in the database with device fingerprinting and IP tracking.
- Both tokens are delivered via `HttpOnly`, `SameSite=Lax`, `Secure` (in production) cookies.

### 2. Double-Submit CSRF Pattern
1. On initial handshake or login, the server sets a readable `csrfToken` cookie.
2. The frontend reads `csrfToken` and includes it in the `x-csrf-token` request header.
3. The `csrfProtection` middleware validates that the header matches the cookie on all mutating requests (`POST`, `PATCH`, `PUT`, `DELETE`).

### 3. Rate Limiting Protection
- **Global Rate Limit**: 200 requests / minute per IP.
- **Auth Rate Limit**: 10 login / register attempts per 15 minutes per IP.
- **Attendance & Visits Rate Limit**: 30 requests / minute to prevent automated punching scripts.

---

## 🚀 API Modules & Endpoints

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Guard |
|---|---|---|---|
| `POST` | `/api/auth/login` | Email & password login (issues access & refresh cookies) | Public |
| `GET` | `/api/auth/oauth/state` | Generates Google OAuth authorization URL and CSRF state | Public |
| `POST` | `/api/auth/google` | Exchanges Google OAuth code for authenticated session | Public |
| `POST` | `/api/auth/refresh` | Single-flight refresh rotation for expired access tokens | Refresh Cookie |
| `POST` | `/api/auth/logout` | Revokes refresh session and clears all authentication cookies | Authenticated |
| `GET` | `/api/auth/me` | Returns current user profile, role, and active permissions | Authenticated |
| `GET` | `/api/auth/csrf` | Generates a fresh CSRF token cookie | Public |

### 2. User Directory & Accounts (`/api/users`)
| Method | Endpoint | Description | Guard |
|---|---|---|---|
| `GET` | `/api/users` | Paginated user list with role & status filters | `MANAGE_USERS` |
| `POST` | `/api/users` | Provision new staff member with temporary password | `MANAGE_USERS` |
| `GET` | `/api/users/:id` | Get detailed user profile | `MANAGE_USERS` |
| `PATCH` | `/api/users/:id` | Update profile information | `MANAGE_USERS` |
| `PATCH` | `/api/users/:id/role` | Update assigned role (with privilege elevation guard) | `MANAGE_USERS` |
| `PATCH` | `/api/users/:id/status`| Toggle user status (`ACTIVE`, `SUSPENDED`, `DEACTIVATED`)| `MANAGE_USERS` |

### 3. Role & Permission Management (`/api/roles` & `/api/rbac`)
| Method | Endpoint | Description | Guard |
|---|---|---|---|
| `GET` | `/api/roles` | List all system roles and their assigned permission keys | `MANAGE_ROLES` |
| `GET` | `/api/permissions` | List all available system permissions grouped by module | `MANAGE_ROLES` |
| `POST` | `/api/roles/:id/permissions` | Assign or remove permissions from a role | `MANAGE_ROLES` |
| `GET` | `/api/rbac/matrix` | Full interactive permissions matrix | `MANAGE_ROLES` |

### 4. Shift Attendance (`/api/attendance`)
| Method | Endpoint | Description | Guard |
|---|---|---|---|
| `POST` | `/api/attendance/clock-in` | Punch in to start shift (records timestamp & notes) | `CLOCK_IN_OUT` |
| `POST` | `/api/attendance/clock-out`| End shift (calculates duration, updates remarks) | `CLOCK_IN_OUT` |
| `GET` | `/api/attendance/today` | Current shift status, open duration, daily total | `READ_SELF_ATTENDANCE` |
| `GET` | `/api/attendance/my-history` | Personal paginated attendance logs | `READ_SELF_ATTENDANCE` |
| `GET` | `/api/attendance/team` | Company-wide attendance logs with staff metadata | `READ_ALL_ATTENDANCE` |
| `GET` | `/api/attendance/team-stats` | Organization KPI metrics (hours, on-duty count) | `READ_ALL_ATTENDANCE` |

### 5. Customer Field Visits (`/api/visits`)
| Method | Endpoint | Description | Guard |
|---|---|---|---|
| `POST` | `/api/visits` | Record customer visit (Requires active clock-in) | `SAVE_VISIT` |
| `PATCH` | `/api/visits/:id` | Update visit details (Customer, purpose, outcome, notes)| `SAVE_VISIT` |
| `DELETE` | `/api/visits/:id` | Permanently delete visit record | `SAVE_VISIT` |
| `GET` | `/api/visits/my-history` | Personal paginated visit logs | `READ_SELF_VISIT` |
| `GET` | `/api/visits/team` | Company-wide field visit logs | `READ_ALL_VISIT` |
| `GET` | `/api/visits/team-stats` | Aggregated visit metrics (Deals closed, follow-ups)| `READ_ALL_VISIT` |
| `GET` | `/api/visits/:id` | Single visit detail with full audit metadata | `READ_SELF_VISIT` |

---

## 🗄 Database & Prisma Schema

The data model is defined in `prisma/schema.prisma`:

- **`User`**: Account identity, credentials, Google OAuth ID, role relation, active flags.
- **`Role` & `Permission`**: Relational junction table `RolePermission` for $M:N$ mapping.
- **`AuthSession` & `RefreshToken`**: Device, IP, expiry, and revocation tracking.
- **`Attendance`**: Shift logs tracking `clockIn`, `clockOut`, `durationMinutes`, `locationNotes`, and `status`.
- **`Visit`**: Customer visits tracking `customerName`, `purpose`, `outcome`, `address`, and `notes`.

---

## 📂 Directory Structure

```text
backend/
├── prisma/
│   ├── schema.prisma           # Prisma data model & database schema definition
│   └── seed.ts                 # Database seeder (Roles, Permissions, Admin User)
├── src/
│   ├── config/                 # Environment validation (Zod) & configuration
│   ├── generated/prisma/       # Generated Prisma Client output
│   ├── lib/                    # Core singletons (prisma, redis, logger)
│   ├── middlewares/            # Auth guards, RBAC, CSRF, rate-limit, error handler
│   │   ├── auth.middleware.ts  # JWT verification & session loader
│   │   ├── rbac.middleware.ts  # requirePermission() & role evaluation
│   │   ├── csrf.middleware.ts  # Double-submit cookie verification
│   │   ├── rate-limit.ts       # Redis-backed distributed rate limiters
│   │   └── error.middleware.ts # Centralized RFC 7807 error handler
│   ├── modules/                # Feature-sliced domain modules
│   │   ├── auth/               # Authentication controllers, services, routes
│   │   ├── users/              # User management & account operations
│   │   ├── roles/              # Role management & permissions matrix
│   │   ├── permissions/        # System permission definitions
│   │   ├── attendance/         # Shift tracking & organization telemetry
│   │   ├── visits/             # Field visits, GPS logging & analytics
│   │   └── health/             # Health check & system diagnostics
│   ├── routes/                 # Root API router assembling all modules
│   ├── types/                  # TypeScript interface declarations & Express extensions
│   ├── utils/                  # Cryptography, JWT tokens, response helpers
│   ├── app.ts                  # Express application factory & middleware pipeline
│   └── index.ts                # HTTP server bootstrap & graceful shutdown
├── .dockerignore               # Docker exclusions
├── .env.example                # Environment variables template
├── package.json                # Dependencies and build scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Runtime environment | `development` / `production` |
| `FRONTEND_URL` | Trusted frontend origin for CORS | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/fieldops` |
| `REDIS_URL` | Redis cache connection string | `redis://localhost:6379` |
| `JWT_SECRET` | 32+ character secure secret for JWT signing | `your-secure-jwt-secret-key-32-chars` |
| `JWT_ACCESS_TTL` | Access token lifespan in seconds | `900` (15 mins) |
| `REFRESH_TOKEN_TTL`| Refresh token lifespan in seconds | `604800` (7 days) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `*.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| Google OAuth Client Secret | `GOCSPX-*` |

---

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher
- **PostgreSQL**: PostgreSQL 15+ database instance
- **Redis**: Redis 6+ instance (optional in development, recommended)

### 2. Installation
```bash
pnpm install
```

### 3. Database Migration & Seeding
```bash
pnpm prisma db push
pnpm prisma db seed
```

---

## 🧪 Seeded Test Accounts & Credentials

The database seeder (`prisma/seed.ts`) provisions three accounts covering each role tier:

| Role | Name | Email | Password | Access Privileges |
|---|---|---|---|---|
| 👑 **Executive Owner** | Sujoy Samanta | `owner@fieldops.dev` | `Owner@1234` | **Full Root Matrix Access** (All routes, permissions & user management) |
| 🛡️ **Operations Manager** | Rajesh Kumar | `manager@fieldops.dev` | `Manager@1234` | Staff Directory, Team Attendance, Team Field Visits & CSV Exports |
| 👷 **Field Employee** | Priya Sharma | `employee@fieldops.dev` | `Employee@1234` | Personal Shift Clock In/Out, Personal Attendance & Field Visit Logging |

---

### 4. Start Development Server
```bash
pnpm dev
```
The API will be available at [http://localhost:5000](http://localhost:5000).

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts development server with hot-reloading |
| `pnpm build` | Compiles TypeScript source to production `dist/` bundle |
| `pnpm start` | Runs the compiled production server (`dist/index.js`) |
| `pnpm prisma generate` | Generates typed Prisma Client |
| `pnpm prisma db push` | Syncs Prisma schema directly with the database |
| `pnpm prisma db seed` | Seeds default roles, permissions, and test accounts |

---

## 📖 Navigation & Documentation Links

- [**Root Monorepo Documentation**](../README.md): Architecture overview, monorepo scripts, and quickstart setup.
- [**Frontend Application Documentation**](../frontend/README.md): Next.js App Router, React Query cache strategy, and UI components.
