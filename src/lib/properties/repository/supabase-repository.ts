import "server-only";

import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CatalogProperty,
  CatalogPropertyInput,
  CatalogPropertyUpdateInput,
  PropertyImportResult,
  PropertyImportRow,
} from "../catalog-schema";
import { createEmptyCatalogProperty, isPublishedCatalogProperty } from "../catalog-schema";
import { mapImportRowToCatalogInput, mergeCatalogUpdate } from "../import-mapping";
import type { PropertyRepository } from "./types";

const TABLE = "catalog_properties";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const message =
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables.";
    console.error("CRITICAL SUPABASE ERROR:", message, undefined);
    throw new Error(message);
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

function throwIfSupabaseError(operation: string, error: PostgrestError | null): void {
  if (!error) return;
  console.error("CRITICAL SUPABASE ERROR:", error.message, error.details);
  console.error(`[supabase ${operation}]`, error);
  throw new Error(error.message ?? `Supabase ${operation} failed`);
}

function rowToProperty(row: { id: string; data: CatalogProperty }): CatalogProperty {
  return { ...row.data, id: row.id };
}

export const supabasePropertyRepository: PropertyRepository = {
  async listAll() {
    const { data, error } = await getClient()
      .from(TABLE)
      .select("id, data")
      .order("updated_at", { ascending: false });
    throwIfSupabaseError("listAll", error);
    return (data ?? []).map(rowToProperty);
  },

  async listPublished() {
    const all = await this.listAll();
    return all.filter(isPublishedCatalogProperty);
  },

  async getById(id) {
    const { data, error } = await getClient()
      .from(TABLE)
      .select("id, data")
      .eq("id", id)
      .maybeSingle();
    throwIfSupabaseError("getById", error);
    return data ? rowToProperty(data) : null;
  },

  async getByExternalId(externalId) {
    const { data, error } = await getClient()
      .from(TABLE)
      .select("id, data")
      .eq("external_id", externalId)
      .maybeSingle();
    throwIfSupabaseError("getByExternalId", error);
    return data ? rowToProperty(data) : null;
  },

  async create(input: CatalogPropertyInput) {
    const property = createEmptyCatalogProperty(input);
    const { error } = await getClient().from(TABLE).insert({
      id: property.id,
      external_id: property.externalId ?? null,
      published: property.published,
      data: property,
      updated_at: property.updatedAt,
    });
    throwIfSupabaseError("create", error);
    return property;
  },

  async update(id, updates: CatalogPropertyUpdateInput) {
    const current = await this.getById(id);
    if (!current) return null;

    const next = mergeCatalogUpdate(current, {
      ...updates,
      media: updates.media ? { ...current.media, ...updates.media } : current.media,
    } as CatalogProperty);

    const { error } = await getClient()
      .from(TABLE)
      .update({
        external_id: next.externalId ?? null,
        published: next.published,
        data: next,
        updated_at: next.updatedAt,
      })
      .eq("id", id);
    throwIfSupabaseError("update", error);
    return next;
  },

  async upsert(input: CatalogPropertyInput) {
    const existing = input.id
      ? await this.getById(input.id)
      : input.externalId
        ? await this.getByExternalId(input.externalId)
        : null;

    if (existing) {
      const next = mergeCatalogUpdate(existing, createEmptyCatalogProperty(input));
      const { error } = await getClient()
        .from(TABLE)
        .upsert({
          id: next.id,
          external_id: next.externalId ?? null,
          published: next.published,
          data: next,
          updated_at: next.updatedAt,
        });
      throwIfSupabaseError("upsert", error);
      return next;
    }

    return this.create(input);
  },

  async importRows(rows: PropertyImportRow[]) {
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
