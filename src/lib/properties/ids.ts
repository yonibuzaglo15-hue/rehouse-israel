const INVALID_ID_STRINGS = new Set(["[object Object]", "undefined", "null", "NaN"]);

/** Catalog property ids: prop_* slugs, alphanumeric tokens — not strict Mongo ObjectId. */
const CATALOG_ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;

function isInvalidIdString(value: string): boolean {
  return !value || INVALID_ID_STRINGS.has(value);
}

/** Coerce catalog property ids to a safe string for URLs, fetch, and DOM attributes. */
export function normalizePropertyId(id: unknown): string {
  if (id == null) return "";

  if (typeof id === "object") {
    const record = id as Record<string, unknown>;

    if (typeof record.$oid === "string") {
      const oid = record.$oid.trim();
      if (!isInvalidIdString(oid)) return oid;
    }

    if (record._id != null && record._id !== id) {
      const nested = normalizePropertyId(record._id);
      if (nested) return nested;
    }

    if (typeof record.id === "string") {
      const nestedId = record.id.trim();
      if (!isInvalidIdString(nestedId)) return nestedId;
    }

    if (typeof record.toString === "function") {
      const str = record.toString();
      if (str && !isInvalidIdString(str) && str !== "[object Object]") {
        return str.trim();
      }
    }

    return "";
  }

  let str = String(id).trim();
  if (isInvalidIdString(str)) return "";

  try {
    if (str.includes("%")) {
      str = decodeURIComponent(str).trim();
    }
  } catch {
    // keep original string
  }

  return isInvalidIdString(str) ? "" : str;
}

/** Prefer canonical `id`, then legacy `_id` shapes from external stores. */
export function resolvePropertyRecordId(record: {
  id?: unknown;
  _id?: unknown;
}): string {
  return normalizePropertyId(record.id) || normalizePropertyId(record._id);
}

export function isValidCatalogPropertyId(id: unknown): boolean {
  const normalized = normalizePropertyId(id);
  return Boolean(normalized && CATALOG_ID_PATTERN.test(normalized));
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
