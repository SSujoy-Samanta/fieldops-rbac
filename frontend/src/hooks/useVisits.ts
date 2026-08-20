"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { visitsApi } from "@/lib/api/visits";
import { queryKeys } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import type {
  Visit,
  CreateVisitInput,
  UpdateVisitInput,
  SelfVisitsQuery,
  TeamVisitsQuery,
  TeamVisitStatsQuery,
  PaginatedVisitsResponse,
  TeamVisitStats,
} from "@/types/visit";

// ── Queries ───────────────────────────────────────────────────────────

/**
 * Fetch personal paginated visit logs
 */
export function useSelfVisits(query: SelfVisitsQuery = {}) {
  return useQuery<PaginatedVisitsResponse>({
    queryKey: queryKeys.visits.myVisits(query as Record<string, unknown>),
    queryFn: async (): Promise<PaginatedVisitsResponse> => {
      const res = await visitsApi.getSelfVisits(query);
      const visitsData = res.data;
      if (Array.isArray(visitsData)) {
        return {
          visits: visitsData,
          pagination: res.pagination || {
            total: visitsData.length,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: Math.ceil(visitsData.length / (query.limit || 10)),
          },
        };
      }
      if (!visitsData) {
        return {
          visits: [],
          pagination: {
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: 0,
          },
        };
      }
      return visitsData as unknown as PaginatedVisitsResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * Fetch team-wide paginated visit logs
 */
export function useTeamVisits(query: TeamVisitsQuery = {}) {
  return useQuery<PaginatedVisitsResponse>({
    queryKey: queryKeys.visits.teamVisits(query as Record<string, unknown>),
    queryFn: async (): Promise<PaginatedVisitsResponse> => {
      const res = await visitsApi.getTeamVisits(query);
      const visitsData = res.data;
      if (Array.isArray(visitsData)) {
        return {
          visits: visitsData,
          pagination: res.pagination || {
            total: visitsData.length,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: Math.ceil(visitsData.length / (query.limit || 10)),
          },
        };
      }
      if (!visitsData) {
        return {
          visits: [],
          pagination: {
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: 0,
          },
        };
      }
      return visitsData as unknown as PaginatedVisitsResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * Fetch aggregated team visit metrics & breakdown
 */
export function useTeamVisitStats(query: TeamVisitStatsQuery = {}) {
  return useQuery<TeamVisitStats | null>({
    queryKey: queryKeys.visits.stats(query as Record<string, unknown>),
    queryFn: async (): Promise<TeamVisitStats | null> => {
      const res = await visitsApi.getTeamVisitStats(query);
      return res.data || null;
    },
    staleTime: 1000 * 30, // 30s
  });
}

/**
 * Fetch single visit record by ID
 */
export function useVisit(id: string) {
  return useQuery<Visit | null>({
    queryKey: ["visits", "detail", id],
    queryFn: async (): Promise<Visit | null> => {
      const res = await visitsApi.getVisitById(id);
      return res.data || null;
    },
    enabled: Boolean(id),
  });
}

// ── Mutations ─────────────────────────────────────────────────────────

/**
 * Create a new customer field visit with instant in-memory cache prepend
 */
export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation<Visit, Error, CreateVisitInput>({
    mutationFn: async (payload: CreateVisitInput): Promise<Visit> => {
      const res = await visitsApi.createVisit(payload);
      if (!res.data) {
        throw new Error(res.message || "Failed to record visit");
      }
      return res.data;
    },
    onSuccess: (newVisit) => {
      toast.success("Visit Logged Successfully", {
        description: `Customer visit for "${newVisit.customerName}" has been recorded.`,
      });

      // ── 1. Direct cache update for instant UI feedback ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.visits.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("visits" in old && Array.isArray((old as PaginatedVisitsResponse).visits)) {
            const data = old as PaginatedVisitsResponse;
            return {
              ...data,
              visits: [newVisit, ...data.visits],
              pagination: data.pagination
                ? {
                    ...data.pagination,
                    total: data.pagination.total + 1,
                  }
                : undefined,
            };
          }
          return old;
        }
      );

      // ── 2. Sync detail query cache ──
      queryClient.setQueryData(["visits", "detail", newVisit.id], newVisit);

      // ── 3. Background cache synchronization ──
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
    onError: (error) => {
      toast.error("Visit Logging Failed", {
        description: getErrorMessage(error) || "Failed to record customer visit",
      });
    },
  });
}

/**
 * Update an existing field visit with direct in-memory cache replacement
 */
export function useUpdateVisit() {
  const queryClient = useQueryClient();

  return useMutation<Visit, Error, { id: string; payload: UpdateVisitInput }>({
    mutationFn: async ({ id, payload }): Promise<Visit> => {
      const res = await visitsApi.updateVisit(id, payload);
      if (!res.data) {
        throw new Error(res.message || "Failed to update visit");
      }
      return res.data;
    },
    onSuccess: (updatedVisit) => {
      toast.success("Visit Updated", {
        description: `Visit record for "${updatedVisit.customerName}" updated successfully.`,
      });

      // ── 1. Direct cache update on all visit lists ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.visits.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("visits" in old && Array.isArray((old as PaginatedVisitsResponse).visits)) {
            const data = old as PaginatedVisitsResponse;
            return {
              ...data,
              visits: data.visits.map((v) =>
                v.id === updatedVisit.id ? { ...v, ...updatedVisit } : v
              ),
            };
          }
          return old;
        }
      );

      // ── 2. Direct cache update for detail modal ──
      queryClient.setQueryData(
        ["visits", "detail", updatedVisit.id],
        updatedVisit
      );

      // ── 3. Background cache synchronization ──
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: getErrorMessage(error) || "Failed to update visit record",
      });
    },
  });
}

/**
 * Delete a field visit log with instant cache removal
 */
export function useDeleteVisit() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const res = await visitsApi.deleteVisit(id);
      return res.data || { message: "Field visit log deleted successfully" };
    },
    onSuccess: (_, deletedId) => {
      toast.success("Visit Record Deleted", {
        description: "The field visit log has been permanently removed.",
      });

      // ── 1. Direct cache update: Remove from lists ──
      queryClient.setQueriesData(
        { queryKey: queryKeys.visits.all },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          if ("visits" in old && Array.isArray((old as PaginatedVisitsResponse).visits)) {
            const data = old as PaginatedVisitsResponse;
            return {
              ...data,
              visits: data.visits.filter((v) => v.id !== deletedId),
              pagination: data.pagination
                ? {
                    ...data.pagination,
                    total: Math.max(0, data.pagination.total - 1),
                  }
                : undefined,
            };
          }
          return old;
        }
      );

      // ── 2. Remove detail cache entry ──
      queryClient.removeQueries({ queryKey: ["visits", "detail", deletedId] });

      // ── 3. Background cache synchronization ──
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.all });
    },
    onError: (error) => {
      toast.error("Delete Failed", {
        description: getErrorMessage(error) || "Failed to delete visit record",
      });
    },
  });
}
