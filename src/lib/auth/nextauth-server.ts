import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions, isNextAuthAdminRole } from "@/lib/auth/nextauth";

export async function getNextAuthSession() {
  return getServerSession(authOptions);
}

export async function getNextAuthAdminSession() {
  const session = await getNextAuthSession();
  if (!session || !isNextAuthAdminRole(session.user?.role)) {
    return null;
  }
  return session;
}
