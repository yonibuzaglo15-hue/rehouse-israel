import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canEditCatalogProperty } from "@/lib/properties/access";
import {
  catalogToPublicProperty,
  isPublishedCatalogProperty,
  type CatalogProperty,
} from "@/lib/properties/catalog-schema";
import {
  getCatalogPropertyById,
  listPublishedCatalogProperties,
} from "@/lib/properties/server";
import PropertyDetailPage from "./PropertyDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = await getCatalogPropertyById(id);
  if (!property) return { title: "נכס לא נמצא" };
  const publicProperty = catalogToPublicProperty(property);
  return {
    title: publicProperty.title,
    description: publicProperty.description,
    openGraph: {
      title: publicProperty.title,
      description: publicProperty.description,
      images: [{ url: publicProperty.image }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const [property, session, publishedList] = await Promise.all([
    getCatalogPropertyById(id),
    getSession(),
    listPublishedCatalogProperties(),
  ]);

  if (!property) notFound();

  const canEdit = session ? canEditCatalogProperty(session) : false;
  const canView =
    canEdit || isPublishedCatalogProperty(property);

  if (!canView) notFound();

  const publicProperty = catalogToPublicProperty(property);
  const related = publishedList
    .filter((p: CatalogProperty) => p.id !== property.id && p.city === property.city)
    .slice(0, 3)
    .map(catalogToPublicProperty);

  return (
    <PropertyDetailPage
      property={publicProperty}
      related={related}
      canEdit={canEdit}
    />
  );
}
