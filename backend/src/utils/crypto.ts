import crypto from "crypto";

/**
 * Computes SHA-256 hash of a string
 */
export function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Generates a cryptographically secure random hex token
 */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generates a cryptographically secure random password
 * containing uppercase, lowercase, numbers, and special characters.
 */
export function generateRandomPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*";
  const allChars = upper + lower + numbers + symbols;

  // Guarantee at least one character from each set
  let password = "";
  password += upper[crypto.randomBytes(1)[0] % upper.length];
  password += lower[crypto.randomBytes(1)[0] % lower.length];
  password += numbers[crypto.randomBytes(1)[0] % numbers.length];
  password += symbols[crypto.randomBytes(1)[0] % symbols.length];

  const remaining = length - password.length;
  const bytes = crypto.randomBytes(remaining);
  for (let i = 0; i < remaining; i++) {
    password += allChars[bytes[i] % allChars.length];
  }

  // Shuffle the password characters randomly
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
