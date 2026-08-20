import { Router } from "express";
import { attendanceController } from "./attendance.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requirePermission } from "@/middlewares/rbac.middleware";
import { validateBody, validateQuery } from "@/middlewares/validate.middleware";
import {
  clockInSchema,
  clockOutSchema,
  selfAttendanceQuerySchema,
  teamAttendanceQuerySchema,
  teamStatsQuerySchema,
} from "./attendance.schemas";
import { PERMISSION_KEY } from "@/types/rbac";

export const attendanceRouter: Router = Router();

// All attendance endpoints require authentication
attendanceRouter.use(authenticate);

// ─────────────────────────────────────────────────────────────────
// OPERATIONAL ENDPOINTS — CLOCK_IN_OUT
// ─────────────────────────────────────────────────────────────────

attendanceRouter.post(
  "/clock-in",
  requirePermission(PERMISSION_KEY.CLOCK_IN_OUT),
  validateBody(clockInSchema),
  attendanceController.clockIn
);

attendanceRouter.post(
  "/clock-out",
  requirePermission(PERMISSION_KEY.CLOCK_IN_OUT),
  validateBody(clockOutSchema),
  attendanceController.clockOut
);

attendanceRouter.get(
  "/today-status",
  requirePermission(PERMISSION_KEY.CLOCK_IN_OUT),
  attendanceController.getTodayStatus
);

// ─────────────────────────────────────────────────────────────────
// PERSONAL HISTORY — READ_SELF_ATTENDANCE
// ─────────────────────────────────────────────────────────────────

attendanceRouter.get(
  "/my-history",
  requirePermission(PERMISSION_KEY.READ_SELF_ATTENDANCE),
  validateQuery(selfAttendanceQuerySchema),
  attendanceController.getSelfAttendance
);

// ─────────────────────────────────────────────────────────────────
// TEAM DASHBOARDS & LOGS — READ_ALL_ATTENDANCE
// ─────────────────────────────────────────────────────────────────

attendanceRouter.get(
  "/team",
  requirePermission(PERMISSION_KEY.READ_ALL_ATTENDANCE),
  validateQuery(teamAttendanceQuerySchema),
  attendanceController.getTeamAttendance
);

attendanceRouter.get(
  "/team-stats",
  requirePermission(PERMISSION_KEY.READ_ALL_ATTENDANCE),
  validateQuery(teamStatsQuerySchema),
  attendanceController.getTeamAttendanceStats
);

export default attendanceRouter;
