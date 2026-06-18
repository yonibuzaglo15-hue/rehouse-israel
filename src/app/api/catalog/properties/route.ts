import { NextResponse } from "next/server";
import {
  catalogToPublicProperty,
  isPublishedCatalogProperty,
} from "@/lib/properties/catalog-schema";
import { listPublishedCatalogProperties } from "@/lib/properties/server";

export async function GET() {
  const properties = await listPublishedCatalogProperties();
  return NextResponse.json({
    properties: properties.map(catalogToPublicProperty),
    count: properties.length,
  });
}

export const dynamic = "force-dynamic";
