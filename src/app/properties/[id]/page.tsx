import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyById, MOCK_PROPERTIES } from "@/lib/constants";
import PropertyDetailPage from "./PropertyDetailPage";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_PROPERTIES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) return { title: "נכס לא נמצא" };
  return {
    title: property.title,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: [{ url: property.image }],
    },
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const property = getPropertyById(id);
  if (!property) notFound();
  return <PropertyDetailPage property={property} />;
}
