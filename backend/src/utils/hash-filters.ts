import { createHash } from "crypto";

/**
 * Deterministically serializes and hashes query filter objects for Redis list caching.
 * Sorts object keys alphabetically and strips undefined/null/empty values to prevent cache fragmentation.
 */
export function hashFilters(filters: Record<string, any> = {}): string {
  const clean: Record<string, any> = {};

  Object.keys(filters)
    .sort()
    .forEach((key) => {
      const val = filters[key];
      if (val !== undefined && val !== null && val !== "") {
        clean[key] = typeof val === "object" ? JSON.stringify(val) : val;
      }
    });

  const serialized = JSON.stringify(clean);
  return createHash("md5").update(serialized).digest("hex").slice(0, 16);
}

export default hashFilters;
