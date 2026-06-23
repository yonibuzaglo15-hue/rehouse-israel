import type { City, ListingType, Property } from "@/lib/types";
import type { PropertyStatus } from "./types";
import { catalogPrimaryImage as resolveCatalogPrimaryImage } from "./property-images";

/** Flexible value type for Google Sheets / dynamic columns */
export type PropertyAttributeValue = string | number | boolean | string[] | null;

export interface CatalogPropertyMedia {
  images: string[];
  /** Explicit cover / hero image — falls back to first image in `images` */
  coverImage?: string;
  videoUrl: string;
  matterportUrl: string;
  /** Cloud/local folder base URL for numbered images (1.jpg, 2.jpg, …) */
  imageFolderUrl?: string;
  matterportThumbnailUrl?: string;
}

/**
 * Canonical property record — source of truth for catalog + admin editing.
 * Unknown sheet columns land in `attributes` until mapped explicitly.
 */
export interface CatalogProperty {
  id: string;
  externalId?: string;
  sourceSheet?: string;

  title: string;
  description: string;
  listingType: ListingType;
  city: City;
  neighborhood: string;

  price: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;

  mamad: boolean;
  balcony: boolean;
  parking: boolean;
  elevator: boolean;
  storage: boolean;

  street: string;
  houseNumber: string;

  media: CatalogPropertyMedia;
  featured: boolean;
  status: PropertyStatus;
  published: boolean;

  agentId: string;
  agentEmail: string;
  agentName: string;

  /** Dynamic criteria from Google Sheets — extensible without schema migrations */
  attributes: Record<string, PropertyAttributeValue>;

  recruitedAt: string;
  updatedAt: string;
}

export type CatalogPropertyInput = Omit<
  CatalogProperty,
  "id" | "recruitedAt" | "updatedAt"
> & {
  id?: string;
  recruitedAt?: string;
  updatedAt?: string;
};

export interface CatalogPropertyUpdateInput {
  title?: string;
  description?: string;
  listingType?: ListingType;
  city?: City;
  neighborhood?: string;
  price?: number;
  rooms?: number;
  area?: number;
  floor?: number;
  totalFloors?: number;
  mamad?: boolean;
  balcony?: boolean;
  parking?: boolean;
  elevator?: boolean;
  storage?: boolean;
  street?: string;
  houseNumber?: string;
  media?: Partial<CatalogPropertyMedia>;
  featured?: boolean;
  status?: PropertyStatus;
  published?: boolean;
  attributes?: Record<string, PropertyAttributeValue>;
}

export interface PropertyImportRow {
  [column: string]: unknown;
}

export interface PropertyImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export function catalogPrimaryImage(property: CatalogProperty): string {
  return resolveCatalogPrimaryImage(property);
}

export function catalogToPublicProperty(property: CatalogProperty): Property {
  const coverImage =
    property.media.coverImage?.trim() ||
    property.media.images.find((url) => url?.trim()) ||
    "";

  const propertyType =
    typeof property.attributes.propertyType === "string"
      ? property.attributes.propertyType
      : undefined;

  return {
    id: property.id,
    title: property.title,
    description: property.description,
    listingType: property.listingType,
    city: property.city,
    neighborhood: property.neighborhood,
    price: property.price,
    rooms: property.rooms,
    area: property.area,
    propertyType,
    floor: property.floor,
    totalFloors: property.totalFloors,
    hasSafeRoom: property.mamad,
    hasBalcony: property.balcony,
    hasElevator: property.elevator,
    mamad: property.mamad,
    balcony: property.balcony,
    parking: property.parking,
    elevator: property.elevator,
    storage: property.storage,
    coverImage: coverImage || undefined,
    image: catalogPrimaryImage(property),
    images: property.media.images,
    virtualTourUrl: property.media.matterportUrl || undefined,
    matterportUrl: property.media.matterportUrl || undefined,
    matterportThumbnail: property.media.matterportThumbnailUrl || undefined,
    agentId: property.agentId || undefined,
    agentName: property.agentName || undefined,
    featured: property.featured,
    attributes: property.attributes,
    published: property.published,
    status: property.status,
  };
}

export function isPublishedCatalogProperty(property: CatalogProperty): boolean {
  if (!property.published) return false;
  return property.status === "active" || property.status === "exclusive";
}

export function createEmptyCatalogProperty(
  partial: Partial<CatalogPropertyInput> = {}
): CatalogProperty {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    externalId: partial.externalId,
    sourceSheet: partial.sourceSheet,
    title: partial.title ?? "",
    description: partial.description ?? "",
    listingType: partial.listingType ?? "buy",
    city: partial.city ?? "ashdod",
    neighborhood: partial.neighborhood ?? "",
    price: partial.price ?? 0,
    rooms: partial.rooms ?? 0,
    area: partial.area ?? 0,
    floor: partial.floor ?? 0,
    totalFloors: partial.totalFloors ?? 1,
    mamad: partial.mamad ?? false,
    balcony: partial.balcony ?? false,
    parking: partial.parking ?? false,
    elevator: partial.elevator ?? false,
    storage: partial.storage ?? false,
    street: partial.street ?? "",
    houseNumber: partial.houseNumber ?? "",
    media: {
      images: partial.media?.images ?? [],
      coverImage: partial.media?.coverImage,
      videoUrl: partial.media?.videoUrl ?? "",
      matterportUrl: partial.media?.matterportUrl ?? "",
      imageFolderUrl: partial.media?.imageFolderUrl,
      matterportThumbnailUrl: partial.media?.matterportThumbnailUrl,
    },
    featured: partial.featured ?? false,
    status: partial.status ?? "active",
    published: partial.published ?? true,
    agentId: partial.agentId ?? "",
    agentEmail: partial.agentEmail ?? "",
    agentName: partial.agentName ?? "",
    attributes: partial.attributes ?? {},
    recruitedAt: partial.recruitedAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}

/** Normalize partial data into a complete CatalogPropertyInput (all required fields). */
export function buildCatalogPropertyInput(
  partial: Partial<CatalogPropertyInput> = {}
): CatalogPropertyInput {
  const property = createEmptyCatalogProperty(partial);
  const {
    id,
    recruitedAt,
    updatedAt,
    ...required
  } = property;

  return {
    ...required,
    ...(partial.id !== undefined ? { id: partial.id } : {}),
    ...(partial.recruitedAt !== undefined ? { recruitedAt: partial.recruitedAt } : {}),
    ...(partial.updatedAt !== undefined ? { updatedAt: partial.updatedAt } : {}),
  };
}
