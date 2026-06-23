const INVALID_ID_STRINGS = new Set(["[object Object]", "undefined", "null", "NaN"]);

function isInvalidIdString(value: string): boolean {
  return !value || INVALID_ID_STRINGS.has(value);
}

/** Forcefully extract a string ID from MongoDB BSON shapes or primitives. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCleanId(id: any): string {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (typeof id === "object" && id.$oid) return id.$oid;
  if (typeof id === "object" && id.toString && id.toString() !== "[object Object]") {
    return id.toString();
  }
  return String(id);
}

/** Prefer canonical catalog id, then legacy Mongo _id shapes. */
export function resolvePropertyRecordId(record: {
  id?: unknown;
  _id?: unknown;
}): string {
  const fromId = getCleanId(record.id);
  const fromMongoId = getCleanId(record._id);
  if (fromId && !isInvalidIdString(fromId.trim())) return fromId.trim();
  if (fromMongoId && !isInvalidIdString(fromMongoId.trim())) return fromMongoId.trim();
  return "";
}

/** MongoDB ObjectId: 24 hex characters */
export function isMongoObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

/** Accept catalog slugs (prop_*) or MongoDB ObjectId strings for API routes */
export function isValidCatalogRouteId(id: string): boolean {
  if (!id || isInvalidIdString(id)) return false;
  if (id.startsWith("prop_")) return /^prop_[a-zA-Z0-9_-]+$/.test(id);
  if (isMongoObjectId(id)) return true;
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(id);
}

/** @deprecated Use getCleanId — kept for existing imports */
export function normalizePropertyId(id: unknown): string {
  return getCleanId(id);
}

export function propertyDetailHref(record: { id?: unknown; _id?: unknown }): string {
  const cleanId = resolvePropertyRecordId(record);
  if (!cleanId) return "/properties";
  return `/properties/${encodeURIComponent(cleanId)}`;
}
