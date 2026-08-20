import { z } from "zod";
import { VISIT_PURPOSE, VISIT_OUTCOME, SYSTEM_ROLE } from "@/generated/prisma/client";
import { isoDatetimeSchema, queryDateFilterSchema } from "@/utils/date-schemas";

export const visitIdParamSchema = z.object({
  id: z.string().cuid("Invalid visit ID format"),
});

export const createVisitSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(255, "Customer name cannot exceed 255 characters"),
  purpose: z.nativeEnum(VISIT_PURPOSE, {
    message:
      "Purpose must be one of: ROUTINE_INSPECTION, PRODUCT_DEMO, ORDER_COLLECTION, MAINTENANCE, CLIENT_MEETING, OTHER",
  }),
  outcome: z.nativeEnum(VISIT_OUTCOME, {
    message:
      "Outcome must be one of: COMPLETED, FOLLOW_UP_REQUIRED, DEAL_CLOSED, RESCHEDULED, NO_SHOW",
  }),
  address: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters")
    .max(512, "Address cannot exceed 512 characters"),
  visitDate: isoDatetimeSchema.optional(),
  notes: z.string().trim().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

export const updateVisitSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(255, "Customer name cannot exceed 255 characters")
    .optional(),
  purpose: z.nativeEnum(VISIT_PURPOSE).optional(),
  outcome: z.nativeEnum(VISIT_OUTCOME).optional(),
  address: z
    .string()
    .trim()
    .min(3, "Address must be at least 3 characters")
    .max(512, "Address cannot exceed 512 characters")
    .optional(),
  visitDate: isoDatetimeSchema.optional(),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .nullable()
    .optional(),
});

export const selfVisitsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    purpose: z.nativeEnum(VISIT_PURPOSE).optional(),
    outcome: z.nativeEnum(VISIT_OUTCOME).optional(),
    search: z.string().trim().optional(),
    startDate: queryDateFilterSchema.optional(),
    endDate: queryDateFilterSchema.optional(),
    sortBy: z.enum(["visitDate", "customerName", "createdAt"]).default("visitDate"),
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

export const teamVisitsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    userId: z.string().cuid("Invalid user ID format").optional(),
    role: z.nativeEnum(SYSTEM_ROLE).optional(),
    purpose: z.nativeEnum(VISIT_PURPOSE).optional(),
    outcome: z.nativeEnum(VISIT_OUTCOME).optional(),
    search: z.string().trim().optional(),
    startDate: queryDateFilterSchema.optional(),
    endDate: queryDateFilterSchema.optional(),
    sortBy: z.enum(["visitDate", "customerName", "createdAt"]).default("visitDate"),
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

export const teamVisitStatsQuerySchema = z
  .object({
    startDate: queryDateFilterSchema.optional(),
    endDate: queryDateFilterSchema.optional(),
    role: z.nativeEnum(SYSTEM_ROLE).optional(),
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

export type VisitIdParam = z.infer<typeof visitIdParamSchema>;
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type SelfVisitsQueryInput = z.infer<typeof selfVisitsQuerySchema>;
export type TeamVisitsQueryInput = z.infer<typeof teamVisitsQuerySchema>;
export type TeamVisitStatsQueryInput = z.infer<typeof teamVisitStatsQuerySchema>;
