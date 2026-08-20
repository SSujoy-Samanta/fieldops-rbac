/**
 * RBAC System Constants, Modules, Permissions, and Strongly-Typed Enums
 * Single source of truth across Backend Middleware, Services, and Seeders
 */

import { PERMISSION_MODULE, PERMISSION_KEY, SYSTEM_ROLE } from "@/generated/prisma/client";

// Re-export Prisma DB Enums as single source of truth across the entire app
export { PERMISSION_MODULE, PERMISSION_KEY, SYSTEM_ROLE };

// ─────────────────────────────────────────────────────────────────
// PERMISSION DEFINITIONS
// ─────────────────────────────────────────────────────────────────

export interface PermissionDefinition {
  key: PERMISSION_KEY;
  name: string;
  module: PERMISSION_MODULE;
  description: string;
}

export const PERMISSIONS: readonly PermissionDefinition[] = [
  // ATTENDANCE MODULE
  {
    key: PERMISSION_KEY.CLOCK_IN_OUT,
    name: "Clock In & Clock Out",
    module: PERMISSION_MODULE.ATTENDANCE,
    description: "Allows recording daily clock-in and clock-out times.",
  },
  {
    key: PERMISSION_KEY.READ_SELF_ATTENDANCE,
    name: "View Own Attendance",
    module: PERMISSION_MODULE.ATTENDANCE,
    description: "Allows viewing personal attendance history.",
  },
  {
    key: PERMISSION_KEY.READ_ALL_ATTENDANCE,
    name: "View All Team Attendance",
    module: PERMISSION_MODULE.ATTENDANCE,
    description: "Allows viewing attendance logs for all employees.",
  },

  // FIELD VISITS MODULE
  {
    key: PERMISSION_KEY.SAVE_VISIT,
    name: "Create Field Visits",
    module: PERMISSION_MODULE.VISITS,
    description: "Allows creating new customer/shop field visit logs.",
  },
  {
    key: PERMISSION_KEY.READ_SELF_VISIT,
    name: "View Own Visits",
    module: PERMISSION_MODULE.VISITS,
    description: "Allows viewing personal field visit records.",
  },
  {
    key: PERMISSION_KEY.READ_ALL_VISIT,
    name: "View All Team Visits",
    module: PERMISSION_MODULE.VISITS,
    description: "Allows viewing all field visit records across the company.",
  },

  // ROLE MANAGEMENT MODULE
  {
    key: PERMISSION_KEY.MANAGE_ROLES,
    name: "Manage Roles & Permissions",
    module: PERMISSION_MODULE.ROLES,
    description: "Allows configuring dynamic permission assignments per role.",
  },

  // USER MANAGEMENT MODULE
  {
    key: PERMISSION_KEY.MANAGE_USERS,
    name: "Manage Users",
    module: PERMISSION_MODULE.USERS,
    description: "Allows creating, editing, and managing employee accounts.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// SYSTEM ROLES & DEFAULT PERMISSIONS
// ─────────────────────────────────────────────────────────────────

export interface RoleDefinition {
  name: SYSTEM_ROLE;
  description: string;
  permissions: readonly PERMISSION_KEY[];
}

export const SYSTEM_ROLE_DEFINITIONS: readonly RoleDefinition[] = [
  {
    name: SYSTEM_ROLE.OWNER,
    description: "Full system access. Can manage roles, permissions, users, and view all operational data.",
    permissions: [
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
      PERMISSION_KEY.READ_ALL_ATTENDANCE,
      PERMISSION_KEY.SAVE_VISIT,
      PERMISSION_KEY.READ_SELF_VISIT,
      PERMISSION_KEY.READ_ALL_VISIT,
      PERMISSION_KEY.MANAGE_ROLES,
      PERMISSION_KEY.MANAGE_USERS,
    ],
  },
  {
    name: SYSTEM_ROLE.MANAGER,
    description: "Team manager. Can view all team attendance and field visits, and manage team users.",
    permissions: [
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
      PERMISSION_KEY.READ_ALL_ATTENDANCE,
      PERMISSION_KEY.SAVE_VISIT,
      PERMISSION_KEY.READ_SELF_VISIT,
      PERMISSION_KEY.READ_ALL_VISIT,
      PERMISSION_KEY.MANAGE_USERS,
    ],
  },
  {
    name: SYSTEM_ROLE.FIELD_EMPLOYEE,
    description: "Field personnel. Can clock in/out, log customer visits, and view own records.",
    permissions: [
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
      PERMISSION_KEY.SAVE_VISIT,
      PERMISSION_KEY.READ_SELF_VISIT,
    ],
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// RUNTIME RBAC CONTEXT INTERFACES
// ─────────────────────────────────────────────────────────────────

export interface CachedRoleMeta {
  roleId: string;
  roleName: SYSTEM_ROLE;
}

export interface RbacContext {
  roleId: string;
  roleName: SYSTEM_ROLE;
  permissions: PERMISSION_KEY[];
}
