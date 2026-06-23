/** Lenient http(s) URL check — accepts query strings (Matterport ?m=...) */
export function isOptionalWebUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getOptionalWebUrlError(
  value: string,
  fieldLabel = "הקישור"
): string | null {
  if (isOptionalWebUrl(value)) return null;
  return `${fieldLabel} אינו תקין. השתמשו בקישור https:// מלא (לדוגמה Matterport).`;
}

export function normalizeOptionalWebUrl(value: string): string {
  return value.trim();
}
