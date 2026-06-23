import "server-only";

import { getSession, type SessionPayload } from "@/lib/auth/session";
import { canManageAllProperties } from "@/lib/auth/permissions";
import { getNextAuthAdminSession } from "@/lib/auth/nextauth-server";

export type AdminAccess =
  | { source: "nextauth"; name: string; email: string }
  | { source: "legacy"; session: SessionPayload };

export async function getAdminAccess(): Promise<AdminAccess | null> {
  const nextAuthSession = await getNextAuthAdminSession();
  if (nextAuthSession) {
    return {
      source: "nextauth",
      name: nextAuthSession.user?.name ?? "מנהל",
      email: nextAuthSession.user?.email ?? "",
    };
  }

  const legacySession = await getSession();
  if (legacySession && canManageAllProperties(legacySession.role)) {
    return { source: "legacy", session: legacySession };
  }

  return null;
}

export async function canAdminEditCatalog(): Promise<boolean> {
  return (await getAdminAccess()) !== null;
}
