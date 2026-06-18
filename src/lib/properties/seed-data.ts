import type { CatalogProperty } from "./catalog-schema";
import { isPublishedCatalogProperty } from "./catalog-schema";
import { buildOfficialFallbackCatalogProperties } from "./official-fallback-seed";

/** @deprecated Use buildOfficialFallbackCatalogProperties for new seeds */
export function buildSeedCatalogProperties(): CatalogProperty[] {
  return buildOfficialFallbackCatalogProperties();
}

export function getPublishedOfficialFallback(): CatalogProperty[] {
  return buildOfficialFallbackCatalogProperties().filter(isPublishedCatalogProperty);
}
