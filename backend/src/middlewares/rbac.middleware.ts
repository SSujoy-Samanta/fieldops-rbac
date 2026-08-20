import type { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { rbacCache } from "@/lib/rbac-cache";
import type { PERMISSION_KEY, SYSTEM_ROLE } from "@/types/rbac";

/**
 * Enforces that the authenticated user's role has the required permission.
 * Uses high-performance Redis cache with sub-millisecond O(1) checks.
 * Attaches the resolved `req.rbac` context onto the Express request object.
 */
export function requirePermission(permission: PERMISSION_KEY) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, "Authentication required"));
      }

      const { granted, context } = await rbacCache.hasPermission(req.user.id, permission);

      if (!context) {
        return next(createError(401, "User not found or inactive"));
      }

      // Attach RBAC context to Express request
      req.rbac = context;

      if (!granted) {
        return next(
          createError(
            403,
            `Access Denied: Missing required permission [${permission}]`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Enforces that the user has at least one of the specified permissions.
 * Attaches `req.rbac` context onto Express request.
 */
export function requireAnyPermission(permissions: PERMISSION_KEY[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, "Authentication required"));
      }

      const { granted, context } = await rbacCache.hasAnyPermission(req.user.id, permissions);

      if (!context) {
        return next(createError(401, "User not found or inactive"));
      }

      req.rbac = context;

      if (!granted) {
        return next(
          createError(
            403,
            `Access Denied: Requires at least one permission of [${permissions.join(", ")}]`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Enforces that the user has all specified permissions.
 * Attaches `req.rbac` context onto Express request.
 */
export function requireAllPermissions(permissions: PERMISSION_KEY[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, "Authentication required"));
      }

      const { granted, context } = await rbacCache.hasAllPermissions(req.user.id, permissions);

      if (!context) {
        return next(createError(401, "User not found or inactive"));
      }

      req.rbac = context;

      if (!granted) {
        return next(
          createError(
            403,
            `Access Denied: Requires all permissions of [${permissions.join(", ")}]`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Enforces specific role(s) — useful for strict system administration routes.
 * Attaches `req.rbac` context onto Express request.
 */
export function requireRole(...roles: SYSTEM_ROLE[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(createError(401, "Authentication required"));
      }

      const { granted, context } = await rbacCache.hasRole(req.user.id, roles);

      if (!context) {
        return next(createError(401, "User not found or inactive"));
      }

      req.rbac = context;

      if (!granted) {
        return next(
          createError(
            403,
            `Access Denied: Requires one of roles [${roles.join(", ")}]`
          )
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
