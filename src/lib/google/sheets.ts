import "server-only";

import type { PropertyImportRow } from "@/lib/properties/catalog-schema";
import { getSheetsClient } from "./auth";

async function resolveSheetTitle(
  spreadsheetId: string,
  gid: string
): Promise<string> {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = Number(gid);
  const match = meta.data.sheets?.find(
    (sheet) => sheet.properties?.sheetId === sheetId
  );
  if (!match?.properties?.title) {
    throw new Error(`לא נמצא גיליון עם gid=${gid} ב-Sheet ${spreadsheetId}`);
  }
  return match.properties.title;
}

export async function fetchSheetRows(
  spreadsheetId: string,
  gid: string
): Promise<PropertyImportRow[]> {
  const sheets = await getSheetsClient();
  const sheetTitle = await resolveSheetTitle(spreadsheetId, gid);
  const range = `'${sheetTitle.replace(/'/g, "''")}'`;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    majorDimension: "ROWS",
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING",
  });

  const values = response.data.values ?? [];
  if (values.length < 2) return [];

  const headers = values[0].map((cell) => String(cell ?? "").trim());
  const rows: PropertyImportRow[] = [];

  for (let i = 1; i < values.length; i++) {
    const line = values[i];
    if (!line || line.every((cell) => String(cell ?? "").trim() === "")) continue;

    const row: PropertyImportRow = {};
    headers.forEach((header, index) => {
      if (!header) return;
      row[header] = line[index] ?? "";
    });
    rows.push(row);
  }

  return rows;
}
