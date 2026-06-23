import type { City, ListingType } from "@/lib/types";
import { isCity, isValidNeighborhood } from "./neighborhoods";
import type { CatalogPropertyUpdateInput } from "./catalog-schema";
import type { PropertyStatus } from "./types";
import { isPropertyType } from "./property-types";

const VALID_STATUSES: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

function parseOptionalBoolean(raw: unknown): boolean | undefined {
  if (raw === undefined) return undefined;
  return Boolean(raw);
}

function parseFloorValue(raw: unknown, label: string): number | { error: string } {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    return { error: `${label} אינה תקינה` };
  }
  return value;
}

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
    const floor = parseFloorValue(raw.floor, "קומה");
    if (typeof floor === "object") return { success: false, error: floor.error };
    updates.floor = floor;
  }

  if (raw.totalFloors !== undefined) {
    const totalFloors = Number(raw.totalFloors);
    if (!Number.isFinite(totalFloors) || totalFloors < 1) {
      return { success: false, error: "מספר קומות בבניין אינו תקין" };
    }
    updates.totalFloors = totalFloors;
  }

  const hasSafeRoom = parseOptionalBoolean(raw.hasSafeRoom);
  const hasBalcony = parseOptionalBoolean(raw.hasBalcony);
  const hasElevator = parseOptionalBoolean(raw.hasElevator);
  if (hasSafeRoom !== undefined) updates.mamad = hasSafeRoom;
  if (hasBalcony !== undefined) updates.balcony = hasBalcony;
  if (hasElevator !== undefined) updates.elevator = hasElevator;
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

  if (raw.propertyType !== undefined) {
    const propertyType = String(raw.propertyType).trim();
    if (propertyType && !isPropertyType(propertyType)) {
      return { success: false, error: "סוג הנכס אינו תקין" };
    }
    updates.attributes = {
      ...(updates.attributes ?? {}),
      propertyType: propertyType || null,
    };
  }

  if (raw.coverImage !== undefined) {
    updates.media = {
      ...updates.media,
      coverImage: String(raw.coverImage).trim(),
    };
  }

  if (raw.media !== undefined && typeof raw.media === "object" && raw.media) {
    const media = raw.media as Record<string, unknown>;
    updates.media = {
      ...(Array.isArray(media.images) ? { images: media.images.map(String) } : {}),
      ...(media.coverImage !== undefined ? { coverImage: String(media.coverImage) } : {}),
      ...(media.videoUrl !== undefined ? { videoUrl: String(media.videoUrl) } : {}),
      ...(media.matterportUrl !== undefined
        ? { matterportUrl: String(media.matterportUrl) }
        : {}),
      ...(media.virtualTourUrl !== undefined
        ? { matterportUrl: String(media.virtualTourUrl) }
        : {}),
    };
  }

  if (Array.isArray(raw.images)) {
    const images = raw.images.map(String).map((url) => url.trim()).filter(Boolean);
    updates.media = {
      ...updates.media,
      images,
    };
    if (!updates.media?.coverImage && images[0]) {
      updates.media = {
        ...updates.media,
        coverImage: images[0],
      };
    }
  }

  if (raw.virtualTourUrl !== undefined) {
    updates.media = {
      ...updates.media,
      matterportUrl: String(raw.virtualTourUrl).trim(),
    };
  }

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "לא נשלחו שדות לעדכון" };
  }

  return { success: true, data: updates };
}

export interface CatalogPropertyCreatePayload {
  title: string;
  price: number;
  city: City;
  rooms: number;
  status: PropertyStatus;
  images: string[];
  coverImage: string;
  virtualTourUrl: string;
  propertyType: string;
  floor: number;
  totalFloors: number;
  hasSafeRoom: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  neighborhood?: string;
  listingType?: ListingType;
  description?: string;
}

export function validateCatalogPropertyCreate(
  body: unknown
): { success: true; data: CatalogPropertyCreatePayload } | { success: false; error: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "נתוני הטופס אינם תקינים" };
  }

  const raw = body as Record<string, unknown>;
  const title = String(raw.title ?? "").trim();
  const cityRaw = String(raw.city ?? "").trim();
  const rooms = Number(raw.rooms);
  const price = Number(raw.price);
  const status = String(raw.status ?? "active") as PropertyStatus;

  if (!title) return { success: false, error: "כותרת הנכס חובה" };
  if (!isCity(cityRaw)) return { success: false, error: "נא לבחור עיר" };
  if (!Number.isFinite(rooms) || rooms < 1) {
    return { success: false, error: "מספר חדרים אינו תקין" };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { success: false, error: "מחיר חייב להיות גדול מ-0" };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "סטטוס הנכס אינו תקין" };
  }

  const images = Array.isArray(raw.images)
    ? raw.images.map(String).map((url) => url.trim()).filter(Boolean)
    : [];

  const listingType = String(raw.listingType ?? "buy") as ListingType;
  if (listingType !== "buy" && listingType !== "rent") {
    return { success: false, error: "סוג עסקה אינו תקין" };
  }

  const neighborhood = String(raw.neighborhood ?? "").trim();
  const city = cityRaw as City;

  const propertyType = String(raw.propertyType ?? "דירה").trim();
  if (!isPropertyType(propertyType)) {
    return { success: false, error: "סוג הנכס אינו תקין" };
  }

  const floorResult = parseFloorValue(raw.floor ?? 0, "קומה");
  if (typeof floorResult === "object") {
    return { success: false, error: floorResult.error };
  }

  const totalFloors = Number(raw.totalFloors ?? 1);
  if (!Number.isFinite(totalFloors) || totalFloors < 1) {
    return { success: false, error: "מספר קומות בבניין אינו תקין" };
  }

  const coverImage = String(raw.coverImage ?? "").trim() || images[0] || "";

  return {
    success: true,
    data: {
      title,
      price,
      city,
      rooms,
      status,
      images,
      coverImage,
      virtualTourUrl: String(raw.virtualTourUrl ?? "").trim(),
      propertyType,
      floor: floorResult,
      totalFloors,
      hasSafeRoom: Boolean(raw.hasSafeRoom),
      hasBalcony: Boolean(raw.hasBalcony),
      hasElevator: Boolean(raw.hasElevator),
      neighborhood,
      listingType,
      description: String(raw.description ?? "").trim(),
    },
  };
}
