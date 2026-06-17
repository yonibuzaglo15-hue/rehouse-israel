import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  canEditManagedProperty,
  getManagedPropertyById,
  updateManagedProperty,
} from "@/lib/properties";
import type { PropertyStatus } from "@/lib/properties/types";

const VALID_STATUSES: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const { id } = await params;
  const property = getManagedPropertyById(id);
  if (!property) {
    return NextResponse.json({ error: "נכס לא נמצא" }, { status: 404 });
  }

  if (!canEditManagedProperty(property, session)) {
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

  const updated = updateManagedProperty(id, {
    status: body.status,
    askingPrice: body.askingPrice,
  });

  return NextResponse.json({ success: true, property: updated });
}
