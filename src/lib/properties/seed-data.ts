import type { CatalogProperty } from "./catalog-schema";
import { isPublishedCatalogProperty } from "./catalog-schema";
import { buildOfficialFallbackCatalogProperties } from "./official-fallback-seed";

export function getPublishedOfficialFallback(): CatalogProperty[] {
  return buildOfficialFallbackCatalogProperties().filter(isPublishedCatalogProperty);
}
