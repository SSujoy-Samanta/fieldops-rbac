import { z } from "zod";
import { ATTENDANCE_STATUS, SYSTEM_ROLE } from "@/generated/prisma/client";
import { isoCalendarDateSchema, queryDateFilterSchema } from "@/utils/date-schemas";

export const attendanceIdParamSchema = z.object({
  id: z.string().cuid("Invalid attendance log ID format"),
});

export const clockInSchema = z.object({
  locationNotes: z.string().trim().max(512, "Location notes cannot exceed 512 characters").optional(),
});

export const clockOutSchema = z.object({
  locationNotes: z.string().trim().max(512, "Location notes cannot exceed 512 characters").optional(),
});

export const selfAttendanceQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    startDate: queryDateFilterSchema.optional(),
    endDate: queryDateFilterSchema.optional(),
    status: z.nativeEnum(ATTENDANCE_STATUS).optional(),
    sortBy: z.enum(["date", "clockIn", "durationMinutes"]).default("clockIn"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate.getTime() <= data.endDate.getTime();
      }
      return true;
    },
    {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    }
  );

export const teamAttendanceQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    userId: z.string().cuid("Invalid user ID format").optional(),
    role: z.nativeEnum(SYSTEM_ROLE).optional(),
    search: z.string().trim().optional(),
    startDate: queryDateFilterSchema.optional(),
    endDate: queryDateFilterSchema.optional(),
    status: z.nativeEnum(ATTENDANCE_STATUS).optional(),
    sortBy: z.enum(["date", "clockIn", "durationMinutes", "createdAt"]).default("clockIn"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate.getTime() <= data.endDate.getTime();
      }
      return true;
    },
    {
      message: "startDate must be before or equal to endDate",
      path: ["endDate"],
    }
  );

export const teamStatsQuerySchema = z.object({
  date: isoCalendarDateSchema.optional(),
  role: z.nativeEnum(SYSTEM_ROLE).optional(),
});

export type AttendanceIdParam = z.infer<typeof attendanceIdParamSchema>;
export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
export type SelfAttendanceQueryInput = z.infer<typeof selfAttendanceQuerySchema>;
export type TeamAttendanceQueryInput = z.infer<typeof teamAttendanceQuerySchema>;
export type TeamStatsQueryInput = z.infer<typeof teamStatsQuerySchema>;
