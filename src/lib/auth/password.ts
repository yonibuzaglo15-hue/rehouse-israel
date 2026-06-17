import type { UserCredentialRecord } from "./types";
import { USER_PASSWORD_HASHES } from "./user-password-hashes";

/**
 * אימות סיסמה — לשימוש ב-API התחברות עתידי (שרת בלבד).
 * bcrypt hashes נוצרו ע"י scripts/generate-user-credentials.mjs
 */
export async function verifyUserPassword(
  userId: string,
  plainPassword: string
): Promise<boolean> {
  const record = USER_PASSWORD_HASHES.find((entry) => entry.userId === userId);
  if (!record) return false;

  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(plainPassword, record.passwordHash);
}

export function getPasswordHashRecord(userId: string): UserCredentialRecord | undefined {
  return USER_PASSWORD_HASHES.find((entry) => entry.userId === userId);
}
