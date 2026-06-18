import type { CatalogProperty, CatalogPropertyInput } from "./catalog-schema";
import type { Property } from "@/lib/types";

/** Card/gallery image — null means render the clean empty-media state (no placeholder file). */
export function resolvePropertyCardImage(
  property: Pick<Property, "image" | "images" | "matterportThumbnail" | "matterportUrl">
): string | null {
  const firstImage = property.images?.find((url) => url?.trim());
  if (firstImage) return firstImage;

  if (property.image?.trim() && !isPlaceholderImage(property.image)) {
    return property.image;
  }

  if (property.matterportUrl?.trim() && property.matterportThumbnail?.trim()) {
    return property.matterportThumbnail;
  }

  return null;
}

export function isPlaceholderImage(url: string): boolean {
  return /property-placeholder\.jpg$/i.test(url.trim());
}

export function catalogPrimaryImage(property: CatalogProperty): string {
  const first = property.media.images.find((url) => url?.trim());
  if (first) return first;

  if (
    property.media.matterportUrl?.trim() &&
    property.media.matterportThumbnailUrl?.trim()
  ) {
    return property.media.matterportThumbnailUrl;
  }

  return "";
}

export function hasPropertyVirtualTour(
  property: Pick<Property, "matterportUrl">
): boolean {
  return Boolean(property.matterportUrl?.trim());
}

export function buildEmptyMediaPatch(
  input: CatalogPropertyInput
): CatalogPropertyInput["media"] {
  return {
    ...input.media,
    images: [],
    imageFolderUrl: undefined,
  };
}
