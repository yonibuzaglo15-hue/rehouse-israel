const INVALID_ID_STRINGS = new Set(["[object Object]", "undefined", "null", "NaN"]);

function isInvalidIdString(value: string): boolean {
  return !value || INVALID_ID_STRINGS.has(value);
}

/** Forcefully extract a string ID from MongoDB BSON shapes or primitives. */
export function getCleanId(id: unknown): string {
  if (!id) return "";

  if (typeof id === "string") {
    const trimmed = id.trim();
    return isInvalidIdString(trimmed) ? "" : trimmed;
  }

  if (typeof id === "object") {
    const record = id as Record<string, unknown>;

    if (record.$oid) {
      const oid = String(record.$oid).trim();
      return isInvalidIdString(oid) ? "" : oid;
    }

    if (typeof record.toString === "function") {
      const str = record.toString();
      if (str && !isInvalidIdString(str) && str !== "[object Object]") {
        return str.trim();
      }
    }
  }

  const str = String(id).trim();
  return isInvalidIdString(str) ? "" : str;
}

/** @deprecated Use getCleanId — kept for existing imports */
export function normalizePropertyId(id: unknown): string {
  return getCleanId(id);
}

export function resolvePropertyRecordId(record: {
  id?: unknown;
  _id?: unknown;
}): string {
  return getCleanId(record._id || record.id);
}

export function propertyDetailHref(record: { id?: unknown; _id?: unknown }): string {
  const cleanId = getCleanId(record._id || record.id);
  if (!cleanId) return "/properties";
  return `/properties/${encodeURIComponent(cleanId)}`;
}
