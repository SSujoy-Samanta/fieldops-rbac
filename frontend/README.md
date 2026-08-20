# FieldOps - Enterprise RBAC & Field Operations Platform (Frontend)

A state-of-the-art **Next.js 16 (App Router)** enterprise web application built for **Role-Based Access Control (RBAC)**, real-time employee attendance tracking with live shift clocks, GPS-verified customer field visit management, and team-wide audit intelligence.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Architecture & Design System](#-architecture--design-system)
- [Technology Stack](#-technology-stack)
- [Security & Authentication Architecture](#-security--authentication-architecture)
- [Directory Structure](#-directory-structure)
- [Core Application Modules](#-core-application-modules)
- [State Management & React Query Strategy](#-state-management--react-query-strategy)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)

---

## ✨ Key Features

- **🔐 Granular NIST-Standard RBAC**: Dynamic permission matrix with real-time route guarding (`RequirePermission`) and contextual UI element permissions (`usePermissions`).
- **⏱️ Real-Time Shift Tracking**: Live elapsed-time ticker for active shifts, punch in / clock-out modals with location notes, daily session summaries, and CSV exports.
- **📍 GPS-Enabled Customer Field Visits**: Log field interactions with browser geolocation auto-detection, active shift validation checks, and customer outcome analytics.
- **👥 Enterprise Staff & Role Management**: Staff directory with credential generation, role elevation (Executive Owner, Operations Manager, Field Employee), and status toggles.
- **📊 Team Intelligence & Telemetry**: Company-wide dashboards for attendance and field visits with interactive KPI metric cards, multi-tier filters, and CSV downloads.
- **🌓 Premium Glassmorphism UI**: Curated dark/light theme tokens, Google Fonts (`Urbanist`, `Righteous`), micro-animations, and fluid responsive grid layouts.

---

## 🏛 Architecture & Design System

### 1. Same-Domain Proxy Pattern
The frontend avoids cross-origin cookie blockers by configuring Next.js rewrites in `next.config.ts`. All client requests target `/api/*`, which Next.js securely forwards to the Express backend (`http://localhost:5000`). This ensures `HttpOnly`, `SameSite=Lax` cookies flow transparently.

### 2. Dual-Layer Token Security
- **Access & Refresh Tokens**: Managed inside secure, `HttpOnly` cookies.
- **CSRF Token**: Read from cookies and passed in the `x-csrf-token` header for all state-mutating requests (`POST`, `PATCH`, `PUT`, `DELETE`).

### 3. Single-Flight Token Refresh Queue
When an API request receives a `401 Unauthorized`, the Axios interceptor queues concurrent requests, initiates a single refresh handshake with `/api/v1/auth/refresh`, updates credentials, and transparently replays queued requests without session interruption.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router, React Server & Client Components) |
| **Language** | TypeScript (Strict mode, zero `any` policy) |
| **Styling** | Tailwind CSS v4, Vanilla CSS Custom Tokens, `next-themes` (Dark/Light) |
| **Typography** | Google Fonts (`Urbanist` for body/headings, `Righteous` for brand identity) |
| **Icons** | Lucide React |
| **Server State & Cache** | TanStack React Query v5 (Optimistic cache updates, query invalidation) |
| **HTTP Client** | Axios with custom double-submit CSRF interceptors and normalized `ApiError` |
| **UI Components** | Radix UI primitives, Sonner toasts, Date-fns |
| **Package Manager** | `pnpm` |

---

## 📂 Directory Structure

```text
frontend/
├── public/                     # Static assets, SVG icons, favicons
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── (auth)/             # Authentication route group
│   │   │   ├── login/          # Login page with Google OAuth & password auth
│   │   │   ├── forgot-password/# Password recovery request
│   │   │   └── reset-password/ # Password reset confirmation
│   │   ├── (dashboard)/        # Protected workspace route group
│   │   │   ├── overview/       # Executive command center & live pulse
│   │   │   ├── roles/          # Role & permission matrix editor
│   │   │   ├── users/          # User directory & account management
│   │   │   ├── attendance/     # Personal shift punch-in & history
│   │   │   ├── team-attendance/# Organization-wide attendance telemetry
│   │   │   ├── visits/         # Personal field visit logs & logging modal
│   │   │   └── team-visits/    # Company-wide field visit reports
│   │   ├── auth/google/callback# OAuth authentication handshake handler
│   │   ├── globals.css         # Design system tokens, glassmorphism utilities
│   │   └── layout.tsx          # Root layout with font and provider injection
│   ├── components/             # Reusable UI & domain feature components
│   │   ├── attendance/         # Attendance filters, tables, clock-out modals
│   │   ├── auth/               # LoginForm, OAuthButtons, AuthLayout
│   │   ├── dashboard/          # Sidebar, Navbar, UserMenu, Breadcrumbs
│   │   ├── roles/              # Permission matrix table, role badge pill
│   │   ├── team-attendance/    # Team filters, live on-duty cards, logs table
│   │   ├── team-visits/        # Team visit cards, filters, team visit table
│   │   ├── ui/                 # Atomic UI primitives (Button, Dialog, Input, etc.)
│   │   ├── users/              # UserTable, CreateUserModal, RoleModal, StatusModal
│   │   ├── visits/             # VisitStats, VisitFilters, Create/Edit/Delete modals
│   │   └── RequirePermission.tsx# Declarative RBAC permission gate component
│   ├── hooks/                  # Custom React Query & business logic hooks
│   │   ├── useAttendance.ts    # Punch in/out, shift timer, attendance history
│   │   ├── useAuth.ts          # Login, logout, session bootstrap, password reset
│   │   ├── useDebounce.ts      # Input debounce utility
│   │   ├── usePermissions.ts   # Client-side permission evaluation engine
│   │   ├── useRoles.ts         # Roles list & permission matrix mutations
│   │   ├── useUsers.ts         # User list, create, update role, update status
│   │   └── useVisits.ts        # Self/team visits, stats, CRUD with cache sync
│   ├── lib/
│   │   ├── api/                # API client modules (auth, users, roles, attendance, visits)
│   │   ├── query-keys.ts       # Centralized React Query key factories
│   │   └── utils.ts            # Class name merger (`cn`) and string formatters
│   ├── providers/              # React Query, NextThemes, and Auth providers
│   └── types/                  # TypeScript domain models, RBAC enums, and API types
├── .env                        # Local development environment configuration
├── .env.example                # Environment variables template for team setup
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Git tracking rules
├── next.config.ts              # Next.js API rewrite proxy rules
├── package.json                # Project dependencies and script declarations
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🚀 Core Application Modules

### 1. 🛡️ Roles & Permissions (`/roles`)
- Dynamic 8-category permissions matrix (`USER_MANAGEMENT`, `ATTENDANCE_SELF`, `ATTENDANCE_ALL`, `CUSTOMER_VISITS_SELF`, `CUSTOMER_VISITS_ALL`, `RBAC_MANAGEMENT`, `REPORTS_EXPORT`, `AUDIT_LOGS`).
- Visual badges for Executive Owner, Operations Manager, and Field Employee.
- Guarded by `RequirePermission(PERMISSION_KEY.MANAGE_ROLE_PERMISSIONS)`.

### 2. 👥 User Management (`/users`)
- Search by name/email, filter by role (Owner, Manager, Field Employee) and status (Active, Suspended, Deactivated).
- Provision new members with auto-generated temporary passwords and one-click copy.
- Role elevation and account status modification dialogs with instant in-memory cache synchronization.

### 3. ⏱️ Personal Shift & Attendance (`/attendance`)
- Live **Active Shift Elapsed Timer** tracking hours and minutes in real-time.
- **Punch In / Clock Out** flow capturing timestamp, site address, and checkout remarks.
- 4-column KPI cards and paginated history table with CSV export.

### 4. 🏢 Team Attendance Telemetry (`/team-attendance`)
- Aggregated organization metrics: Total Work Hours, Active On-Duty Personnel, Completed Shifts, and Average Hours.
- Real-time pulse cards showing currently clocked-in staff members.
- Advanced filtering by role, status, timeframe presets, and full-spectrum CSV export.

### 5. 📍 Customer Field Visits (`/visits`)
- Record client meetings, product demos, routine inspections, maintenance, and order collections.
- **GPS Auto-Detection**: One-click browser geolocation retrieval attaching exact coordinates (`±accuracy`).
- **Operational Shift Gate**: Automatically checks shift status; non-owners must be actively clocked in before saving visits.
- Complete CRUD: View detailed log metadata, edit records, and delete with confirmation.

### 6. 🌐 Team Field Visits (`/team-visits`)
- Company-wide field log dashboard with employee avatars, role pills, purpose icons, and outcome tags (`Completed`, `Deal Closed`, `Follow-up Required`, `Rescheduled`, `No Show`).
- Metrics breakdown for total visits, deals closed rate, active field agents, and follow-ups.

---

## ⚡ State Management & React Query Strategy

All mutations implement **instant zero-latency cache updates** alongside background server synchronization:

```typescript
// Example: Instant Prepend in useCreateVisit
queryClient.setQueriesData({ queryKey: queryKeys.visits.all }, (old) => {
  if (!old || !Array.isArray(old.visits)) return old;
  return {
    ...old,
    visits: [newVisit, ...old.visits],
    pagination: { ...old.pagination, total: old.pagination.total + 1 },
  };
});

// Sync detail cache
queryClient.setQueryData(["visits", "detail", newVisit.id], newVisit);

// Invalidate in background for eventual consistency & recalculations
queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend Express server URL (used by Next.js rewrites) | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_URL` | Frontend public URL (used for OAuth redirects & SEO) | `http://localhost:3000` |

---

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher
- Running backend service on `http://localhost:5000`

### 2. Installation
```bash
pnpm install
```

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Seeded Test Accounts & Credentials

The application comes pre-seeded with test accounts for each role tier:

| Role | Name | Email | Password | What You Can Test |
|---|---|---|---|---|
| 👑 **Executive Owner** | Sujoy Samanta | `owner@fieldops.dev` | `Owner@1234` | Full Matrix, Role permissions editor, User provisioning, Status toggles |
| 🛡️ **Operations Manager** | Rajesh Kumar | `manager@fieldops.dev` | `Manager@1234` | Staff Directory, Team Attendance Telemetry, Team Field Visits & CSV Exports |
| 👷 **Field Employee** | Priya Sharma | `employee@fieldops.dev` | `Employee@1234` | Shift Punch In/Out, Live Shift Clock, Personal Attendance, Customer Field Visits |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Next.js development server with Turbopack on port 3000 |
| `pnpm build` | Compiles the production bundle and validates all dynamic routes |
| `pnpm start` | Starts the production server |
| `pnpm lint` | Runs ESLint 9 across all TypeScript and TSX files |
| `pnpm tsc --noEmit` | Validates TypeScript types across the entire project |

---

## 🔒 Security Best Practices Implemented

- **XSS Mitigation**: Strict sanitization and React JSX escaping across all user inputs.
- **CSRF Defense**: Double-submit cookie pattern integrated into Axios request interceptors.
- **Token Shielding**: JWT access/refresh credentials reside exclusively in `HttpOnly`, `SameSite=Lax` cookies.
- **NIST Least Privilege**: Client-side UI gates (`RequirePermission`) backed by server-side middleware enforcement.

---

## 📖 Navigation & Documentation Links

- [**Root Monorepo Documentation**](../README.md): Architecture overview, monorepo scripts, and quickstart setup.
- [**Backend API Documentation**](../backend/README.md): REST endpoint reference table, database schema, and middleware pipeline.
