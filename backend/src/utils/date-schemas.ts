import { z } from "zod";

/**
 * Strict ISO 8601 Datetime Schema (with Time and Timezone/Offset).
 *
 * Accepts:  "2026-08-15T23:59:59.000Z"  ✅
 *           "2026-08-15T23:59:59+05:30" ✅
 * Rejects:  "2026-02-31T00:00:00Z"      ❌ (Feb 31 does not exist)
 * Rejects:  "2026-08-15"                ❌ (date-only — use isoCalendarDateSchema)
 * Rejects:  "2026"                      ❌ (year-only)
 * Rejects:  1234567890                  ❌ (unix timestamps)
 *
 * Use for: expiresAt, sentAt, dueDate API inputs, query timestamp filters.
 */
export const isoDatetimeSchema = z
  .string()
  .datetime({
    offset: true,
    message: "Invalid ISO 8601 datetime format (e.g. 2026-08-15T00:00:00.000Z)",
  })
  .transform((v) => new Date(v))
  .refine((d) => !isNaN(d.getTime()), {
    message: "Invalid calendar date — the date does not exist (e.g. February 31)",
  });

/**
 * Strict Calendar Date Schema (YYYY-MM-DD only, with Calendar Validation).
 *
 * Accepts:  "2026-08-15"  ✅
 *           "2026-02-28"  ✅ (Feb 28 exists)
 * Rejects:  "2026-02-31"  ❌ (Feb 31 does not exist)
 * Rejects:  "2026-13-01"  ❌ (month 13 does not exist)
 * Rejects:  "2026-08-15T00:00:00Z" ❌ (full timestamp — use isoDatetimeSchema)
 *
 * Use for: effectiveDate, startDate, dueDate in calendar-based forms.
 * Note:    Transforms to midnight UTC of that calendar day.
 */
export const isoCalendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(
    (val) => {
      const parsed = new Date(val);
      return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === val;
    },
    { message: "Invalid calendar date — must be a valid YYYY-MM-DD date (e.g. 2026-08-15)" }
  )
  .transform((val) => new Date(val));

/**
 * Flexible Date Filter Schema for Query Params:
 * Accepts EITHER full ISO datetime OR YYYY-MM-DD calendar date, transforming to Date.
 */
export const queryDateFilterSchema = z
  .union([
    z
      .string()
      .datetime({ offset: true })
      .transform((v) => new Date(v)),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((val) => {
        const parsed = new Date(val);
        return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === val;
      })
      .transform((val) => new Date(val)),
  ])
  .refine((d) => !isNaN(d.getTime()), {
    message: "Invalid date value",
  });

/**
 * Normalizes query date filters so that if endDate is specified as a midnight date
 * (e.g. from YYYY-MM-DD), it expands to the end of that day (23:59:59.999) to cover
 * all records created throughout that entire day.
 */
export function normalizeDateRange(startDate?: Date, endDate?: Date) {
  let normalizedEnd = endDate;
  if (endDate) {
    if (
      endDate.getUTCHours() === 0 &&
      endDate.getUTCMinutes() === 0 &&
      endDate.getUTCSeconds() === 0 &&
      endDate.getUTCMilliseconds() === 0
    ) {
      normalizedEnd = new Date(
        Date.UTC(
          endDate.getUTCFullYear(),
          endDate.getUTCMonth(),
          endDate.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );
    }
  }
  return { startDate, endDate: normalizedEnd };
}
