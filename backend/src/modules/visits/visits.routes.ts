import { Router } from "express";
import { visitsController } from "./visits.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { requirePermission, requireAnyPermission } from "@/middlewares/rbac.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@/middlewares/validate.middleware";
import {
  createVisitSchema,
  updateVisitSchema,
  selfVisitsQuerySchema,
  teamVisitsQuerySchema,
  teamVisitStatsQuerySchema,
  visitIdParamSchema,
} from "./visits.schemas";
import { PERMISSION_KEY } from "@/types/rbac";

export const visitsRouter: Router = Router();

// All visits endpoints require authentication
visitsRouter.use(authenticate);

// ─────────────────────────────────────────────────────────────────
// CREATE & WRITE — SAVE_VISIT
// ─────────────────────────────────────────────────────────────────

visitsRouter.post(
  "/",
  requirePermission(PERMISSION_KEY.SAVE_VISIT),
  validateBody(createVisitSchema),
  visitsController.createVisit
);

visitsRouter.patch(
  "/:id",
  requirePermission(PERMISSION_KEY.SAVE_VISIT),
  validateParams(visitIdParamSchema),
  validateBody(updateVisitSchema),
  visitsController.updateVisit
);

visitsRouter.delete(
  "/:id",
  requirePermission(PERMISSION_KEY.SAVE_VISIT),
  validateParams(visitIdParamSchema),
  visitsController.deleteVisit
);

// ─────────────────────────────────────────────────────────────────
// PERSONAL HISTORY — READ_SELF_VISIT
// ─────────────────────────────────────────────────────────────────

visitsRouter.get(
  "/my-history",
  requirePermission(PERMISSION_KEY.READ_SELF_VISIT),
  validateQuery(selfVisitsQuerySchema),
  visitsController.getSelfVisits
);

// ─────────────────────────────────────────────────────────────────
// TEAM DASHBOARDS & LOGS — READ_ALL_VISIT
// ─────────────────────────────────────────────────────────────────

visitsRouter.get(
  "/team",
  requirePermission(PERMISSION_KEY.READ_ALL_VISIT),
  validateQuery(teamVisitsQuerySchema),
  visitsController.getTeamVisits
);

visitsRouter.get(
  "/team-stats",
  requirePermission(PERMISSION_KEY.READ_ALL_VISIT),
  validateQuery(teamVisitStatsQuerySchema),
  visitsController.getTeamVisitStats
);

// ─────────────────────────────────────────────────────────────────
// DETAIL BY ID — READ_SELF_VISIT or READ_ALL_VISIT
// ─────────────────────────────────────────────────────────────────

visitsRouter.get(
  "/:id",
  requireAnyPermission([
    PERMISSION_KEY.READ_SELF_VISIT,
    PERMISSION_KEY.READ_ALL_VISIT,
  ]),
  validateParams(visitIdParamSchema),
  visitsController.getVisitById
);

export default visitsRouter;
