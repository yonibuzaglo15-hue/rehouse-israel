#!/usr/bin/env node
import "./register-loader.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildOfficialFallbackCatalogProperties } from "../src/lib/properties/official-fallback-seed.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");

const seed = buildOfficialFallbackCatalogProperties();
mkdirSync(dataDir, { recursive: true });

const payload = JSON.stringify(seed, null, 2);
writeFileSync(path.join(dataDir, "official-catalog-properties.json"), payload);
writeFileSync(path.join(dataDir, "catalog-properties.json"), payload);

console.log(`Seeded ${seed.length} official properties to data/`);
