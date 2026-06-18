import type { City } from "@/lib/types";
import type { CatalogProperty } from "./catalog-schema";
import { catalogPrimaryImage, isPlaceholderImage } from "./property-images";
const MAX_FOLDER_IMAGES = 20;
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/** Build public folder path from city + neighborhood when no explicit URL is set */
export function buildDefaultImageFolderPath(city: City, neighborhood: string): string {
  const slug = neighborhood
    .replace(/[^\u0590-\u05FFa-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `/images/properties/${city}/${slug}`;
}

export function normalizeFolderBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** Resolve numbered images from folder base (1.jpg … N.jpg) */
export function resolveImagesFromFolder(
  folderBaseUrl: string,
  max = MAX_FOLDER_IMAGES
): string[] {
  const base = normalizeFolderBaseUrl(folderBaseUrl);
  if (!base) return [];

  const images: string[] = [];
  for (let i = 1; i <= max; i++) {
    images.push(`${base}/${i}.jpg`);
  }
  return images;
}

export function getPropertyDisplayImage(property: CatalogProperty): string {
  const image = catalogPrimaryImage(property);
  if (!image || isPlaceholderImage(image)) return "";
  return image;
}

export function applyImageFolderToProperty(
  property: CatalogProperty,
  folderBaseUrl: string,
  city?: City,
  neighborhood?: string
): CatalogProperty {
  const resolvedBase =
    folderBaseUrl.trim() ||
    (city && neighborhood ? buildDefaultImageFolderPath(city, neighborhood) : "");

  const images = resolveImagesFromFolder(resolvedBase);

  return {
    ...property,
    city: city ?? property.city,
    neighborhood: neighborhood ?? property.neighborhood,
    media: {
      ...property.media,
      imageFolderUrl: resolvedBase || undefined,
      images: images.length > 0 ? images : property.media.images,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function hasVirtualTour(property: Pick<CatalogProperty, "media">): boolean {
  return Boolean(property.media.matterportUrl?.trim());
}

export { MAX_FOLDER_IMAGES, IMAGE_EXTENSIONS };
