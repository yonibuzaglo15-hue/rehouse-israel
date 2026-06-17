import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  addManagedProperty,
  filterPropertiesForSession,
  listManagedProperties,
} from "@/lib/properties";
import { validatePropertyIntake } from "@/lib/properties/validation";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const properties = filterPropertiesForSession(
    listManagedProperties(),
    session
  );

  return NextResponse.json({
    properties,
    role: session.role,
    canViewAll: session.role === "dev" || session.role === "admin",
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const body = await request.json();
  const validation = validatePropertyIntake(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const property = addManagedProperty(validation.data, {
    id: session.id,
    email: session.email,
    fullName: session.fullName,
  });

  return NextResponse.json({ success: true, property }, { status: 201 });
}
