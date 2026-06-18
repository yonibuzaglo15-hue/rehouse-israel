import type { City } from "@/lib/types";
import { getCityLabel } from "@/lib/constants";

export interface DriveFolderRef {
  id: string;
  name: string;
}

export interface PropertyMatchHints {
  city: City;
  neighborhood: string;
  agentName?: string;
  street?: string;
  houseNumber?: string;
  clientNames?: string[];
  externalId?: string;
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeToken(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function extractTrailingHouseNumber(text: string): string | null {
  const normalized = normalizeToken(text);
  const match = normalized.match(/(?:^|\s)(\d+[\w/-]*)$/);
  return match?.[1] ?? null;
}

function houseNumbersCompatible(candidate: string, folderName: string): boolean {
  const candidateNumber = extractTrailingHouseNumber(candidate);
  if (!candidateNumber) return true;

  const folderNumber = extractTrailingHouseNumber(folderName);
  if (!folderNumber) return false;
  return candidateNumber === folderNumber;
}

function buildMatchKeys(city: City, neighborhood: string): string[] {
  const cityLabel = getCityLabel(city);
  const variants = [
    `${cityLabel} ${neighborhood}`,
    `${cityLabel}-${neighborhood}`,
    `${cityLabel}/${neighborhood}`,
    `${city} ${neighborhood}`,
    `${city}-${neighborhood}`,
    neighborhood,
  ];
  return [...new Set(variants.map(normalizeToken))].filter(Boolean);
}

export function scoreFolderMatch(
  folderName: string,
  city: City,
  neighborhood: string
): number {
  const normalizedFolder = normalizeToken(folderName);
  if (!normalizedFolder) return 0;

  const keys = buildMatchKeys(city, neighborhood);
  let best = 0;

  for (const key of keys) {
    if (normalizedFolder === key) {
      best = Math.max(best, 100);
      continue;
    }
    if (normalizedFolder.includes(key) || key.includes(normalizedFolder)) {
      best = Math.max(best, 80);
      continue;
    }

    const keyTokens = key.split(" ");
    const matchedTokens = keyTokens.filter((token) => normalizedFolder.includes(token));
    if (matchedTokens.length >= 2) {
      best = Math.max(best, 60 + matchedTokens.length * 5);
    } else if (matchedTokens.length === 1 && keyTokens.length === 1) {
      best = Math.max(best, 50);
    }
  }

  return best;
}

export function findBestMatchingFolder(
  folders: DriveFolderRef[],
  city: City,
  neighborhood: string
): DriveFolderRef | null {
  let bestFolder: DriveFolderRef | null = null;
  let bestScore = 0;

  for (const folder of folders) {
    const score = scoreFolderMatch(folder.name, city, neighborhood);
    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return bestScore >= 50 ? bestFolder : null;
}

function scoreNameMatch(folderName: string, candidates: string[]): number {
  const normalizedFolder = normalizeToken(folderName);
  if (!normalizedFolder) return 0;

  let best = 0;
  for (const candidate of candidates) {
    const normalized = normalizeToken(candidate);
    if (!normalized) continue;
    if (!houseNumbersCompatible(candidate, folderName)) continue;

    if (normalizedFolder === normalized) {
      best = Math.max(best, 100);
      continue;
    }
    if (normalizedFolder.includes(normalized) || normalized.includes(normalizedFolder)) {
      best = Math.max(best, 85);
      continue;
    }

    const tokens = tokenize(candidate);
    const matched = tokens.filter((token) => normalizedFolder.includes(token));
    if (matched.length >= 2) {
      best = Math.max(best, 70 + matched.length * 8);
    } else if (matched.length === 1) {
      best = Math.max(best, 45);
    }
  }

  return best;
}

export function findBestCityFolder(
  folders: DriveFolderRef[],
  city: City
): DriveFolderRef | null {
  const cityLabel = getCityLabel(city);
  const candidates = [cityLabel, city, city.replace("-", " ")];
  let bestFolder: DriveFolderRef | null = null;
  let bestScore = 0;

  for (const folder of folders) {
    const score = scoreNameMatch(folder.name, candidates);
    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return bestScore >= 45 ? bestFolder : null;
}

export function findBestNeighborhoodFolder(
  folders: DriveFolderRef[],
  neighborhood: string
): DriveFolderRef | null {
  const candidates = [
    neighborhood,
    neighborhood.replace(/רובע\s*/i, "רובע "),
    neighborhood.replace(/['׳"]/g, ""),
  ];
  let bestFolder: DriveFolderRef | null = null;
  let bestScore = 0;

  for (const folder of folders) {
    const score = scoreNameMatch(folder.name, candidates);
    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return bestScore >= 50 ? bestFolder : null;
}

export function findBestPropertyFolder(
  folders: DriveFolderRef[],
  hints: PropertyMatchHints
): DriveFolderRef | null {
  const address = [hints.street, hints.houseNumber].filter(Boolean).join(" ");
  const agentFirstName = hints.agentName?.trim().split(/\s+/)[0] ?? "";
  const candidates = [
    address,
    hints.street ?? "",
    hints.externalId ?? "",
    hints.agentName ?? "",
    agentFirstName,
    ...(hints.clientNames ?? []),
    [hints.agentName, address].filter(Boolean).join(" "),
    [agentFirstName, address].filter(Boolean).join(" "),
    [address, hints.agentName].filter(Boolean).join(" "),
    [address, ...(hints.clientNames ?? [])].filter(Boolean).join(" "),
  ].filter(Boolean);

  if (candidates.length === 0) return null;

  let bestFolder: DriveFolderRef | null = null;
  let bestScore = 0;

  for (const folder of folders) {
    const score = scoreNameMatch(folder.name, candidates);
    if (score > bestScore) {
      bestScore = score;
      bestFolder = folder;
    }
  }

  return bestScore >= 45 ? bestFolder : null;
}

export function neighborhoodToSlug(neighborhood: string): string {
  return neighborhood
    .replace(/[^\u0590-\u05FFa-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function buildPropertyImagePathSlug(hints: PropertyMatchHints): string {
  const neighborhoodSlug = neighborhoodToSlug(hints.neighborhood);
  const address = [hints.street, hints.houseNumber].filter(Boolean).join(" ");
  if (!address) return neighborhoodSlug;

  const addressSlug = neighborhoodToSlug(address);
  return addressSlug ? `${neighborhoodSlug}/${addressSlug}` : neighborhoodSlug;
}
