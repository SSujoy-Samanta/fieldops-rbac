/**
 * Centralized asset management for FieldOps
 */
export const ASSETS = {
  auth: {
    loginBackground: "/login-hero.png",
    resetPasswordBackground: "/reset-password-hero.png",
    forgotPasswordBackground: "/reset-password-hero.png",
  },
  branding: {
    logo: "/favicon.svg",
    icon: "/icon.svg",
  },
} as const;

export type Assets = typeof ASSETS;
export default ASSETS;
