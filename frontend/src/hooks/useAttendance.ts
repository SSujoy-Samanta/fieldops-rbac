"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { attendanceApi } from "@/lib/api/attendance";
import { queryKeys } from "@/lib/query-keys";
import type {
  AttendanceSession,
  TodayAttendanceStatus,
  ClockInInput,
  ClockOutInput,
  SelfAttendanceQueryParams,
  TeamAttendanceQueryParams,
  TeamAttendanceStats,
  TeamStatsQueryParams,
  AttendanceListResponse,
} from "@/types/attendance";
import type { PaginationMeta } from "@/types/user";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/client";

/**
 * Hook to fetch today's active shift status, open session, and accumulated daily hours
 */
export function useTodayAttendance() {
  return useQuery({
    queryKey: queryKeys.attendance.today(),
    queryFn: async (): Promise<TodayAttendanceStatus | null> => {
      const res = await attendanceApi.getTodayStatus();
      return res.data || null;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: (query) => {
      // If currently clocked in, poll every 30s to keep backend sync active
      return query.state.data?.isClockedIn ? 1000 * 30 : false;
    },
  });
}

/**
 * Hook to fetch paginated personal attendance records with date and status filters
 */
export function useSelfAttendance(params?: SelfAttendanceQueryParams) {
  return useQuery({
    queryKey: queryKeys.attendance.myHistory(params as Record<string, unknown>),
    queryFn: async (): Promise<AttendanceListResponse> => {
      const res = await attendanceApi.getSelfAttendance(params);
      const pagination =
        res.pagination ||
        ((res as unknown as { meta?: PaginationMeta }).meta as PaginationMeta | undefined);

      return {
        logs: res.data || [],
        pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to start an active shift (Clock-In) with GPS notes and direct cache update
 */
export function useClockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: ClockInInput): Promise<AttendanceSession> => {
      const res = await attendanceApi.clockIn(payload);
      if (!res.data) {
        throw new Error("Clock in failed: No session returned");
      }
      return res.data;
    },
    onSuccess: (session) => {
      toast.success("Clocked in successfully! Have a productive shift.");

      // ── Direct cache update for instant UI feedback ──
      queryClient.setQueryData(
        queryKeys.attendance.today(),
        (old: TodayAttendanceStatus | null | undefined): TodayAttendanceStatus => {
          if (!old) {
            return {
              isClockedIn: true,
              currentSession: session,
              todaySummary: {
                date: new Date().toISOString().split("T")[0],
                sessionsCount: 1,
                totalMinutes: 0,
                totalHours: 0,
              },
              todaySessions: [session],
            };
          }

          return {
            ...old,
            isClockedIn: true,
            currentSession: session,
            todaySessions: [session, ...old.todaySessions.filter((s) => s.id !== session.id)],
          };
        }
      );

      // Invalidate attendance queries in background
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to clock in.");
    },
  });
}

/**
 * Hook to end current shift (Clock-Out) with location notes and session duration
 */
export function useClockOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload?: ClockOutInput): Promise<AttendanceSession> => {
      const res = await attendanceApi.clockOut(payload);
      if (!res.data) {
        throw new Error("Clock out failed: No session returned");
      }
      return res.data;
    },
    onSuccess: (session) => {
      const duration = session.durationMinutes ?? 0;
      const hours = Math.floor(duration / 60);
      const mins = duration % 60;
      const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      toast.success(`Clocked out successfully (${durationText} worked). Great work!`);

      // ── Direct cache update ──
      queryClient.setQueryData(
        queryKeys.attendance.today(),
        (old: TodayAttendanceStatus | null | undefined): TodayAttendanceStatus | null => {
          if (!old) return null;

          const updatedSessions = old.todaySessions.map((s) =>
            s.id === session.id ? session : s
          );
          const totalMins = updatedSessions.reduce(
            (acc, s) => acc + (s.durationMinutes || 0),
            0
          );

          return {
            ...old,
            isClockedIn: false,
            currentSession: null,
            todaySummary: {
              ...old.todaySummary,
              sessionsCount: updatedSessions.length,
              totalMinutes: totalMins,
              totalHours: Number((totalMins / 60).toFixed(1)),
            },
            todaySessions: updatedSessions,
          };
        }
      );

      // Invalidate attendance queries in background
      queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err) || "Failed to clock out.");
    },
  });
}

/**
 * Hook to fetch team attendance (Manager/Owner only)
 */
export function useTeamAttendance(params?: TeamAttendanceQueryParams) {
  return useQuery({
    queryKey: queryKeys.attendance.teamList(params as Record<string, unknown>),
    queryFn: async (): Promise<AttendanceListResponse> => {
      const res = await attendanceApi.getTeamAttendance(params);
      const pagination =
        res.pagination ||
        ((res as unknown as { meta?: PaginationMeta }).meta as PaginationMeta | undefined);

      return {
        logs: res.data || [],
        pagination,
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to fetch team attendance metrics & statistics (Manager/Owner only)
 */
export function useTeamAttendanceStats(params?: TeamStatsQueryParams) {
  return useQuery({
    queryKey: queryKeys.attendance.teamStats(params as Record<string, unknown>),
    queryFn: async (): Promise<TeamAttendanceStats | null> => {
      const res = await attendanceApi.getTeamStats(params);
      return res.data || null;
    },
    staleTime: 1000 * 60 * 3,
  });
}
