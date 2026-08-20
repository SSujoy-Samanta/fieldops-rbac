import type { Request } from "express";
import { getIP } from "./getIP";
import type { SYSTEM_ROLE } from "@/types/rbac";

export interface AuditActor {
  id: string; // userId or 'anonymous'
  userId?: string;
  role?: SYSTEM_ROLE;
  ip: string;
  userAgent?: string;
}

/**
 * Extracts audit actor metadata (id, userId, role, ip, userAgent) from the incoming request.
 * If user is authenticated via middleware, uses req.user.id and req.rbac.roleName.
 */
export function extractAuditActor(req: Request, fallbackId = "anonymous"): AuditActor {
  return {
    id: req.user?.id || fallbackId,
    userId: req.user?.id,
    role: req.rbac?.roleName,
    ip: getIP(req),
    userAgent: req.headers["user-agent"] as string | undefined,
  };
}

export default extractAuditActor;
