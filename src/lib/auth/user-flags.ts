import { SYSTEM_USERS } from "./users";

/**
 * משתמשים שחייבים להחליף סיסמה בכניסה ראשונה.
 * יוסרו מהרשימה לאחר שינוי סיסמה (שלב עתידי).
 */
const MUST_CHANGE_PASSWORD_IDS = new Set(
  SYSTEM_USERS.map((user) => user.id)
);

export function mustChangePasswordOnLogin(userId: string): boolean {
  return MUST_CHANGE_PASSWORD_IDS.has(userId);
}
