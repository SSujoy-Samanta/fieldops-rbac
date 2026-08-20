import type { Response, CookieOptions } from "express";
import { env } from "../config/env";
import { TOKEN, COOKIE } from "../config/constants";
import { randomToken } from "./crypto";

const isProduction = env.NODE_ENV === "production";

/**
 * Resolves the cookie domain based on PLATFORM_DOMAIN:
 * - In local dev (PLATFORM_DOMAIN === 'localhost'): returns undefined (browser scopes to host)
 * - In production: returns `.${env.PLATFORM_DOMAIN}` (e.g. '.fieldops.dev' to share across subdomains)
 */
function getCookieDomain(): string | undefined {
  if (env.PLATFORM_DOMAIN === "localhost" || !isProduction) {
    return undefined;
  }
  return env.PLATFORM_DOMAIN.startsWith(".") ? env.PLATFORM_DOMAIN : `.${env.PLATFORM_DOMAIN}`;
}

/**
 * Resolves the SameSite policy:
 * - In local dev (HTTP): 'lax' (browsers reject 'none' over insecure HTTP)
 * - In production (HTTPS): 'lax' for shared platform domain, 'none' if cross-site
 */
function getSameSite(): "lax" | "none" {
  if (!isProduction) {
    return "lax";
  }
  return env.PLATFORM_DOMAIN !== "localhost" ? "lax" : "none";
}

function getBaseOptions(path = "/"): CookieOptions {
  const domain = getCookieDomain();
  return {
    secure: isProduction,
    sameSite: getSameSite(),
    path,
    ...(domain && { domain }),
  };
}

/**
 * Access Token Cookie (HttpOnly, short-lived 15 min)
 */
export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE.ACCESS_TOKEN, token, {
    ...getBaseOptions("/"),
    httpOnly: true,
    maxAge: TOKEN.ACCESS_TOKEN_TTL * 1000,
  });
}

/**
 * Refresh Token Cookie (HttpOnly, long-lived 7 days, scoped strictly to /api/auth/refresh)
 */
export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(COOKIE.REFRESH_TOKEN, token, {
    ...getBaseOptions("/api/auth/refresh"),
    httpOnly: true,
    maxAge: TOKEN.REFRESH_TOKEN_TTL * 1000,
  });
}

/**
 * CSRF Token Cookie (httpOnly: false — readable by client JavaScript to set X-CSRF-Token header)
 */
export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(COOKIE.CSRF_TOKEN, token, {
    ...getBaseOptions("/"),
    httpOnly: false,
    maxAge: TOKEN.CSRF_TTL * 1000,
  });
}

/**
 * Helper to set all auth cookies (Access, Refresh, and CSRF) in one call
 */
export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken?: string }
): string {
  const csrf = tokens.csrfToken || randomToken(32);

  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshCookie(res, tokens.refreshToken);
  setCsrfCookie(res, csrf);

  return csrf;
}

/**
 * Clears all authentication and CSRF cookies across their respective paths & domains
 */
export function clearAuthCookies(res: Response): void {
  // Clear Access Token
  res.clearCookie(COOKIE.ACCESS_TOKEN, {
    ...getBaseOptions("/"),
    httpOnly: true,
  });

  // Clear Refresh Token (Must specify matching path: /api/auth/refresh)
  res.clearCookie(COOKIE.REFRESH_TOKEN, {
    ...getBaseOptions("/api/auth/refresh"),
    httpOnly: true,
  });

  // Clear CSRF Token
  res.clearCookie(COOKIE.CSRF_TOKEN, {
    ...getBaseOptions("/"),
    httpOnly: false,
  });
}
