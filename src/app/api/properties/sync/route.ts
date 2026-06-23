import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canManageAllProperties } from "@/lib/auth/permissions";
import { syncFromGoogle } from "@/lib/properties/sync-from-google";

function isAuthorizedSync(request: Request, session: Awaited<ReturnType<typeof getSession>>) {
  const secret = process.env.PROPERTY_SYNC_SECRET?.trim();
  const headerSecret = request.headers.get("x-sync-secret")?.trim();
  if (secret && headerSecret && secret === headerSecret) {
    return true;
  }

  return Boolean(session && canManageAllProperties(session.role));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!isAuthorizedSync(request, session)) {
    return NextResponse.json({ error: "לא מחובר או אין הרשאה לסנכרון" }, { status: 401 });
  }

  let body: {
    downloadImages?: boolean;
    syncAgents?: boolean;
    agentsGid?: string;
  } = {};

  try {
    body = await request.json();
  } catch {
    // empty body is fine
  }

  try {
    const result = await syncFromGoogle({
      downloadImages: body.downloadImages,
      syncAgents: body.syncAgents,
      agentsGid: body.agentsGid,
    });

    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath("/agents");
    revalidatePath("/projects");

    return NextResponse.json({
      success: true,
      provider: process.env.SUPABASE_URL ? "supabase" : "file",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "סנכרון נכשל";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 300;
