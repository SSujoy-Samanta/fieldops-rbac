import { Router } from "express";
import { oauthController } from "./oauth.controller";
import { validateBody } from "@/middlewares/validate.middleware";
import { authRateLimit } from "@/middlewares/rate-limit/auth";
import { googleCallbackSchema } from "./oauth.schemas";

export const oauthRouter: Router = Router();

// GET /api/auth/oauth/state
oauthRouter.get("/state", oauthController.getState);

// POST /api/auth/oauth/google
oauthRouter.post(
  "/google",
  authRateLimit,
  validateBody(googleCallbackSchema),
  oauthController.googleCallback
);

// POST /api/auth/oauth/callback
oauthRouter.post(
  "/callback",
  authRateLimit,
  validateBody(googleCallbackSchema),
  oauthController.googleCallback
);

export default oauthRouter;
