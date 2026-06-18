#!/usr/bin/env node
import "./register-loader.mjs";
import { register as registerTsx } from "tsx/esm/api";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

registerTsx();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
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
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(root, ".env"));
loadEnvFile(path.join(root, ".env.local"));

const args = process.argv.slice(2);
const apiBase = (args.find((a) => a.startsWith("http")) ?? "http://localhost:3002").replace(
  /\/$/,
  ""
);

async function syncViaApi() {
  const headers = { "Content-Type": "application/json" };
  const secret = process.env.PROPERTY_SYNC_SECRET?.trim();
  if (secret) {
    headers["x-sync-secret"] = secret;
  }

  const res = await fetch(`${apiBase}/api/properties/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? `Sync failed (${res.status})`);
  }

  console.log(JSON.stringify(data, null, 2));
}

async function syncLocal() {
  const { syncFromGoogle } = await import("../src/lib/properties/sync-from-google.ts");
  const result = await syncFromGoogle();
  console.log(JSON.stringify(result, null, 2));
}

try {
  if (args.includes("--api")) {
    await syncViaApi();
  } else {
    await syncLocal();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
