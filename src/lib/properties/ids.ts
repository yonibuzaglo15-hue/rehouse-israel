const INVALID_ID_STRINGS = new Set(["[object Object]", "undefined", "null", "NaN"]);

function isInvalidIdString(value: string): boolean {
  return !value || INVALID_ID_STRINGS.has(value);
}

/** Normalize Supabase/catalog IDs: plain strings, UUIDs, prop_* slugs. */
export function getCleanId(id: unknown): string {
  if (id == null) return "";

  if (typeof id === "string") {
    const trimmed = id.trim();
    return isInvalidIdString(trimmed) ? "" : trimmed;
  }

  if (typeof id === "number" || typeof id === "bigint") {
    return String(id);
  }

  const str = String(id).trim();
  return isInvalidIdString(str) ? "" : str;
}

export function resolvePropertyRecordId(record: { id?: unknown }): string {
  return getCleanId(record.id);
}

/** @deprecated Use getCleanId */
export function normalizePropertyId(id: unknown): string {
  return getCleanId(id);
}

export function propertyDetailHref(record: { id?: unknown }): string {
  const cleanId = getCleanId(record.id);
  if (!cleanId) return "/properties";
  return `/properties/${encodeURIComponent(cleanId)}`;
}
