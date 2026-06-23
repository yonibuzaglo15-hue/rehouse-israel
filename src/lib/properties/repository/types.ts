import type {
  CatalogProperty,
  CatalogPropertyInput,
  CatalogPropertyUpdateInput,
  PropertyImportResult,
  PropertyImportRow,
} from "../catalog-schema";

export interface PropertyRepository {
  listAll(): Promise<CatalogProperty[]>;
  listPublished(): Promise<CatalogProperty[]>;
  getById(id: string): Promise<CatalogProperty | null>;
  getByExternalId(externalId: string): Promise<CatalogProperty | null>;
  create(input: CatalogPropertyInput): Promise<CatalogProperty>;
  update(id: string, updates: CatalogPropertyUpdateInput): Promise<CatalogProperty | null>;
  upsert(input: CatalogPropertyInput): Promise<CatalogProperty>;
  importRows(rows: PropertyImportRow[]): Promise<PropertyImportResult>;
}

export type PropertyRepositoryProvider = "supabase";

export function getPropertyRepositoryProvider(): PropertyRepositoryProvider {
  return "supabase";
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
