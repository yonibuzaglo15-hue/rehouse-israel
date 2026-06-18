import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  canEditCatalogProperty,
  canEditManagedProperty,
} from "@/lib/properties/access";
import { validateCatalogPropertyUpdate } from "@/lib/properties/catalog-validation";
import { catalogToManagedProperty } from "@/lib/properties/adapters";
import {
  getCatalogPropertyById,
  updateCatalogProperty,
} from "@/lib/properties/server";
import { isValidNeighborhood } from "@/lib/properties/neighborhoods";
import type { PropertyStatus } from "@/lib/properties/types";

const VALID_STATUSES: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getCatalogPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "נכס לא נמצא" }, { status: 404 });
  }

  if (!canEditCatalogProperty(session)) {
    return NextResponse.json({ error: "אין הרשאה לערוך נכס זה" }, { status: 403 });
  }

  const body = await request.json();
  const validation = validateCatalogPropertyUpdate(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (
    validation.data.neighborhood &&
    !validation.data.city &&
    !isValidNeighborhood(property.city, validation.data.neighborhood)
  ) {
    return NextResponse.json({ error: "השכונה אינה תקינה עבור העיר" }, { status: 400 });
  }

  const updated = await updateCatalogProperty(id, validation.data);
  if (!updated) {
    return NextResponse.json({ error: "עדכון הנכס נכשל" }, { status: 500 });
  }

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  revalidatePath("/");

  return NextResponse.json({ success: true, property: updated });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getCatalogPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "נכס לא נמצא" }, { status: 404 });
  }

  const managedView = catalogToManagedProperty(property);
  if (!canEditManagedProperty(managedView, session)) {
    return NextResponse.json({ error: "אין הרשאה לערוך נכס זה" }, { status: 403 });
  }

  const body = (await request.json()) as {
    status?: PropertyStatus;
    askingPrice?: number;
  };

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "סטטוס אינו תקין" }, { status: 400 });
  }

  if (
    body.askingPrice !== undefined &&
    (!Number.isFinite(body.askingPrice) || body.askingPrice <= 0)
  ) {
    return NextResponse.json({ error: "מחיר אינו תקין" }, { status: 400 });
  }

  const updated = await updateCatalogProperty(id, {
    ...(body.status !== undefined ? { status: body.status } : {}),
    ...(body.askingPrice !== undefined ? { price: body.askingPrice } : {}),
  });

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);

  return NextResponse.json({
    success: true,
    property: updated ? catalogToManagedProperty(updated) : null,
  });
}
