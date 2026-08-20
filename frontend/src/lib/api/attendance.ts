import { apiClient } from "./client";
import type { ApiResponse } from "@/types/auth";
import type { PaginationMeta } from "@/types/user";
import type {
  AttendanceSession,
  TodayAttendanceStatus,
  ClockInInput,
  ClockOutInput,
  SelfAttendanceQueryParams,
  TeamAttendanceQueryParams,
  TeamAttendanceStats,
  TeamStatsQueryParams,
} from "@/types/attendance";

export interface PaginatedAttendanceResponse extends ApiResponse<AttendanceSession[]> {
  pagination?: PaginationMeta;
}

export const attendanceApi = {
  /**
   * POST /api/attendance/clock-in
   * Starts an active clock-in session for the current user
   */
  clockIn: (payload?: ClockInInput) =>
    apiClient
      .post<ApiResponse<AttendanceSession>>("/attendance/clock-in", payload || {})
      .then((res) => res.data),

  /**
   * POST /api/attendance/clock-out
   * Ends current session and calculates work duration
   */
  clockOut: (payload?: ClockOutInput) =>
    apiClient
      .post<ApiResponse<AttendanceSession>>("/attendance/clock-out", payload || {})
      .then((res) => res.data),

  /**
   * GET /api/attendance/today-status
   * Returns current clock-in state, active session, and accumulated daily hours
   */
  getTodayStatus: () =>
    apiClient
      .get<ApiResponse<TodayAttendanceStatus>>("/attendance/today-status")
      .then((res) => res.data),

  /**
   * GET /api/attendance/my-history
   * Retrieves paginated personal shift history for the authenticated user
   */
  getSelfAttendance: (params?: SelfAttendanceQueryParams) =>
    apiClient
      .get<PaginatedAttendanceResponse>("/attendance/my-history", { params })
      .then((res) => res.data),

  /**
   * GET /api/attendance/team
   * Retrieves paginated team-wide attendance records (guarded by READ_ALL_ATTENDANCE)
   */
  getTeamAttendance: (params?: TeamAttendanceQueryParams) =>
    apiClient
      .get<PaginatedAttendanceResponse>("/attendance/team", { params })
      .then((res) => res.data),

  /**
   * GET /api/attendance/team-stats
   * Retrieves aggregated team attendance statistics for a given date
   */
  getTeamStats: (params?: TeamStatsQueryParams) =>
    apiClient
      .get<ApiResponse<TeamAttendanceStats>>("/attendance/team-stats", { params })
      .then((res) => res.data),
};
