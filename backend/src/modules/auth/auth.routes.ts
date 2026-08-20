import { Router } from "express";
import { authController } from "./auth.controller";
import { oauthController } from "@/modules/oauth/oauth.controller";
import { oauthRouter } from "@/modules/oauth/oauth.routes";
import { authenticate } from "@/middlewares/auth.middleware";
import { validateBody } from "@/middlewares/validate.middleware";
import {
  authRateLimit,
  authSensitiveRateLimit,
} from "@/middlewares/rate-limit/auth";
import {
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schemas";
import { googleCallbackSchema } from "@/modules/oauth/oauth.schemas";

export const authRouter: Router = Router();

// Public Auth Routes
authRouter.get("/csrf", authController.getCsrf);
authRouter.post("/login", authRateLimit, validateBody(loginSchema), authController.login);
authRouter.post("/refresh", validateBody(refreshSchema), authController.refresh);
authRouter.post(
  "/forgot-password",
  authSensitiveRateLimit,
  validateBody(forgotPasswordSchema),
  authController.requestPasswordReset
);
authRouter.post(
  "/reset-password",
  authSensitiveRateLimit,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// Google OAuth Routes
authRouter.use("/oauth", oauthRouter);
authRouter.post(
  "/google",
  authRateLimit,
  validateBody(googleCallbackSchema),
  oauthController.googleCallback
);

// Protected Routes
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get("/me", authenticate, authController.getMe);

export default authRouter;
