import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type {
  CatalogProperty,
  CatalogPropertyInput,
  CatalogPropertyUpdateInput,
  PropertyImportResult,
  PropertyImportRow,
} from "../catalog-schema";
import { createEmptyCatalogProperty, isPublishedCatalogProperty } from "../catalog-schema";
import { mapImportRowToCatalogInput, mergeCatalogUpdate } from "../import-mapping";
import { buildOfficialFallbackCatalogProperties } from "../official-fallback-seed";
import { getPublishedOfficialFallback } from "../seed-data";
import { hydrateCatalogPropertiesMedia } from "../catalog-media-hydration";
import type { PropertyRepository } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "catalog-properties.json");
const COMMITTED_SEED_FILE = path.join(DATA_DIR, "official-catalog-properties.json");

function isValidCatalogList(value: unknown): value is CatalogProperty[] {
  return Array.isArray(value) && value.length > 0;
}

async function readJsonFile(filePath: string): Promise<CatalogProperty[] | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return isValidCatalogList(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeFallbackSeed(): Promise<CatalogProperty[]> {
  const seed = buildOfficialFallbackCatalogProperties();
  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload = JSON.stringify(seed, null, 2);
  await fs.writeFile(DATA_FILE, payload, "utf8");
  await fs.writeFile(COMMITTED_SEED_FILE, payload, "utf8");
  return seed;
}

async function ensureDataFile(): Promise<CatalogProperty[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const fromRuntime = await readJsonFile(DATA_FILE);
  if (fromRuntime) return fromRuntime;

  const fromCommittedSeed = await readJsonFile(COMMITTED_SEED_FILE);
  if (fromCommittedSeed) {
    await fs.writeFile(DATA_FILE, JSON.stringify(fromCommittedSeed, null, 2), "utf8");
    return fromCommittedSeed;
  }

  return writeFallbackSeed();
}

async function writeAll(properties: CatalogProperty[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(properties, null, 2), "utf8");
}

export async function writeCatalogSnapshot(
  inputs: CatalogPropertyInput[]
): Promise<CatalogProperty[]> {
  const existing = await ensureDataFile();
  const now = new Date().toISOString();

  const properties = inputs.map((input) => {
    const match =
      (input.id && existing.find((property) => property.id === input.id)) ||
      (input.externalId &&
        existing.find((property) => property.externalId === input.externalId)) ||
      null;

    return createEmptyCatalogProperty({
      ...input,
      id: match?.id ?? input.id,
      recruitedAt: match?.recruitedAt ?? input.recruitedAt ?? now,
      updatedAt: now,
    });
  });

  await writeAll(properties);
  return properties;
}

function sortByUpdated(properties: CatalogProperty[]): CatalogProperty[] {
  return [...properties].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export const filePropertyRepository: PropertyRepository = {
  async listAll() {
    const properties = await ensureDataFile();
    return sortByUpdated(properties);
  },

  async listPublished() {
    const properties = await ensureDataFile();
    const published = properties.filter(isPublishedCatalogProperty);
    const list = sortByUpdated(
      published.length > 0 ? published : getPublishedOfficialFallback()
    );
    return hydrateCatalogPropertiesMedia(list);
  },

  async getById(id) {
    const properties = await ensureDataFile();
    return properties.find((property) => property.id === id) ?? null;
  },

  async getByExternalId(externalId) {
    const properties = await ensureDataFile();
    return (
      properties.find(
        (property) => property.externalId?.toLowerCase() === externalId.toLowerCase()
      ) ?? null
    );
  },

  async create(input) {
    const properties = await ensureDataFile();
    const property = createEmptyCatalogProperty(input);
    properties.unshift(property);
    await writeAll(properties);
    return property;
  },

  async update(id, updates) {
    const properties = await ensureDataFile();
    const index = properties.findIndex((property) => property.id === id);
    if (index === -1) return null;

    const current = properties[index];
    const next = mergeCatalogUpdate(current, {
      ...updates,
      media: updates.media
        ? { ...current.media, ...updates.media }
        : current.media,
    } as CatalogProperty);

    properties[index] = next;
    await writeAll(properties);
    return next;
  },

  async upsert(input) {
    const properties = await ensureDataFile();
    const existingById = input.id
      ? properties.find((property) => property.id === input.id)
      : undefined;
    const existingByExternal =
      input.externalId &&
      properties.find((property) => property.externalId === input.externalId);

    const existing = existingById ?? existingByExternal;
    if (existing) {
      const next = mergeCatalogUpdate(existing, createEmptyCatalogProperty(input));
      const index = properties.findIndex((property) => property.id === existing.id);
      properties[index] = next;
      await writeAll(properties);
      return next;
    }

    const created = createEmptyCatalogProperty(input);
    properties.unshift(created);
    await writeAll(properties);
    return created;
  },

  async importRows(rows) {
    const result: PropertyImportResult = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < rows.length; i++) {
      const mapped = mapImportRowToCatalogInput(rows[i], i);
      if (!mapped.success) {
        result.errors.push({ row: i + 1, message: mapped.error });
        result.skipped++;
        continue;
      }

      const before = mapped.data.id
        ? await this.getById(mapped.data.id)
        : mapped.data.externalId
          ? await this.getByExternalId(mapped.data.externalId)
          : null;

      await this.upsert(mapped.data);
      if (before) result.updated++;
      else result.created++;
    }

    return result;
  },
};

export { ensureDataFile, writeFallbackSeed, getPublishedOfficialFallback };
