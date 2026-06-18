import type { City, ListingType } from "@/lib/types";
import { isCity, isValidNeighborhood } from "./neighborhoods";
import type { CatalogPropertyUpdateInput } from "./catalog-schema";
import type { PropertyStatus } from "./types";

const VALID_STATUSES: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

export function validateCatalogPropertyUpdate(
  body: unknown
): { success: true; data: CatalogPropertyUpdateInput } | { success: false; error: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "נתוני העדכון אינם תקינים" };
  }

  const raw = body as Record<string, unknown>;
  const updates: CatalogPropertyUpdateInput = {};

  if (raw.title !== undefined) {
    const title = String(raw.title).trim();
    if (!title) return { success: false, error: "כותרת הנכס חייבת להיות מלאה" };
    updates.title = title;
  }

  if (raw.description !== undefined) {
    updates.description = String(raw.description).trim();
  }

  if (raw.listingType !== undefined) {
    const listingType = String(raw.listingType) as ListingType;
    if (listingType !== "buy" && listingType !== "rent") {
      return { success: false, error: "סוג עסקה אינו תקין" };
    }
    updates.listingType = listingType;
  }

  if (raw.city !== undefined) {
    const cityRaw = String(raw.city).trim();
    if (!isCity(cityRaw)) return { success: false, error: "עיר אינה תקינה" };
    updates.city = cityRaw as City;
  }

  if (raw.neighborhood !== undefined) {
    const neighborhood = String(raw.neighborhood).trim();
    if (!neighborhood) return { success: false, error: "שכונה / רובע חובה" };
    updates.neighborhood = neighborhood;
  }

  if (raw.city !== undefined && raw.neighborhood !== undefined && updates.city && updates.neighborhood) {
    if (!isValidNeighborhood(updates.city, updates.neighborhood)) {
      return { success: false, error: "השכונה אינה תקינה עבור העיר" };
    }
  }

  if (raw.price !== undefined) {
    const price = Number(raw.price);
    if (!Number.isFinite(price) || price <= 0) {
      return { success: false, error: "מחיר אינו תקין" };
    }
    updates.price = price;
  }

  if (raw.askingPrice !== undefined) {
    const price = Number(raw.askingPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return { success: false, error: "מחיר אינו תקין" };
    }
    updates.price = price;
  }

  if (raw.rooms !== undefined) {
    const rooms = Number(raw.rooms);
    if (!Number.isFinite(rooms) || rooms < 1) {
      return { success: false, error: "מספר חדרים אינו תקין" };
    }
    updates.rooms = rooms;
  }

  if (raw.area !== undefined) {
    const area = Number(raw.area);
    if (!Number.isFinite(area) || area < 0) {
      return { success: false, error: "שטח אינו תקין" };
    }
    updates.area = area;
  }

  if (raw.floor !== undefined) {
    const floor = Number(raw.floor);
    if (!Number.isFinite(floor) || floor < 0) {
      return { success: false, error: "קומה אינה תקינה" };
    }
    updates.floor = floor;
  }

  if (raw.totalFloors !== undefined) {
    const totalFloors = Number(raw.totalFloors);
    if (!Number.isFinite(totalFloors) || totalFloors < 1) {
      return { success: false, error: "מספר קומות בבניין אינו תקין" };
    }
    updates.totalFloors = totalFloors;
  }

  if (raw.mamad !== undefined) updates.mamad = Boolean(raw.mamad);
  if (raw.balcony !== undefined) updates.balcony = Boolean(raw.balcony);
  if (raw.parking !== undefined) updates.parking = Boolean(raw.parking);
  if (raw.elevator !== undefined) updates.elevator = Boolean(raw.elevator);
  if (raw.storage !== undefined) updates.storage = Boolean(raw.storage);
  if (raw.featured !== undefined) updates.featured = Boolean(raw.featured);
  if (raw.published !== undefined) updates.published = Boolean(raw.published);

  if (raw.street !== undefined) updates.street = String(raw.street).trim();
  if (raw.houseNumber !== undefined) {
    updates.houseNumber = String(raw.houseNumber).trim();
  }

  if (raw.status !== undefined) {
    const status = String(raw.status) as PropertyStatus;
    if (!VALID_STATUSES.includes(status)) {
      return { success: false, error: "סטטוס הנכס אינו תקין" };
    }
    updates.status = status;
  }

  if (raw.attributes !== undefined) {
    if (!raw.attributes || typeof raw.attributes !== "object" || Array.isArray(raw.attributes)) {
      return { success: false, error: "מאפיינים דינמיים אינם תקינים" };
    }
    updates.attributes = raw.attributes as CatalogPropertyUpdateInput["attributes"];
  }

  if (raw.media !== undefined && typeof raw.media === "object" && raw.media) {
    const media = raw.media as Record<string, unknown>;
    updates.media = {
      ...(Array.isArray(media.images) ? { images: media.images.map(String) } : {}),
      ...(media.videoUrl !== undefined ? { videoUrl: String(media.videoUrl) } : {}),
      ...(media.matterportUrl !== undefined
        ? { matterportUrl: String(media.matterportUrl) }
        : {}),
    };
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "לא נשלחו שדות לעדכון" };
  }

  return { success: true, data: updates };
}
