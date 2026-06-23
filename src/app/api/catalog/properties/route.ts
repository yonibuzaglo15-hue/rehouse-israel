import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { canAdminEditCatalog } from "@/lib/auth/admin-access";
import {
  buildCatalogPropertyInput,
  catalogToPublicProperty,
} from "@/lib/properties/catalog-schema";
import { validateCatalogPropertyCreate } from "@/lib/properties/catalog-validation";
import {
  createCatalogProperty,
  listPublishedCatalogProperties,
} from "@/lib/properties/server";

export async function GET() {
  try {
    const properties = await listPublishedCatalogProperties();
    return NextResponse.json({
      properties: properties.map(catalogToPublicProperty),
      count: properties.length,
    });
  } catch (error) {
    console.error("CRITICAL SUPABASE ERROR:", error instanceof Error ? error.message : error);
    console.error("[GET /api/catalog/properties]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await canAdminEditCatalog())) {
    return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = validateCatalogPropertyCreate(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data } = validation;
    const property = await createCatalogProperty(
      buildCatalogPropertyInput({
        title: data.title,
        description: data.description ?? "",
        listingType: data.listingType ?? "buy",
        city: data.city,
        neighborhood: data.neighborhood ?? "",
        price: data.price,
        rooms: data.rooms,
        floor: data.floor,
        totalFloors: data.totalFloors,
        mamad: data.hasSafeRoom,
        balcony: data.hasBalcony,
        elevator: data.hasElevator,
        status: data.status,
        published: data.status === "active" || data.status === "exclusive",
        attributes: {
          propertyType: data.propertyType,
        },
        media: {
          images: data.images,
          coverImage: data.coverImage,
          videoUrl: "",
          matterportUrl: data.virtualTourUrl,
        },
        agentName: "Rehouse Israel",
        agentEmail: "admin@rehouse.co.il",
      }),
    );

    revalidatePath("/");
    revalidatePath("/properties");
    revalidatePath(`/properties/${property.id}`);

    return NextResponse.json({
      success: true,
      property: catalogToPublicProperty(property),
    });
  } catch (error) {
    console.error("CRITICAL SUPABASE ERROR:", error instanceof Error ? error.message : error);
    console.error("[POST /api/catalog/properties]", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
