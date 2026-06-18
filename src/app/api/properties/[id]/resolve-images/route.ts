import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { canEditCatalogProperty } from "@/lib/properties/access";
import { getCatalogPropertyById, updateCatalogProperty } from "@/lib/properties/server";
import { applyImageFolderToProperty } from "@/lib/properties/image-routing";
import { isCity } from "@/lib/properties/neighborhoods";
import type { City } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }
  if (!canEditCatalogProperty(session)) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  const { id } = await params;
  const property = await getCatalogPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "נכס לא נמצא" }, { status: 404 });
  }

  const body = (await request.json()) as {
    imageFolderUrl?: string;
    city?: string;
    neighborhood?: string;
    matterportThumbnailUrl?: string;
  };

  const city =
    body.city && isCity(body.city) ? (body.city as City) : property.city;
  const neighborhood = body.neighborhood?.trim() || property.neighborhood;
  const folderUrl = body.imageFolderUrl?.trim() ?? property.media.imageFolderUrl ?? "";

  const next = applyImageFolderToProperty(property, folderUrl, city, neighborhood);

  if (body.matterportThumbnailUrl !== undefined) {
    next.media.matterportThumbnailUrl = body.matterportThumbnailUrl.trim();
  }

  const updated = await updateCatalogProperty(id, {
    city,
    neighborhood,
    media: next.media,
  });

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);

  return NextResponse.json({ success: true, property: updated });
}

export const dynamic = "force-dynamic";
