import createError from "http-errors";
import { visitsRepository } from "./visits.repository";
import { attendanceRepository } from "@/modules/attendance/attendance.repository";
import { CacheService } from "@/services/cache.service";
import { keys } from "@/config/keys";
import { CACHE_TTL } from "@/config/constants";
import { hashFilters } from "@/utils/hash-filters";
import { SYSTEM_ROLE, PERMISSION_KEY } from "@/types/rbac";
import type {
  CreateVisitInput,
  UpdateVisitInput,
  SelfVisitsQueryInput,
  TeamVisitsQueryInput,
  TeamVisitStatsQueryInput,
} from "./visits.schemas";

export interface ActorRbacContext {
  userId: string;
  role?: SYSTEM_ROLE;
  permissions?: PERMISSION_KEY[];
}

export const visitsService = {
  /**
   * Creates a new customer field visit log with operational compliance & multi-layer cache invalidation.
   * Field personnel must be actively clocked in before recording field visits.
   */
  async createVisit(
    userId: string,
    input: CreateVisitInput,
    actor?: ActorRbacContext
  ) {
    // 1. Operational Compliance Guard: Non-owner field users must have an active clock-in session
    if (actor?.role !== SYSTEM_ROLE.OWNER) {
      const activeSession = await attendanceRepository.findActiveSession(userId);
      if (!activeSession) {
        throw createError(
          400,
          "Operational requirement: You must be clocked in before you can record a field visit. Please clock in first."
        );
      }
    }

    // 2. Create Field Visit in Database
    const visit = await visitsRepository.createVisit(userId, input);

    // 3. Multi-Layer Matrix Invalidation: Bust user's personal visits list & team dashboard caches
    await CacheService.invalidateVisit({
      userId,
      teamLists: true,
    });

    return visit;
  },

  /**
   * Retrieves a single visit by ID with authorization and Cache-Aside
   */
  async getVisitById(visitId: string, actor: ActorRbacContext) {
    const visit = await CacheService.getOrSet(
      keys.visits.byId(visitId),
      async () => {
        const found = await visitsRepository.findVisitById(visitId);
        if (!found) {
          throw createError(404, "Field visit log not found");
        }
        return found;
      },
      CACHE_TTL.VISIT_DATA
    );

    // Authorization check: User can access own visit OR team managers/owners with READ_ALL_VISIT
    const isOwnerOrManager =
      actor.role === SYSTEM_ROLE.OWNER ||
      actor.permissions?.includes(PERMISSION_KEY.READ_ALL_VISIT);

    if (visit.userId !== actor.userId && !isOwnerOrManager) {
      throw createError(403, "You do not have permission to view this field visit log");
    }

    return visit;
  },

  /**
   * Updates an existing field visit log with ownership check and cache invalidation
   */
  async updateVisit(
    visitId: string,
    input: UpdateVisitInput,
    actor: ActorRbacContext
  ) {
    const existing = await visitsRepository.findVisitById(visitId);
    if (!existing) {
      throw createError(404, "Field visit log not found");
    }

    // Ownership or Owner authorization
    const isAuthorized =
      existing.userId === actor.userId || actor.role === SYSTEM_ROLE.OWNER;

    if (!isAuthorized) {
      throw createError(403, "You can only edit your own field visit logs");
    }

    const updated = await visitsRepository.updateVisit(visitId, input);

    // Invalidate visit detail, user list, and team dashboard caches
    await CacheService.invalidateVisit({
      visitId,
      userId: existing.userId,
      teamLists: true,
    });

    return updated;
  },

  /**
   * Deletes a field visit log with ownership check and cache invalidation
   */
  async deleteVisit(visitId: string, actor: ActorRbacContext) {
    const existing = await visitsRepository.findVisitById(visitId);
    if (!existing) {
      throw createError(404, "Field visit log not found");
    }

    const isAuthorized =
      existing.userId === actor.userId || actor.role === SYSTEM_ROLE.OWNER;

    if (!isAuthorized) {
      throw createError(403, "You can only delete your own field visit logs");
    }

    await visitsRepository.deleteVisit(visitId);

    // Invalidate caches
    await CacheService.invalidateVisit({
      visitId,
      userId: existing.userId,
      teamLists: true,
    });

    return { message: "Field visit log deleted successfully" };
  },

  /**
   * Retrieves paginated personal visit logs for the logged-in user
   */
  async getSelfVisits(userId: string, query: SelfVisitsQueryInput) {
    const filterHash = hashFilters(query);
    const cacheKey = keys.visits.selfList(userId, filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return visitsRepository.findSelfVisits(userId, query);
      },
      CACHE_TTL.VISIT_LIST
    );
  },

  /**
   * Retrieves paginated team visit logs across all employees (requires READ_ALL_VISIT)
   */
  async getTeamVisits(query: TeamVisitsQueryInput) {
    const filterHash = hashFilters(query);
    const cacheKey = keys.visits.teamList(filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return visitsRepository.findTeamVisits(query);
      },
      CACHE_TTL.VISIT_LIST
    );
  },

  /**
   * Retrieves aggregated team visit stats and breakdown metrics
   */
  async getTeamVisitStats(query: TeamVisitStatsQueryInput) {
    const filterHash = hashFilters(query);
    const cacheKey = keys.visits.stats(filterHash);

    return CacheService.getOrSet(
      cacheKey,
      async () => {
        return visitsRepository.getTeamVisitStats(query);
      },
      CACHE_TTL.VISIT_LIST
    );
  },
};

export default visitsService;
