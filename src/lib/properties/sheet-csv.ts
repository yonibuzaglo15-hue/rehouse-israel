import { readFileSync, existsSync } from "fs";
import path from "path";
import type { PropertyImportRow } from "./catalog-schema";
import { normalizeRehouseCsvRows } from "./csv-row-normalizer";

const LOCAL_SHEET_CSV = path.join(process.cwd(), "data", "google-sheet-export.csv");

function parseCsvRecords(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" || (char === "\r" && content[i + 1] === "\n")) {
      row.push(field);
      if (row.some((cell) => cell.trim())) {
        rows.push(row);
      }
      row = [];
      field = "";
      if (char === "\r") i++;
      continue;
    }

    if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim())) {
      rows.push(row);
    }
  }

  return rows;
}

export function loadLocalSheetExportIfExists(): PropertyImportRow[] | null {
  if (!existsSync(LOCAL_SHEET_CSV)) return null;

  const csv = readFileSync(LOCAL_SHEET_CSV, "utf8").replace(/^\uFEFF/, "");
  const records = parseCsvRecords(csv);
  if (records.length < 2) return null;

  const headers = records[0].map((header) => header.trim());
  const rows: PropertyImportRow[] = [];

  for (let i = 1; i < records.length; i++) {
    const values = records[i];
    if (values.every((cell) => !cell.trim())) continue;

    const row: PropertyImportRow = {};
    headers.forEach((header, index) => {
      if (!header) return;
      row[header] = values[index] ?? "";
    });
    rows.push(row);
  }

  if (rows.length === 0) return null;

  return normalizeRehouseCsvRows(rows);
}

export function getLocalSheetExportPath(): string {
  return LOCAL_SHEET_CSV;
}

export function hasLocalSheetExport(): boolean {
  return existsSync(LOCAL_SHEET_CSV);
}
