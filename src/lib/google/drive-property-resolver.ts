import "server-only";

import type { CatalogPropertyInput } from "@/lib/properties/catalog-schema";
import {
  matterportUrlFromId,
  resolveKnownPropertyMedia,
} from "@/lib/properties/known-property-media";
import type { PropertyMatchHints } from "./folder-matching";
import { buildPropertyImagePathSlug } from "./folder-matching";
import { getDriveClient, hasGoogleServiceAccountCredentials } from "./auth";
import {
  resolveImagesForPropertyHierarchical,
  resolveMatterportThumbnail,
  type ResolvedPropertyImages,
} from "./drive";
import {
  extractDriveFolderIdFromAttributes,
  resolvePublicDrivePropertyImages,
} from "./drive-public";
import {
  appendDiscoveredFolder,
  findBestDriveFolderMatch,
  loadDriveFolderIndex,
  type DriveFolderIndexEntry,
} from "./drive-index";
import { findBestPropertyFolder } from "./folder-matching";

const MATTERPORT_URL_RE =
  /https?:\/\/(?:my\.)?matterport\.com\/[^\s,;|"'<>]+/i;
const MATTERPORT_ID_RE = /(?:\?m=|models\/)([a-zA-Z0-9]+)/;

export interface PropertyMediaResolution {
  images: ResolvedPropertyImages;
  matterportUrl: string;
  matterportThumbnailUrl?: string;
  matchedFolderId?: string;
  matchedFolderTitle?: string;
  matchSource?:
    | "attributes"
    | "known-media"
    | "index-fuzzy"
    | "api-search"
    | "api-hierarchical"
    | "public-folder";
  hasDriveImages: boolean;
  hasMatterportCover: boolean;
  hasAnyCover: boolean;
}

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function buildHints(input: CatalogPropertyInput): PropertyMatchHints {
  return {
    city: input.city,
    neighborhood: input.neighborhood,
    agentName: input.agentName,
    street: input.street,
    houseNumber: input.houseNumber,
    externalId: input.externalId,
    clientNames: [],
  };
}

function extractMatterportFromInput(input: CatalogPropertyInput): string {
  const fromMedia = input.media.matterportUrl?.trim();
  if (fromMedia) return fromMedia;

  const texts = [
    input.title,
    input.description,
    ...Object.values(input.attributes ?? {}).map((v) => String(v ?? "")),
  ];

  for (const text of texts) {
    const urlMatch = text.match(MATTERPORT_URL_RE);
    if (urlMatch) return urlMatch[0];
  }

  const known = resolveKnownPropertyMedia({
    street: input.street,
    houseNumber: input.houseNumber,
    title: input.title,
  });
  if (known?.matterportUrl) return known.matterportUrl;
  if (known?.matterportId) return matterportUrlFromId(known.matterportId);

  return "";
}

async function searchPropertyFolderViaApi(
  hints: PropertyMatchHints
): Promise<DriveFolderIndexEntry | null> {
  const address = [hints.street, hints.houseNumber].filter(Boolean).join(" ");
  if (!address) return null;

  try {
    const drive = await getDriveClient();
    const agentFirst = hints.agentName?.trim().split(/\s+/)[0] ?? "";
    const queryParts = [
      `name contains '${escapeDriveQuery(address)}'`,
      hints.street ? `name contains '${escapeDriveQuery(hints.street)}'` : "",
      agentFirst ? `name contains '${escapeDriveQuery(agentFirst)}'` : "",
    ].filter(Boolean);

    const seen = new Set<string>();
    let bestFolder: { id: string; name: string } | null = null;

    for (const part of queryParts) {
      const response = await drive.files.list({
        q: `${part} and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id,name)",
        pageSize: 25,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });

      for (const file of response.data.files ?? []) {
        if (!file.id || !file.name || seen.has(file.id)) continue;
        seen.add(file.id);
        const match = findBestPropertyFolder([{ id: file.id, name: file.name }], hints);
        if (match) bestFolder = match;
      }
    }

    if (!bestFolder) return null;

    const entry: DriveFolderIndexEntry = {
      folderId: bestFolder.id,
      title: bestFolder.name,
      addressKeys: [extractAddressFromTitle(bestFolder.name)],
      source: "sync-discovered",
    };
    appendDiscoveredFolder(entry);
    return entry;
  } catch {
    return null;
  }
}

function extractAddressFromTitle(title: string): string {
  return title.split(" - ")[0]?.trim() ?? title.trim();
}

async function resolveImagesFromFolderId(
  folderId: string,
  hints: PropertyMatchHints,
  options: { downloadToPublic?: boolean }
): Promise<ResolvedPropertyImages & { matchedFolder?: string }> {
  const pathSlug = buildPropertyImagePathSlug(hints)
    .split("/")
    .pop()
    ?.replace(/[^\u0590-\u05FFa-zA-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const publicResolved = await resolvePublicDrivePropertyImages(folderId, {
    city: hints.city,
    pathSlug: pathSlug || folderId,
    downloadToPublic: options.downloadToPublic,
  });

  if (publicResolved.images.length > 0) {
    return publicResolved;
  }

  return { coverImage: "", images: [], downloaded: false };
}

/**
 * Per-property media resolver — runs individually for every catalog row.
 * Order: attributes → known media → fuzzy index → API search → API hierarchy → public probe.
 */
export async function resolvePropertyMediaIndividual(
  input: CatalogPropertyInput,
  options: {
    driveRootFolderId: string;
    driveIndex?: DriveFolderIndexEntry[];
    downloadToPublic?: boolean;
    folderCache?: Map<string, ResolvedPropertyImages & { matchedFolder?: string }>;
  }
): Promise<PropertyMediaResolution> {
  const hints = buildHints(input);
  const index = options.driveIndex ?? loadDriveFolderIndex();
  const downloadToPublic = options.downloadToPublic !== false;

  let images: ResolvedPropertyImages = {
    coverImage: "",
    images: [],
    downloaded: false,
  };
  let matchedFolderId: string | undefined;
  let matchedFolderTitle: string | undefined;
  let matchSource: PropertyMediaResolution["matchSource"];

  const attributeFolderId = extractDriveFolderIdFromAttributes(input.attributes ?? {});
  const knownMedia = resolveKnownPropertyMedia({
    street: input.street,
    houseNumber: input.houseNumber,
    title: input.title,
  });

  const folderCandidates: Array<{
    id: string;
    title?: string;
    source: PropertyMediaResolution["matchSource"];
  }> = [];

  if (attributeFolderId) {
    folderCandidates.push({
      id: attributeFolderId,
      source: "attributes",
    });
  }
  if (knownMedia?.driveFolderId) {
    folderCandidates.push({
      id: knownMedia.driveFolderId,
      title: input.title,
      source: "known-media",
    });
  }

  const indexMatch = findBestDriveFolderMatch(hints, index);
  if (indexMatch) {
    folderCandidates.push({
      id: indexMatch.folderId,
      title: indexMatch.title,
      source: "index-fuzzy",
    });
  }

  const apiSearchMatch = await searchPropertyFolderViaApi(hints);
  if (apiSearchMatch) {
    folderCandidates.push({
      id: apiSearchMatch.folderId,
      title: apiSearchMatch.title,
      source: "api-search",
    });
  }

  for (const candidate of folderCandidates) {
    const cacheKey = `${candidate.id}:${hints.city}:${buildPropertyImagePathSlug(hints)}`;
    const cached = options.folderCache?.get(cacheKey);
    const resolved =
      cached ??
      (await resolveImagesFromFolderId(candidate.id, hints, {
        downloadToPublic,
      }));

    if (!cached && options.folderCache && resolved.images.length > 0) {
      options.folderCache.set(cacheKey, resolved);
    }

    if (resolved.images.length > 0) {
      images = resolved;
      matchedFolderId = candidate.id;
      matchedFolderTitle = candidate.title ?? resolved.matchedFolder;
      matchSource = candidate.source;
      break;
    }
  }

  if (images.images.length === 0 && hasGoogleServiceAccountCredentials()) {
    const hierarchical = await resolveImagesForPropertyHierarchical(
      options.driveRootFolderId,
      hints,
      {
        downloadToPublic,
        knownFolderId: knownMedia?.driveFolderId ?? indexMatch?.folderId,
      }
    );
    if (hierarchical.images.length > 0) {
      images = hierarchical;
      matchedFolderTitle = hierarchical.matchedFolder ?? hierarchical.matchPath;
      matchSource = "api-hierarchical";
    }
  }

  if (images.images.length === 0 && indexMatch) {
    const publicResolved = await resolveImagesFromFolderId(indexMatch.folderId, hints, {
      downloadToPublic,
    });
    if (publicResolved.images.length > 0) {
      images = publicResolved;
      matchedFolderId = indexMatch.folderId;
      matchedFolderTitle = indexMatch.title;
      matchSource = "public-folder";
    }
  }

  const matterportUrl = extractMatterportFromInput(input);
  const matterportThumbnailUrl =
    input.media.matterportThumbnailUrl?.trim() ||
    (matterportUrl ? resolveMatterportThumbnail(matterportUrl) : undefined);

  const hasDriveImages = images.images.length > 0;
  const hasMatterportCover = Boolean(matterportUrl && matterportThumbnailUrl);
  const hasAnyCover = hasDriveImages || hasMatterportCover;

  return {
    images,
    matterportUrl,
    matterportThumbnailUrl,
    matchedFolderId,
    matchedFolderTitle,
    matchSource,
    hasDriveImages,
    hasMatterportCover,
    hasAnyCover,
  };
}
