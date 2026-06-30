#!/usr/bin/env node
/**
 * Applies supabase/migrations/001_catalog_properties.sql to the remote database.
 * Requires DATABASE_URL in .env.local (or environment).
 *
 * Usage: npm run db:setup-catalog
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(root, ".env.local"));
loadEnvFile(resolve(root, ".env"));

const connectionString =
  process.env.DATABASE_URL ?? process.env.DIRECT_URL ?? process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error(
    "Missing DATABASE_URL. Add it to rehouse-israel/.env.local (copy from Supabase → Settings → Database → Connection string)."
  );
  process.exit(1);
}

const sqlPath = resolve(root, "supabase/migrations/001_catalog_properties.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected. Applying catalog_properties migration...");
  await client.query(sql);
  const { rows } = await client.query(
    "select to_regclass('public.catalog_properties') as table_name"
  );
  if (rows[0]?.table_name) {
    console.log("Success: public.catalog_properties exists.");
  } else {
    console.error("Migration ran but table was not found. Check SQL output.");
    process.exit(1);
  }
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end();
}
