import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canEditCatalogProperty } from "@/lib/properties/access";
import { catalogToPublicProperty } from "@/lib/properties/catalog-schema";
import { getCatalogPropertyById } from "@/lib/properties/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const property = await getCatalogPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "נכס לא נמצא" }, { status: 404 });
  }

  const session = await getSession();
  const canEdit = session ? canEditCatalogProperty(session) : false;

  return NextResponse.json({
    property: catalogToPublicProperty(property),
    ...(canEdit ? { raw: property } : {}),
  });
}

export const dynamic = "force-dynamic";
