import "server-only";

import { getServerSession } from "next-auth/next";
import { getAuthOptions, isNextAuthAdminRole } from "@/lib/auth/nextauth";

export async function getNextAuthSession() {
  return getServerSession(getAuthOptions());
}

export async function getNextAuthAdminSession() {
  const session = await getNextAuthSession();
  if (!session || !isNextAuthAdminRole(session.user?.role)) {
    return null;
  }
  return session;
}
