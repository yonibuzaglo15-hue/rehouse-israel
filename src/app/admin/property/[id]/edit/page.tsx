import { notFound, redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin-access";
import AdminPropertyForm from "@/components/admin/AdminPropertyForm";
import { getCatalogPropertyById } from "@/lib/properties/server";
import { PROPERTY_TYPE_OPTIONS, type PropertyTypeOption } from "@/lib/properties/property-types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const access = await getAdminAccess();
  if (!access) redirect("/?login=1");

  const { id } = await params;
  const property = await getCatalogPropertyById(id);
  if (!property) notFound();

  const propertyType: PropertyTypeOption =
    typeof property.attributes.propertyType === "string" &&
    PROPERTY_TYPE_OPTIONS.includes(
      property.attributes.propertyType as PropertyTypeOption
    )
      ? (property.attributes.propertyType as PropertyTypeOption)
      : "דירה";

  const coverImage =
    property.media.coverImage?.trim() ||
    property.media.images.find((url) => url?.trim()) ||
    "";

  return (
    <AdminPropertyForm
      mode="edit"
      propertyId={property.id}
      initialValues={{
        title: property.title,
        price: String(property.price),
        city: property.city,
        rooms: String(property.rooms),
        status: property.status,
        propertyType,
        floor: String(property.floor),
        totalFloors: String(property.totalFloors),
        hasSafeRoom: property.mamad,
        hasBalcony: property.balcony,
        hasElevator: property.elevator,
        images:
          property.media.images.length > 0 ? property.media.images : [""],
        coverImage,
        virtualTourUrl: property.media.matterportUrl ?? "",
      }}
    />
  );
}
