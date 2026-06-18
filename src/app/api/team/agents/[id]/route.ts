import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageAllProperties } from "@/lib/auth/permissions";
import { getAgentProfileById, updateAgentProfile } from "@/lib/agents/server";
import type { AgentProfileUpdate } from "@/lib/agents/types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }
  if (!canManageAllProperties(session.role)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getAgentProfileById(id);
  if (!existing) {
    return NextResponse.json({ error: "סוכן לא נמצא" }, { status: 404 });
  }

  const body = (await request.json()) as AgentProfileUpdate;
  const updated = await updateAgentProfile(id, body);
  if (!updated) {
    return NextResponse.json({ error: "עדכון נכשל" }, { status: 500 });
  }

  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);

  return NextResponse.json({ success: true, agent: updated });
}

export const dynamic = "force-dynamic";
