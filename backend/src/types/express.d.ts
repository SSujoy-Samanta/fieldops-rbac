import type { AuthenticatedUser } from "./auth";
import type { RbacContext } from "./rbac";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      rbac?: RbacContext;
    }
  }
}

export {};
