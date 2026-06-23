/** Coerce catalog property ids to a safe string for URLs, fetch, and DOM attributes. */
export function normalizePropertyId(id: unknown): string {
  if (id == null) return "";

  if (typeof id === "object") {
    const record = id as Record<string, unknown>;
    if (typeof record.$oid === "string") return record.$oid.trim();
    if (typeof record.id === "string") return record.id.trim();
  }

  return String(id).trim();
}

export function propertyDetailHref(id: unknown): string {
  const normalized = normalizePropertyId(id);
  if (!normalized) return "/properties";
  return `/properties/${encodeURIComponent(normalized)}`;
}

export function catalogPropertyApiPath(id: unknown): string {
  const normalized = normalizePropertyId(id);
  if (!normalized) return "";
  return `/api/catalog/properties/${encodeURIComponent(normalized)}`;
}

export function propertyApiPath(id: unknown): string {
  const normalized = normalizePropertyId(id);
  if (!normalized) return "";
  return `/api/properties/${encodeURIComponent(normalized)}`;
}
