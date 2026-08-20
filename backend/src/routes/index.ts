import { Router } from "express";
import { authRouter } from "@/modules/auth/auth.routes";
import { rolesRouter } from "@/modules/roles/roles.routes";
import { permissionsRouter } from "@/modules/permissions/permissions.routes";
import { rbacRouter } from "@/modules/roles/rbac.routes";
import { usersRouter } from "@/modules/users/users.routes";
import { attendanceRouter } from "@/modules/attendance/attendance.routes";
import { visitsRouter } from "@/modules/visits/visits.routes";

export const apiRouter: Router = Router();

// ── Feature API Modules ──────────────────────────────────────────
apiRouter.use("/auth", authRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/permissions", permissionsRouter);
apiRouter.use("/rbac", rbacRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/attendance", attendanceRouter);
apiRouter.use("/visits", visitsRouter);

export default apiRouter;
