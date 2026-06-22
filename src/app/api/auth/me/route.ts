import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDashboardPathForRole } from "@/lib/auth/routes";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.id,
      email: session.email,
      role: session.role,
      fullName: session.fullName,
      roleLabel: ROLE_LABELS[session.role],
      dashboardPath: getDashboardPathForRole(session.role),
    },
  });
}
