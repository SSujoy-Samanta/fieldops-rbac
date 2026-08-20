import { OAuth2Client } from "google-auth-library";
import { env } from "@/config/env";

/**
 * Singleton Google OAuth2Client instance.
 * Pre-configured with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
 */
export const googleOAuthClient = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
});

export { OAuth2Client };
export default googleOAuthClient;
