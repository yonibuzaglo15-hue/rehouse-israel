import "server-only";

import { hydrateCatalogPropertiesMedia, hydrateCatalogPropertyMedia } from "../catalog-media-hydration";
import { filePropertyRepository, getPublishedOfficialFallback } from "./file-repository";
import { supabasePropertyRepository } from "./supabase-repository";
import type { PropertyRepository } from "./types";
import { getPropertyRepositoryProvider } from "./types";

let repository: PropertyRepository | null = null;

function isServerlessDeploy(): boolean {
  return process.env.VERCEL === "1";
}

export function getPropertyRepository(): PropertyRepository {
  if (repository) return repository;

  const provider = getPropertyRepositoryProvider();

  if (provider === "supabase") {
    repository = supabasePropertyRepository;
    return repository;
  }

  if (isServerlessDeploy()) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required on Vercel. Local JSON catalog storage is not supported in production.",
    );
  }

  repository = filePropertyRepository;
  return repository;
}

export async function listCatalogProperties() {
  return getPropertyRepository().listAll();
}

export async function listPublishedCatalogProperties() {
  const list = await getPropertyRepository().listPublished();
  if (list.length > 0) {
    return hydrateCatalogPropertiesMedia(list);
  }

  if (isServerlessDeploy()) {
    return [];
  }

  return hydrateCatalogPropertiesMedia(getPublishedOfficialFallback());
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
