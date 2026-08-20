import { z } from "zod";

export const googleCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  redirectUri: z.string().url("Invalid redirect URI"),
  state: z.string().min(16, "Invalid state parameter"),
});

export const googleStateSchema = z.object({
  redirectUri: z.string().url("Invalid redirect URI").optional(),
});

export type GoogleCallbackInput = z.infer<typeof googleCallbackSchema>;
export type GoogleStateInput = z.infer<typeof googleStateSchema>;

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}
