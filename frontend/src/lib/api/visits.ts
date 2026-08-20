import { apiClient } from "./client";
import type { ApiResponse } from "@/types/auth";
import type { PaginationMeta } from "@/types/user";
import type {
  Visit,
  CreateVisitInput,
  UpdateVisitInput,
  SelfVisitsQuery,
  TeamVisitsQuery,
  TeamVisitStatsQuery,
  TeamVisitStats,
} from "@/types/visit";

export interface PaginatedVisitsApiResponse extends ApiResponse<Visit[]> {
  pagination?: PaginationMeta;
}

export const visitsApi = {
  /**
   * POST /api/visits
   * Record a new customer field visit
   */
  createVisit: (payload: CreateVisitInput) =>
    apiClient
      .post<ApiResponse<Visit>>("/visits", payload)
      .then((res) => res.data),

  /**
   * PATCH /api/visits/:id
   * Update an existing visit record
   */
  updateVisit: (id: string, payload: UpdateVisitInput) =>
    apiClient
      .patch<ApiResponse<Visit>>(`/visits/${id}`, payload)
      .then((res) => res.data),

  /**
   * DELETE /api/visits/:id
   * Delete a visit log
   */
  deleteVisit: (id: string) =>
    apiClient
      .delete<ApiResponse<{ message: string }>>(`/visits/${id}`)
      .then((res) => res.data),

  /**
   * GET /api/visits/my-history
   * Retrieve paginated personal visits
   */
  getSelfVisits: (params?: SelfVisitsQuery) =>
    apiClient
      .get<PaginatedVisitsApiResponse>("/visits/my-history", { params })
      .then((res) => res.data),

  /**
   * GET /api/visits/team
   * Retrieve paginated company-wide team visits (guarded by READ_ALL_VISIT)
   */
  getTeamVisits: (params?: TeamVisitsQuery) =>
    apiClient
      .get<PaginatedVisitsApiResponse>("/visits/team", { params })
      .then((res) => res.data),

  /**
   * GET /api/visits/team-stats
   * Retrieve aggregated metrics for team visits
   */
  getTeamVisitStats: (params?: TeamVisitStatsQuery) =>
    apiClient
      .get<ApiResponse<TeamVisitStats>>("/visits/team-stats", { params })
      .then((res) => res.data),

  /**
   * GET /api/visits/:id
   * Retrieve single visit record by ID
   */
  getVisitById: (id: string) =>
    apiClient
      .get<ApiResponse<Visit>>(`/visits/${id}`)
      .then((res) => res.data),
};

export default visitsApi;
