import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageAllProperties } from "@/lib/auth/permissions";
import { listAgentProfiles } from "@/lib/agents/server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }
  if (!canManageAllProperties(session.role)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const agents = await listAgentProfiles();
  return NextResponse.json({ agents });
}

export const dynamic = "force-dynamic";
