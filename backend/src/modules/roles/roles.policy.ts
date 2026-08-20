import createError from "http-errors";
import { SYSTEM_ROLE, PERMISSION_KEY } from "@/types/rbac";

// ─────────────────────────────────────────────────────────────────
// ROLE POLICY ENGINE  (NIST Constrained RBAC)
//
// Single source of truth for all permission-related business rules.
// Imported by roles.service.ts — never put this logic in the service.
// ─────────────────────────────────────────────────────────────────

/**
 * Roles that are fully immutable — their permission set can never be changed via the API.
 * OWNER always holds every permission; this cannot be overridden.
 * Prevents privilege escalation attacks through the role management API.
 */
export const IMMUTABLE_ROLES = new Set<SYSTEM_ROLE>([SYSTEM_ROLE.OWNER]);

/**
 * Minimum operational permissions (floor) that can never be stripped from a role.
 *
 * ⚠️  This is NOT the same as the full default set from SYSTEM_ROLE_DEFINITIONS.
 *     Using the full defaults would make MANAGER and FIELD_EMPLOYEE effectively
 *     immutable — nothing could ever be removed. This is a curated floor:
 *     the smallest set each role MUST retain to function correctly.
 *
 * OWNER is excluded — it is already fully blocked via IMMUTABLE_ROLES.
 */
export const ROLE_MINIMUM_PERMISSIONS = new Map<SYSTEM_ROLE, Set<PERMISSION_KEY>>([
  [
    SYSTEM_ROLE.MANAGER,
    new Set([
      // Must be able to operate as an employee themselves
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
    ]),
  ],
  [
    SYSTEM_ROLE.FIELD_EMPLOYEE,
    new Set([
      // Core operational minimum — a field employee who cannot clock in is broken
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
    ]),
  ],
]);

/**
 * Maximum permission ceiling per role (NIST Constrained RBAC).
 *
 * Permissions NOT in a role's ceiling can NEVER be added to it, no matter what.
 * This is the primary defence against privilege escalation.
 *
 * 🔒 MANAGE_ROLES is OWNER-exclusive:
 *    If MANAGER were given MANAGE_ROLES, they could call PUT /roles/:managerId
 *    and assign all OWNER permissions to every manager — instant full escalation.
 *    Therefore MANAGE_ROLES must be absent from all non-OWNER ceilings.
 *
 * OWNER is excluded — it is immutable and never reaches this check.
 */
export const ROLE_CEILING_PERMISSIONS = new Map<SYSTEM_ROLE, Set<PERMISSION_KEY>>([
  [
    SYSTEM_ROLE.MANAGER,
    new Set([
      // Operational permissions a Manager can hold
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
      PERMISSION_KEY.READ_ALL_ATTENDANCE,
      PERMISSION_KEY.SAVE_VISIT,
      PERMISSION_KEY.READ_SELF_VISIT,
      PERMISSION_KEY.READ_ALL_VISIT,
      PERMISSION_KEY.MANAGE_USERS,
      // MANAGE_ROLES intentionally absent — assigning it would allow self-escalation
    ]),
  ],
  [
    SYSTEM_ROLE.FIELD_EMPLOYEE,
    new Set([
      // Field employees may only hold their own operational permissions
      PERMISSION_KEY.CLOCK_IN_OUT,
      PERMISSION_KEY.READ_SELF_ATTENDANCE,
      PERMISSION_KEY.SAVE_VISIT,
      PERMISSION_KEY.READ_SELF_VISIT,
      // READ_ALL_* and MANAGE_* intentionally absent
    ]),
  ],
]);

// ─────────────────────────────────────────────────────────────────
// VALIDATION FUNCTION
// ─────────────────────────────────────────────────────────────────

/**
 * Validates that a proposed permission set satisfies all business rules for a given role.
 * Throws a structured 400/403 error with a detailed reason on any violation.
 *
 * Rules enforced (in priority order):
 *   1. IMMUTABLE check  — OWNER role rejects all changes (403)
 *   2. FLOOR check      — minimum operational permissions cannot be stripped (400 with diff)
 *   3. CEILING check    — OWNER-exclusive permissions cannot be added to lower roles (403)
 */
export function validatePermissionUpdate(
  roleName: SYSTEM_ROLE,
  incoming: Set<PERMISSION_KEY>
): void {
  // Rule 1: OWNER role is fully immutable — reject all changes
  if (IMMUTABLE_ROLES.has(roleName)) {
    throw createError(
      403,
      `The ${roleName} role is immutable and cannot be modified. It always holds all system permissions.`
    );
  }

  // Rule 2: Minimum floor permissions must always be preserved
  const minimumRequired = ROLE_MINIMUM_PERMISSIONS.get(roleName);
  if (minimumRequired) {
    const removed: PERMISSION_KEY[] = [];
    for (const required of minimumRequired) {
      if (!incoming.has(required)) {
        removed.push(required);
      }
    }
    if (removed.length > 0) {
      throw createError(
        400,
        `Cannot remove core operational permissions from the ${roleName} role: [${removed.join(", ")}]`
      );
    }
  }

  // Rule 3: Maximum permission ceiling must not be exceeded (NIST Constrained RBAC)
  //   Prevents privilege escalation — e.g. a MANAGER gaining MANAGE_ROLES could
  //   call PUT /roles/:managerId to assign all OWNER permissions to every manager.
  const ceiling = ROLE_CEILING_PERMISSIONS.get(roleName);
  if (ceiling) {
    const exceeded: PERMISSION_KEY[] = [];
    for (const requested of incoming) {
      if (!ceiling.has(requested)) {
        exceeded.push(requested);
      }
    }
    if (exceeded.length > 0) {
      throw createError(
        403,
        `Permission ceiling violation: the ${roleName} role cannot be assigned [${exceeded.join(", ")}]. These are restricted to higher-privilege roles.`
      );
    }
  }
}
