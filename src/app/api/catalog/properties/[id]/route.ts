import { NextResponse } from "next/server";
import { canAdminEditCatalog } from "@/lib/auth/admin-access";
import { getSession } from "@/lib/auth/session";
import { canEditCatalogProperty } from "@/lib/properties/access";
import { catalogToPublicProperty } from "@/lib/properties/catalog-schema";
import { getCleanId } from "@/lib/properties/ids";
import { getCatalogPropertyById } from "@/lib/properties/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id: rawParam } = await params;
    const id = getCleanId(rawParam);

    if (!id) {
      return NextResponse.json({ error: "מזהה נכס לא תקין" }, { status: 400 });
    }

    const property = await getCatalogPropertyById(id);
    if (!property) {
      return NextResponse.json({ error: "נכס לא נמצא" }, { status: 404 });
    }

    const session = await getSession();
    const canEdit =
      (await canAdminEditCatalog()) || (session ? canEditCatalogProperty(session) : false);

    return NextResponse.json({
      property: catalogToPublicProperty(property),
      ...(canEdit ? { raw: property } : {}),
    });
  } catch (error) {
    console.error("CRITICAL SUPABASE ERROR:", error instanceof Error ? error.message : error);
    console.error("[GET /api/catalog/properties/[id]]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
