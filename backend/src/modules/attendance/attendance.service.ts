import createError from "http-errors";
import { attendanceRepository } from "./attendance.repository";
import { CacheService } from "@/services/cache.service";
import { keys } from "@/config/keys";
import { CACHE_TTL } from "@/config/constants";
import { hashFilters } from "@/utils/hash-filters";
import type {
  ClockInInput,
  ClockOutInput,
  SelfAttendanceQueryInput,
  TeamAttendanceQueryInput,
  TeamStatsQueryInput,
} from "./attendance.schemas";

/**
 * Helper to get the start and end Date objects for a given date or current day
 */
function getDayDateRange(dateInput?: Date | string) {
  const base =
    dateInput instanceof Date
      ? dateInput
      : dateInput
      ? new Date(dateInput)
      : new Date();
  const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
  const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
  const dateKey = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
  return { start, end, dateKey };
}

export const attendanceService = {
  /**
   * Records a Clock-In event with state machine validation and multi-layer invalidation
   */
  async clockIn(userId: string, input: ClockInInput) {
    // 1. Double Clock-In Guard: Ensure user doesn't already have an open session
    const existing = await attendanceRepository.findActiveSession(userId);
    if (existing) {
      throw createError(
        400,
        "You are already clocked in. Please clock out of your current session before clocking in again."
      );
    }

    // 2. Create Clock-In Session
    const session = await attendanceRepository.createClockIn({
      userId,
      locationNotes: input.locationNotes,
    });

    // 3. Multi-Layer Matrix Invalidation: Bust user's self lists, today status, and team dashboard caches
    await CacheService.invalidateAttendance({
      userId,
      teamLists: true,
    });

    return {
      message: "Clocked in successfully",
      session,
    };
  },

  /**
   * Records a Clock-Out event, computes session duration, and invalidates caches
   */
  async clockOut(userId: string, input: ClockOutInput) {
    // 1. Validate that an active session exists
    const active = await attendanceRepository.findActiveSession(userId);
    if (!active) {
      throw createError(
        400,
        "No active clock-in session found. You must clock in before you can clock out."
      );
    }

    // 2. Compute exact duration in minutes
    const now = new Date();
    const durationMinutes = Math.max(
      1,
      Math.round((now.getTime() - active.clockIn.getTime()) / (1000 * 60))
    );

    // 3. Update session to CLOCKED_OUT
    const session = await attendanceRepository.updateClockOut(active.id, {
      clockOut: now,
      durationMinutes,
      locationNotes: input.locationNotes,
    });

    // 4. Invalidate caches
    await CacheService.invalidateAttendance({
      userId,
      teamLists: true,
    });

    return {
      message: "Clocked out successfully",
      session,
      durationMinutes,
    };
  },

  /**
   * Retrieves today's clock-in status, active session, and accumulated minutes for the user
   */
  async getTodayStatus(userId: string) {
    const { start, end, dateKey } = getDayDateRange();
    const cacheKey = keys.attendance.todayStatus(userId, dateKey);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const [activeSession, allTodaySessions] = await Promise.all([
          attendanceRepository.findActiveSession(userId),
          attendanceRepository.findUserSessionsForRange(userId, start, end),
        ]);

        let totalMinutesWorkedToday = 0;
        allTodaySessions.forEach((s) => {
          if (s.durationMinutes) {
            totalMinutesWorkedToday += s.durationMinutes;
          }
        });

        return {
          isClockedIn: activeSession !== null,
          currentSession: activeSession,
          todaySummary: {
            date: dateKey,
            sessionsCount: allTodaySessions.length,
            totalMinutes: totalMinutesWorkedToday,
            totalHours: Number((totalMinutesWorkedToday / 60).toFixed(1)),
          },
          todaySessions: allTodaySessions,
        };
      },
      CACHE_TTL.ATTENDANCE_DATA
    );
  },

  /**
   * Retrieves paginated personal attendance history for the logged-in user
   */
  async getSelfAttendance(userId: string, query: SelfAttendanceQueryInput) {
    const filterHash = hashFilters(query);
    const cacheKey = keys.attendance.selfList(userId, filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return attendanceRepository.findSelfAttendance(userId, query);
      },
      CACHE_TTL.ATTENDANCE_LIST
    );
  },

  /**
   * Retrieves paginated team attendance records across all employees (requires READ_ALL_ATTENDANCE)
   */
  async getTeamAttendance(query: TeamAttendanceQueryInput) {
    const filterHash = hashFilters(query);
    const cacheKey = keys.attendance.teamList(filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return attendanceRepository.findTeamAttendance(query);
      },
      CACHE_TTL.ATTENDANCE_LIST
    );
  },

  /**
   * Retrieves aggregated attendance dashboard statistics for the team
   */
  async getTeamAttendanceStats(query: TeamStatsQueryInput) {
    const { start, end, dateKey } = getDayDateRange(query.date);
    const filterHash = hashFilters({ ...query, dateKey });
    const cacheKey = keys.attendance.stats(filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        const stats = await attendanceRepository.getTeamAttendanceStats(
          start,
          end,
          query.role
        );
        return {
          date: dateKey,
          ...stats,
        };
      },
      CACHE_TTL.ATTENDANCE_LIST
    );
  },
};

export default attendanceService;
