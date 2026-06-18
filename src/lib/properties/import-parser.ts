import type { PropertyImportRow } from "./catalog-schema";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

export function parseCsvToRows(csv: string): PropertyImportRow[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: PropertyImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: PropertyImportRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

export function normalizeImportPayload(body: unknown): PropertyImportRow[] {
  if (!body || typeof body !== "object") return [];

  const payload = body as {
    format?: string;
    csv?: string;
    rows?: PropertyImportRow[];
    properties?: PropertyImportRow[];
    data?: PropertyImportRow[];
  };

  if (typeof payload.csv === "string" && payload.csv.trim()) {
    return parseCsvToRows(payload.csv);
  }

  const rows = payload.rows ?? payload.properties ?? payload.data;
  if (Array.isArray(rows)) {
    return rows.filter((row) => row && typeof row === "object") as PropertyImportRow[];
  }

  if (Array.isArray(body)) {
    return body.filter((row) => row && typeof row === "object") as PropertyImportRow[];
  }

  return [];
}
