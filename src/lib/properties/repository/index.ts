import "server-only";

import { hydrateCatalogPropertiesMedia, hydrateCatalogPropertyMedia } from "../catalog-media-hydration";
import { supabasePropertyRepository } from "./supabase-repository";
import type { PropertyRepository } from "./types";

let repository: PropertyRepository | null = null;

export function getPropertyRepository(): PropertyRepository {
  if (!repository) {
    repository = supabasePropertyRepository;
  }
  return repository;
}

export async function listCatalogProperties() {
  return getPropertyRepository().listAll();
}

export async function listPublishedCatalogProperties() {
  try {
    const list = await getPropertyRepository().listPublished();
    return hydrateCatalogPropertiesMedia(list);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const details =
      error && typeof error === "object" && "details" in error
        ? (error as { details?: string }).details
        : undefined;
    console.error("CRITICAL SUPABASE ERROR:", message, details);
    return [];
  }
}

export async function getCatalogPropertyById(id: string) {
  const property = await getPropertyRepository().getById(id);
  return property ? hydrateCatalogPropertyMedia(property) : null;
}

export async function updateCatalogProperty(
  id: string,
  updates: Parameters<PropertyRepository["update"]>[1],
) {
  return getPropertyRepository().update(id, updates);
}

export async function createCatalogProperty(
  input: Parameters<PropertyRepository["create"]>[0],
) {
  return getPropertyRepository().create(input);
}

export async function importCatalogRows(
  rows: Parameters<PropertyRepository["importRows"]>[0],
) {
  return getPropertyRepository().importRows(rows);
}

export { getPropertyRepositoryProvider } from "./types";
