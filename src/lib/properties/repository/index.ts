import "server-only";

import { hydrateCatalogPropertiesMedia, hydrateCatalogPropertyMedia } from "../catalog-media-hydration";
import { filePropertyRepository, getPublishedOfficialFallback } from "./file-repository";
import { supabasePropertyRepository } from "./supabase-repository";
import type { PropertyRepository } from "./types";
import { getPropertyRepositoryProvider } from "./types";

let repository: PropertyRepository | null = null;

function createResilientRepository(primary: PropertyRepository): PropertyRepository {
  return {
    ...primary,
    async listAll() {
      try {
        const list = await primary.listAll();
        return list.length > 0 ? list : await filePropertyRepository.listAll();
      } catch {
        return filePropertyRepository.listAll();
      }
    },
    async listPublished() {
      try {
        const list = await primary.listPublished();
        return list.length > 0 ? list : getPublishedOfficialFallback();
      } catch {
        return filePropertyRepository.listPublished();
      }
    },
    async getById(id) {
      try {
        const item = await primary.getById(id);
        if (item) return item;
      } catch {
        // fall through to file store
      }
      return filePropertyRepository.getById(id);
    },
    async getByExternalId(externalId) {
      try {
        const item = await primary.getByExternalId(externalId);
        if (item) return item;
      } catch {
        // fall through
      }
      return filePropertyRepository.getByExternalId(externalId);
    },
    create: primary.create.bind(primary),
    update: primary.update.bind(primary),
    upsert: primary.upsert.bind(primary),
    importRows: primary.importRows.bind(primary),
  };
}

export function getPropertyRepository(): PropertyRepository {
  if (repository) return repository;
  const provider = getPropertyRepositoryProvider();
  repository =
    provider === "supabase"
      ? createResilientRepository(supabasePropertyRepository)
      : filePropertyRepository;
  return repository;
}

export async function listCatalogProperties() {
  return getPropertyRepository().listAll();
}

export async function listPublishedCatalogProperties() {
  try {
    const list = await getPropertyRepository().listPublished();
    const base = list.length > 0 ? list : getPublishedOfficialFallback();
    return hydrateCatalogPropertiesMedia(base);
  } catch {
    return hydrateCatalogPropertiesMedia(getPublishedOfficialFallback());
  }
}

export async function getCatalogPropertyById(id: string) {
  const property = await getPropertyRepository().getById(id);
  return property ? hydrateCatalogPropertyMedia(property) : null;
}

export async function updateCatalogProperty(
  id: string,
  updates: Parameters<PropertyRepository["update"]>[1]
) {
  return getPropertyRepository().update(id, updates);
}

export async function importCatalogRows(
  rows: Parameters<PropertyRepository["importRows"]>[0]
) {
  return getPropertyRepository().importRows(rows);
}

export { getPropertyRepositoryProvider } from "./types";
