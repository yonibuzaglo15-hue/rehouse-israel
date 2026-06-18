import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageAllProperties } from "@/lib/auth/permissions";
import { importCatalogRows } from "@/lib/properties/server";
import { normalizeImportPayload } from "@/lib/properties/import-parser";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  if (!canManageAllProperties(session.role)) {
    return NextResponse.json({ error: "אין הרשאה לייבוא נכסים" }, { status: 403 });
  }

  const body = await request.json();
  const rows = normalizeImportPayload(body);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "לא נמצאו שורות לייבוא. שלחו rows[], properties[] או csv." },
      { status: 400 }
    );
  }

  const result = await importCatalogRows(rows);

  revalidatePath("/properties");
  revalidatePath("/");

  return NextResponse.json({
    success: true,
    provider: process.env.SUPABASE_URL ? "supabase" : "file",
    result,
  });
}
