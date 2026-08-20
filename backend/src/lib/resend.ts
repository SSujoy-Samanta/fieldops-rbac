import { Resend } from "resend";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}

export function isEmailEnabled(): boolean {
  return !!env.RESEND_API_KEY;
}

export interface SendEmailOptions {
  from?: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an email via Resend API.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!isEmailEnabled()) {
    logger.warn(
      { to: options.to, subject: options.subject },
      "Email skipped — RESEND_API_KEY not configured"
    );
    return { success: false, error: "Email not configured" };
  }

  const { from = env.EMAIL_FROM, to, subject, html, text, replyTo } = options;

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: html ?? (text ? `<p>${text}</p>` : ""),
      text,
      replyTo,
    });

    if (error) {
      logger.error({ to, subject, error }, "Resend API returned error");
      return { success: false, error: error.message };
    }

    logger.info(
      { to, subject, from, messageId: data?.id },
      "Email sent successfully via Resend"
    );
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ to, subject, err }, "Failed to send email via Resend");
    return { success: false, error: message };
  }
}

/**
 * Sends a password reset email with formatted link
 */
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
  userName?: string
): Promise<SendEmailResult> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const greeting = userName ? `Hello ${userName},` : "Hello,";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; color: #1e293b; border-radius: 8px; border: 1px solid #e2e8f0;">
      <div style="margin-bottom: 24px; text-align: center;">
        <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">FieldOps Security</h2>
      </div>
      <p style="font-size: 16px; line-height: 24px; color: #334155; margin-bottom: 16px;">${greeting}</p>
      <p style="font-size: 15px; line-height: 24px; color: #475569; margin-bottom: 24px;">
        We received a request to reset the password for your FieldOps account. Click the button below to choose a new password. This link will expire in <strong>1 hour</strong>.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; line-height: 20px; color: #64748b; margin-top: 24px;">
        Or copy and paste this URL into your browser:
      </p>
      <p style="font-size: 12px; line-height: 18px; color: #3b82f6; word-break: break-all; margin-top: 4px;">
        ${resetUrl}
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 20px 0;" />
      <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0; text-align: center;">
        If you did not request a password reset, you can safely ignore this email. Your password will not change.
      </p>
    </div>
  `;

  const text = `${greeting}\n\nWe received a request to reset your FieldOps password. Use the following link to reset your password (valid for 1 hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

  return sendEmail({
    to,
    subject: "Reset your FieldOps password",
    html,
    text,
  });
}
