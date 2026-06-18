import "server-only";

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { listDriveSubfolders } from "./drive";
import { listPublicDriveFolder } from "./drive-public";
import {
  findBestPropertyFolder,
  type PropertyMatchHints,
} from "./folder-matching";

export interface DriveFolderIndexEntry {
  folderId: string;
  title: string;
  path?: string;
  city?: string;
  addressKeys?: string[];
  agentKeys?: string[];
  source?: "api-crawl" | "public-crawl" | "seed" | "sync-discovered";
}

const INDEX_PATH = path.join(process.cwd(), "data", "public-drive-folder-index.json");

const SEED_ENTRIES: DriveFolderIndexEntry[] = [
  {
    folderId: "1ERe2XMwaniVKNlJXTL3XWrN4n6x4Xsgc",
    title: "שבט לוי 1 - יאן שינדלמן",
    city: "ashdod",
    addressKeys: ["שבט לוי 1", "שבט לוי"],
    agentKeys: ["יאן", "שינדלמן"],
    source: "seed",
  },
  {
    folderId: "1IDNOAdEnbmNogFHRR6rHkTfRCB2YO4BS",
    title: "אריה בן אליעזר 14 - יונתן בוזגלו",
    city: "ashdod",
    addressKeys: [
      "אריה בן אליעזר 14",
    ],
    agentKeys: ["יונתן", "בוזגלו"],
    source: "seed",
  },
];

export function normalizeFolderToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeIndexEntries(
  existing: DriveFolderIndexEntry[],
  incoming: DriveFolderIndexEntry[]
): DriveFolderIndexEntry[] {
  const byId = new Map<string, DriveFolderIndexEntry>();
  for (const entry of [...existing, ...incoming]) {
    const current = byId.get(entry.folderId);
    if (!current) {
      byId.set(entry.folderId, entry);
      continue;
    }
    byId.set(entry.folderId, {
      ...current,
      ...entry,
      addressKeys: [
        ...new Set([...(current.addressKeys ?? []), ...(entry.addressKeys ?? [])]),
      ],
      agentKeys: [
        ...new Set([...(current.agentKeys ?? []), ...(entry.agentKeys ?? [])]),
      ],
    });
  }
  return [...byId.values()];
}

export function loadDriveFolderIndex(): DriveFolderIndexEntry[] {
  if (!existsSync(INDEX_PATH)) return [...SEED_ENTRIES];
  try {
    const parsed = JSON.parse(readFileSync(INDEX_PATH, "utf8")) as DriveFolderIndexEntry[];
    return mergeIndexEntries(SEED_ENTRIES, Array.isArray(parsed) ? parsed : []);
  } catch {
    return [...SEED_ENTRIES];
  }
}

export function saveDriveFolderIndex(entries: DriveFolderIndexEntry[]): void {
  mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  const merged = mergeIndexEntries(SEED_ENTRIES, entries);
  writeFileSync(INDEX_PATH, JSON.stringify(merged, null, 2), "utf8");
}

function extractAddressFromFolderTitle(title: string): string {
  return title.split(" - ")[0]?.trim() ?? title.trim();
}

function extractAgentFromFolderTitle(title: string): string | undefined {
  const parts = title.split(" - ");
  return parts.length > 1 ? parts.slice(1).join(" - ").trim() : undefined;
}

function extractTrailingHouseNumber(text: string): string | null {
  const normalized = normalizeFolderToken(text);
  const match = normalized.match(/(?:^|\s)(\d+[\w/-]*)$/);
  return match?.[1] ?? null;
}

/** Reject matches when folder title says 14 but the property is 10 (and vice versa). */
function houseNumbersCompatible(
  propertyHouseNumber: string | undefined,
  folderTexts: string[]
): boolean {
  const propertyNumber = propertyHouseNumber
    ? normalizeFolderToken(propertyHouseNumber)
    : null;
  if (!propertyNumber) return true;

  const folderNumbers = folderTexts
    .map(extractTrailingHouseNumber)
    .filter((value): value is string => Boolean(value));

  if (folderNumbers.length === 0) return false;
  return folderNumbers.some((folderNumber) => folderNumber === propertyNumber);
}

function scorePropertyAgainstIndexEntry(
  hints: PropertyMatchHints,
  entry: DriveFolderIndexEntry
): number {
  const address = [hints.street, hints.houseNumber].filter(Boolean).join(" ");
  if (!address.trim()) return 0;

  const normalizedAddress = normalizeFolderToken(address);
  const normalizedTitle = normalizeFolderToken(entry.title);
  const folderVariants = [
    normalizedTitle,
    ...(entry.addressKeys ?? []).map(normalizeFolderToken),
  ].filter(Boolean);

  if (!houseNumbersCompatible(hints.houseNumber, [entry.title, ...(entry.addressKeys ?? [])])) {
    return 0;
  }

  for (const variant of folderVariants) {
    if (variant === normalizedAddress) return 100;
    if (variant.includes(normalizedAddress) || normalizedAddress.includes(variant)) {
      let score = 92;
      const agentFirst = hints.agentName?.trim().split(/\s+/)[0] ?? "";
      if (agentFirst && normalizedTitle.includes(normalizeFolderToken(agentFirst))) {
        score += 8;
      }
      if (entry.city && hints.city && entry.city !== hints.city) score -= 30;
      return Math.max(score, 0);
    }
  }

  const streetNorm = normalizeFolderToken(hints.street ?? "");
  const houseNorm = normalizeFolderToken(hints.houseNumber ?? "");
  if (!streetNorm || !houseNorm) return 0;

  const streetTokens = streetNorm.split(" ").filter((token) => token.length > 1);
  if (streetTokens.length === 0) return 0;

  let best = 0;
  for (const variant of folderVariants) {
    const matchedStreetTokens = streetTokens.filter((token) => variant.includes(token));
    const hasHouse = variant.includes(houseNorm);
    if (!hasHouse) continue;

    if (matchedStreetTokens.length === streetTokens.length) {
      best = Math.max(best, 80);
    } else if (matchedStreetTokens.length >= 2) {
      best = Math.max(best, 70);
    }
  }

  if (entry.city && hints.city && entry.city !== hints.city) {
    best = Math.max(0, best - 30);
  }

  return best;
}

export function findBestDriveFolderMatch(
  hints: PropertyMatchHints,
  index: DriveFolderIndexEntry[],
  minScore = 70
): DriveFolderIndexEntry | null {
  let best: DriveFolderIndexEntry | null = null;
  let bestScore = 0;

  for (const entry of index) {
    const score = scorePropertyAgainstIndexEntry(hints, entry);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return bestScore >= minScore ? best : null;
}

async function crawlDriveFolderTreeViaApi(
  folderId: string,
  depth: number,
  pathPrefix: string,
  maxDepth = 4
): Promise<DriveFolderIndexEntry[]> {
  if (depth > maxDepth) return [];

  const entries: DriveFolderIndexEntry[] = [];
  const subfolders = await listDriveSubfolders(folderId);

  for (const folder of subfolders) {
    const fullPath = pathPrefix ? `${pathPrefix} / ${folder.name}` : folder.name;
    const address = extractAddressFromFolderTitle(folder.name);
    const agent = extractAgentFromFolderTitle(folder.name);

    const looksLikeProperty =
      /\d/.test(address) ||
      /שבט|נחל|רח|רובע|דקר|בלפור|הפטל|המשוט|לוי|אליעזר/i.test(address);

    if (looksLikeProperty || depth >= 2) {
      entries.push({
        folderId: folder.id,
        title: folder.name,
        path: fullPath,
        addressKeys: [address, folder.name],
        agentKeys: agent ? [agent, agent.split(/\s+/)[0] ?? ""] : [],
        source: "api-crawl",
      });
    }

    const nested = await crawlDriveFolderTreeViaApi(
      folder.id,
      depth + 1,
      fullPath,
      maxDepth
    );
    entries.push(...nested);
  }

  return entries;
}

async function crawlDriveFolderTreeViaPublic(
  folderId: string,
  depth: number,
  pathPrefix: string,
  maxDepth = 4
): Promise<DriveFolderIndexEntry[]> {
  if (depth > maxDepth) return [];

  const children = await listPublicDriveFolder(folderId);
  if (children.length === 0) return [];

  const entries: DriveFolderIndexEntry[] = [];
  for (const child of children) {
    if (child.kind !== "folder") continue;
    const fullPath = pathPrefix ? `${pathPrefix} / ${child.title}` : child.title;
    const address = extractAddressFromFolderTitle(child.title);
    const agent = extractAgentFromFolderTitle(child.title);

    entries.push({
      folderId: child.id,
      title: child.title,
      path: fullPath,
      addressKeys: [address, child.title],
      agentKeys: agent ? [agent, agent.split(/\s+/)[0] ?? ""] : [],
      source: "public-crawl",
    });

    const nested = await crawlDriveFolderTreeViaPublic(
      child.id,
      depth + 1,
      fullPath,
      maxDepth
    );
    entries.push(...nested);
  }

  return entries;
}

export interface RefreshDriveIndexResult {
  entries: DriveFolderIndexEntry[];
  source: "api-crawl" | "public-crawl" | "cache" | "seed";
  discovered: number;
}

export async function refreshDriveFolderIndex(
  rootFolderId: string
): Promise<RefreshDriveIndexResult> {
  const existing = loadDriveFolderIndex();

  try {
    const discovered = await crawlDriveFolderTreeViaApi(rootFolderId, 0, "");
    if (discovered.length > 0) {
      const merged = mergeIndexEntries(existing, discovered);
      saveDriveFolderIndex(merged);
      return {
        entries: merged,
        source: "api-crawl",
        discovered: discovered.length,
      };
    }
  } catch {
    // Fall through to public crawl.
  }

  try {
    const discovered = await crawlDriveFolderTreeViaPublic(rootFolderId, 0, "");
    if (discovered.length > 0) {
      const merged = mergeIndexEntries(existing, discovered);
      saveDriveFolderIndex(merged);
      return {
        entries: merged,
        source: "public-crawl",
        discovered: discovered.length,
      };
    }
  } catch {
    // Use cached/seed index.
  }

  return {
    entries: existing,
    source: existing.length > SEED_ENTRIES.length ? "cache" : "seed",
    discovered: 0,
  };
}

export function appendDiscoveredFolder(entry: DriveFolderIndexEntry): void {
  const merged = mergeIndexEntries(loadDriveFolderIndex(), [entry]);
  saveDriveFolderIndex(merged);
}
