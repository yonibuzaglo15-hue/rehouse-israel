import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { CatalogProperty } from "@/lib/properties/catalog-schema";
import { catalogPropertyApiPath, normalizePropertyId, propertyApiPath } from "@/lib/properties/ids";

export async function fetchCatalogPropertyRaw(propertyId: string): Promise<CatalogProperty> {
  const safeId = normalizePropertyId(propertyId);
  const apiPath = catalogPropertyApiPath(safeId);

  if (!apiPath) {
    throw new Error("מזהה נכס לא תקין");
  }

  const res = await fetch(apiPath, { credentials: "include" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "טעינת הנכס נכשלה");
  }

  if (!data.raw) {
    throw new Error("לא ניתן לטעון את פרטי הנכס — חסרות הרשאות עריכה");
  }

  return { ...(data.raw as CatalogProperty), id: safeId };
}

export async function duplicateCatalogProperty(
  propertyId: string,
  router: AppRouterInstance,
): Promise<void> {
  const raw = await fetchCatalogPropertyRaw(propertyId);
  const { id: _id, recruitedAt: _r, updatedAt: _u, ...rest } = raw;
  const duplicate = {
    ...rest,
    title: `${raw.title} (עותק)`,
    published: false,
  };

  sessionStorage.setItem("rehouse:duplicate-property", JSON.stringify(duplicate));
  router.push("/admin/property/new?duplicate=1");
}

export async function deleteCatalogProperty(propertyId: string): Promise<void> {
  const deletePath = propertyApiPath(propertyId);

  if (!deletePath) {
    throw new Error("מזהה נכס לא תקין");
  }

  const res = await fetch(deletePath, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "מחיקת הנכס נכשלה");
  }
}
