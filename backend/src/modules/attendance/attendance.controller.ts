import type { Request, Response } from "express";
import { attendanceService } from "./attendance.service";
import { sendSuccess, sendCreated } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import type {
  ClockInInput,
  ClockOutInput,
  SelfAttendanceQueryInput,
  TeamAttendanceQueryInput,
  TeamStatsQueryInput,
} from "./attendance.schemas";

export const attendanceController = {
  /**
   * POST /api/attendance/clock-in
   * Starts an active clock-in session for the authenticated user
   */
  clockIn: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const input = req.body as ClockInInput;
    const result = await attendanceService.clockIn(userId, input);
    sendCreated(res, result.session, result.message);
  }),

  /**
   * POST /api/attendance/clock-out
   * Ends the current clock-in session and calculates work duration
   */
  clockOut: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const input = req.body as ClockOutInput;
    const result = await attendanceService.clockOut(userId, input);
    sendSuccess(res, result.session, result.message, {
      durationMinutes: result.durationMinutes,
    });
  }),

  /**
   * GET /api/attendance/today-status
   * Returns current clock-in status, ongoing session, and accumulated daily hours
   */
  getTodayStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const result = await attendanceService.getTodayStatus(userId);
    sendSuccess(res, result, "Today's attendance status retrieved successfully");
  }),

  /**
   * GET /api/attendance/my-history
   * Returns paginated personal attendance history for the logged-in user
   */
  getSelfAttendance: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as SelfAttendanceQueryInput;
    const result = await attendanceService.getSelfAttendance(userId, query);
    sendSuccess(res, result.logs, "Personal attendance history retrieved successfully", result.pagination);
  }),

  /**
   * GET /api/attendance/team
   * Returns paginated team-wide attendance records (guarded by READ_ALL_ATTENDANCE)
   */
  getTeamAttendance: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as TeamAttendanceQueryInput;
    const result = await attendanceService.getTeamAttendance(query);
    sendSuccess(res, result.logs, "Team attendance retrieved successfully", result.pagination);
  }),

  /**
   * GET /api/attendance/team-stats
   * Returns aggregated team attendance dashboard metrics (guarded by READ_ALL_ATTENDANCE)
   */
  getTeamAttendanceStats: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as TeamStatsQueryInput;
    const result = await attendanceService.getTeamAttendanceStats(query);
    sendSuccess(res, result, "Team attendance statistics retrieved successfully");
  }),
};

export default attendanceController;
