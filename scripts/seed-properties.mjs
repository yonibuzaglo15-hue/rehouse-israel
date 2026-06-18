#!/usr/bin/env node
/**
 * Seed or import properties from a JSON/CSV file into the catalog store,
 * or sync directly from Google Sheets + Drive.
 *
 * Usage:
 *   node scripts/seed-properties.mjs ./data/import.json
 *   node scripts/seed-properties.mjs ./data/import.csv --csv
 *   node scripts/seed-properties.mjs --google-sync
 *   node scripts/seed-properties.mjs --google-sync --api http://localhost:3002
 *
 * Google sync requires env vars (see .env.example):
 *   GOOGLE_SERVICE_ACCOUNT_JSON  OR  GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 */

import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else inQuotes = !inQuotes;
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

function csvToRows(csv) {
  const lines = csv.replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });
}

async function writeLocalFile(rows) {
  const { filePropertyRepository } = await import(
    "../src/lib/properties/repository/file-repository.ts"
  ).catch(async () => {
    throw new Error("LOCAL_REPO_UNAVAILABLE");
  });

  const result = await filePropertyRepository.importRows(rows);
  console.log("Import complete:", result);
}

async function runGoogleSyncLocal() {
  const { syncFromGoogle } = await import("../src/lib/properties/sync-from-google.ts");
  const result = await syncFromGoogle();
  console.log(JSON.stringify(result, null, 2));
}

async function postToApi(apiBase, payload, endpoint = "/api/properties/import") {
  const res = await fetch(`${apiBase}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  const googleSync = args.includes("--google-sync");
  const fileArg = args.find((a) => !a.startsWith("--"));
  const isCsv = args.includes("--csv") || fileArg?.endsWith(".csv");
  const apiBase = args.find((a) => a.startsWith("http"));

  if (googleSync) {
    if (apiBase) {
      await postToApi(apiBase.replace(/\/$/, ""), {}, "/api/properties/sync");
      return;
    }

    try {
      await runGoogleSyncLocal();
    } catch (error) {
      console.error(
        error.message ??
          "Google sync failed. Set credentials in .env or use --api with a running server."
      );
      process.exit(1);
    }
    return;
  }

  if (!fileArg) {
    console.error(
      "Usage: node scripts/seed-properties.mjs <file.json|file.csv> [--csv] [--api http://localhost:3000]"
    );
    console.error("   or: node scripts/seed-properties.mjs --google-sync [--api http://localhost:3000]");
    process.exit(1);
  }

  const absolute = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
  const content = readFileSync(absolute, "utf8");

  let payload;
  if (isCsv) {
    payload = { csv: content };
  } else {
    const parsed = JSON.parse(content);
    payload = Array.isArray(parsed) ? { rows: parsed } : parsed;
  }

  if (apiBase) {
    await postToApi(apiBase.replace(/\/$/, ""), payload);
    return;
  }

  try {
    const rows = isCsv ? csvToRows(content) : payload.rows ?? payload.properties ?? payload.data ?? [];
    await writeLocalFile(rows);
  } catch {
    console.log("Direct file repo unavailable outside Next.js. Use --api flag with a running dev server.");
    console.log("Example:");
    console.log("  npm run dev");
    console.log(`  node scripts/seed-properties.mjs ${fileArg} ${isCsv ? "--csv " : ""}--api http://localhost:3000`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
