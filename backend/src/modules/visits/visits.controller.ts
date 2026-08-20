import type { Request, Response } from "express";
import { visitsService } from "./visits.service";
import { sendSuccess, sendCreated } from "@/utils/response";
import { asyncHandler } from "@/utils/asyncHandler";
import type {
  CreateVisitInput,
  UpdateVisitInput,
  SelfVisitsQueryInput,
  TeamVisitsQueryInput,
  TeamVisitStatsQueryInput,
} from "./visits.schemas";

function getActorContext(req: Request) {
  return {
    userId: req.user!.id,
    role: req.rbac?.roleName,
    permissions: req.rbac?.permissions,
  };
}

export const visitsController = {
  /**
   * POST /api/visits
   * Creates a new customer field visit record with active attendance check
   */
  createVisit: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const input = req.body as CreateVisitInput;
    const actor = getActorContext(req);
    const created = await visitsService.createVisit(userId, input, actor);
    sendCreated(res, created, "Field visit recorded successfully");
  }),

  /**
   * GET /api/visits/my-history
   * Retrieves paginated personal field visits for logged-in user
   */
  getSelfVisits: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const query = req.query as unknown as SelfVisitsQueryInput;
    const result = await visitsService.getSelfVisits(userId, query);
    sendSuccess(res, result.visits, "Personal visits retrieved successfully", result.pagination);
  }),

  /**
   * GET /api/visits/team
   * Retrieves paginated team-wide field visits across all employees
   */
  getTeamVisits: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as TeamVisitsQueryInput;
    const result = await visitsService.getTeamVisits(query);
    sendSuccess(res, result.visits, "Team visits retrieved successfully", result.pagination);
  }),

  /**
   * GET /api/visits/team-stats
   * Retrieves aggregated visit metrics and outcome breakdowns
   */
  getTeamVisitStats: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as TeamVisitStatsQueryInput;
    const result = await visitsService.getTeamVisitStats(query);
    sendSuccess(res, result, "Team visit statistics retrieved successfully");
  }),

  /**
   * GET /api/visits/:id
   * Retrieves a single visit log by ID
   */
  getVisitById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const visitId = req.params.id as string;
    const actor = getActorContext(req);
    const visit = await visitsService.getVisitById(visitId, actor);
    sendSuccess(res, visit, "Field visit log retrieved successfully");
  }),

  /**
   * PATCH /api/visits/:id
   * Updates an existing field visit log
   */
  updateVisit: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const visitId = req.params.id as string;
    const input = req.body as UpdateVisitInput;
    const actor = getActorContext(req);
    const updated = await visitsService.updateVisit(visitId, input, actor);
    sendSuccess(res, updated, "Field visit log updated successfully");
  }),

  /**
   * DELETE /api/visits/:id
   * Deletes a field visit log
   */
  deleteVisit: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const visitId = req.params.id as string;
    const actor = getActorContext(req);
    const result = await visitsService.deleteVisit(visitId, actor);
    sendSuccess(res, null, result.message);
  }),
};

export default visitsController;
