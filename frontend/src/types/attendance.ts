import type { PaginationMeta } from "./user";

export enum ATTENDANCE_STATUS {
  CLOCKED_IN = "CLOCKED_IN",
  CLOCKED_OUT = "CLOCKED_OUT",
}

export interface AttendanceSessionUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface AttendanceSession {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  durationMinutes: number | null;
  status: ATTENDANCE_STATUS;
  locationNotes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: AttendanceSessionUser;
}

export interface TodayAttendanceSummary {
  date: string;
  sessionsCount: number;
  totalMinutes: number;
  totalHours: number;
}

export interface TodayAttendanceStatus {
  isClockedIn: boolean;
  currentSession: AttendanceSession | null;
  todaySummary: TodayAttendanceSummary;
  todaySessions: AttendanceSession[];
}

export interface ClockInInput {
  locationNotes?: string;
}

export interface ClockOutInput {
  locationNotes?: string;
}

export interface SelfAttendanceQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: ATTENDANCE_STATUS;
  sortBy?: "date" | "clockIn" | "durationMinutes";
  sortOrder?: "asc" | "desc";
}

export interface TeamAttendanceQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  role?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: ATTENDANCE_STATUS;
  sortBy?: "date" | "clockIn" | "durationMinutes" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface TeamAttendanceStats {
  totalActiveEmployees: number;
  currentlyClockedIn: number;
  currentlyClockedOut: number;
  notClockedInToday: number;
  totalMinutesWorked: number;
  totalHoursWorked: number;
  averageHoursPerActiveUser: number;
}

export interface TeamStatsQueryParams {
  date?: string;
  role?: string;
}

export interface AttendanceListResponse {
  logs: AttendanceSession[];
  pagination?: PaginationMeta;
}

