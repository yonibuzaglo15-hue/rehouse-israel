import type { CatalogProperty } from "@/lib/properties/catalog-schema";
import { getCleanId } from "@/lib/properties/ids";

export async function fetchCatalogPropertyRaw(propertyId: string): Promise<CatalogProperty> {
  const cleanId = getCleanId(propertyId);
  if (!cleanId) {
    throw new Error("מזהה נכס לא תקין");
  }

  const res = await fetch(`/api/catalog/properties/${encodeURIComponent(cleanId)}`, {
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "טעינת הנכס נכשלה");
  }

  if (!data.raw) {
    throw new Error("לא ניתן לטעון את פרטי הנכס — חסרות הרשאות עריכה");
  }

  return { ...(data.raw as CatalogProperty), id: cleanId };
}

export async function deleteCatalogProperty(propertyId: string): Promise<void> {
  const cleanId = getCleanId(propertyId);
  if (!cleanId) {
    throw new Error("מזהה נכס לא תקין");
  }

  const res = await fetch(`/api/properties/${encodeURIComponent(cleanId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "מחיקת הנכס נכשלה");
  }
}
