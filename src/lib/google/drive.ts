import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type { City } from "@/lib/types";
import { getDriveClient } from "./auth";
import {
  buildPropertyImagePathSlug,
  findBestCityFolder,
  findBestMatchingFolder,
  findBestNeighborhoodFolder,
  findBestPropertyFolder,
  neighborhoodToSlug,
  type DriveFolderRef,
  type PropertyMatchHints,
} from "./folder-matching";
import { IMAGE_EXTENSIONS, MAX_FOLDER_IMAGES } from "@/lib/properties/image-routing";
import {
  resolvePublicDrivePropertyImages,
} from "./drive-public";

export interface DriveImageFile {
  id: string;
  name: string;
  index: number;
}

export interface ResolvedPropertyImages {
  coverImage: string;
  images: string[];
  imageFolderUrl?: string;
  downloaded: boolean;
}

function parseNumberedImageIndex(name: string): number | null {
  const match = name.match(/^(\d+)\.(jpe?g|png|webp)$/i);
  if (!match) return null;
  return Number(match[1]);
}

export async function listDriveSubfolders(parentFolderId: string): Promise<DriveFolderRef[]> {
  const drive = await getDriveClient();
  const folders: DriveFolderRef[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "nextPageToken, files(id, name)",
      pageSize: 200,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const file of response.data.files ?? []) {
      if (file.id && file.name) {
        folders.push({ id: file.id, name: file.name });
      }
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return folders;
}

export async function listNumberedImagesInFolder(folderId: string): Promise<DriveImageFile[]> {
  const drive = await getDriveClient();
  const images: DriveImageFile[] = [];
  let pageToken: string | undefined;

  do {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: "nextPageToken, files(id, name, mimeType)",
      pageSize: 200,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    for (const file of response.data.files ?? []) {
      if (!file.id || !file.name) continue;
      const index = parseNumberedImageIndex(file.name);
      if (index === null) continue;
      images.push({ id: file.id, name: file.name, index });
    }

    pageToken = response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return images.sort((a, b) => a.index - b.index).slice(0, MAX_FOLDER_IMAGES);
}

export function driveFilePublicUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

async function downloadDriveFile(fileId: string): Promise<Buffer> {
  const drive = await getDriveClient();
  const response = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );
  return Buffer.from(response.data as ArrayBuffer);
}

export async function downloadPropertyImages(
  folderId: string,
  city: City,
  pathSlug: string,
  options: { downloadToPublic?: boolean } = {}
): Promise<ResolvedPropertyImages> {
  const numbered = await listNumberedImagesInFolder(folderId);
  if (numbered.length === 0) {
    return { coverImage: "", images: [], downloaded: false };
  }

  const publicRelativeDir = `/images/properties/${city}/${pathSlug}`;
  const publicAbsoluteDir = path.join(
    process.cwd(),
    "public",
    "images",
    "properties",
    city,
    ...pathSlug.split("/")
  );

  if (options.downloadToPublic !== false) {
    try {
      await fs.mkdir(publicAbsoluteDir, { recursive: true });

      const localPaths: string[] = [];
      for (const image of numbered) {
        const ext = path.extname(image.name).toLowerCase() || ".jpg";
        const filename = `${image.index}${ext}`;
        const absolutePath = path.join(publicAbsoluteDir, filename);
        const buffer = await downloadDriveFile(image.id);
        await fs.writeFile(absolutePath, buffer);
        localPaths.push(`${publicRelativeDir}/${filename}`);
      }

      return {
        coverImage: localPaths[0] ?? "",
        images: localPaths,
        imageFolderUrl: publicRelativeDir,
        downloaded: true,
      };
    } catch {
      // Fall back to Drive URLs (e.g. read-only serverless env)
    }
  }

  const remoteUrls = numbered.map((image) => driveFilePublicUrl(image.id));
  return {
    coverImage: remoteUrls[0] ?? "",
    images: remoteUrls,
    downloaded: false,
  };
}

/** Flat root match — legacy fallback */
export async function resolveImagesForProperty(
  mediaRootFolderId: string,
  subfolders: DriveFolderRef[] | null,
  city: City,
  neighborhood: string,
  options: { downloadToPublic?: boolean; pathSlug?: string } = {}
): Promise<ResolvedPropertyImages & { matchedFolder?: string }> {
  const folders = subfolders ?? (await listDriveSubfolders(mediaRootFolderId));
  const match = findBestMatchingFolder(folders, city, neighborhood);

  if (!match) {
    return { coverImage: "", images: [], downloaded: false };
  }

  const slug = options.pathSlug ?? neighborhoodToSlug(neighborhood);
  const resolved = await downloadPropertyImages(match.id, city, slug, options);
  return { ...resolved, matchedFolder: match.name };
}

/**
 * Hierarchical match: city → neighborhood/area → specific property folder.
 * Falls back to flat root matching when hierarchy is unavailable.
 */
export async function resolveImagesForPropertyHierarchical(
  mediaRootFolderId: string,
  hints: PropertyMatchHints,
  options: { downloadToPublic?: boolean; knownFolderId?: string } = {}
): Promise<ResolvedPropertyImages & { matchedFolder?: string; matchPath?: string }> {
  const pathSlug = buildPropertyImagePathSlug(hints);
  const knownFolderId = options.knownFolderId;

  try {
    const rootFolders = await listDriveSubfolders(mediaRootFolderId);

    const cityFolder = findBestCityFolder(rootFolders, hints.city);
    if (cityFolder) {
      const areaFolders = await listDriveSubfolders(cityFolder.id);
      const areaFolder = findBestNeighborhoodFolder(areaFolders, hints.neighborhood);

      if (areaFolder) {
        const directImages = await listNumberedImagesInFolder(areaFolder.id);
        if (directImages.length > 0) {
          const resolved = await downloadPropertyImages(
            areaFolder.id,
            hints.city,
            neighborhoodToSlug(hints.neighborhood),
            options
          );
          return {
            ...resolved,
            matchedFolder: areaFolder.name,
            matchPath: `${cityFolder.name} / ${areaFolder.name}`,
          };
        }

        const propertyFolders = await listDriveSubfolders(areaFolder.id);
        const propertyFolder = findBestPropertyFolder(propertyFolders, hints);

        if (propertyFolder) {
          const resolved = await downloadPropertyImages(
            propertyFolder.id,
            hints.city,
            pathSlug,
            options
          );
          if (resolved.images.length > 0) {
            return {
              ...resolved,
              matchedFolder: propertyFolder.name,
              matchPath: `${cityFolder.name} / ${areaFolder.name} / ${propertyFolder.name}`,
            };
          }

          const publicResolved = await resolvePublicDrivePropertyImages(propertyFolder.id, {
            city: hints.city,
            pathSlug,
            downloadToPublic: options.downloadToPublic,
          });
          if (publicResolved.images.length > 0) {
            return {
              ...publicResolved,
              matchPath: `${cityFolder.name} / ${areaFolder.name} / ${propertyFolder.name}`,
            };
          }
        }
      }
    }

    const flat = await resolveImagesForProperty(
      mediaRootFolderId,
      rootFolders,
      hints.city,
      hints.neighborhood,
      { ...options, pathSlug }
    );

    if (flat.images.length > 0) {
      return {
        ...flat,
        matchPath: flat.matchedFolder,
      };
    }
  } catch {
    // Fall through to explicit/public folder resolution below.
  }

  if (knownFolderId) {
    const publicResolved = await resolvePublicDrivePropertyImages(knownFolderId, {
      city: hints.city,
      pathSlug,
      downloadToPublic: options.downloadToPublic,
    });
    if (publicResolved.images.length > 0) {
      return publicResolved;
    }
  }

  return { coverImage: "", images: [], downloaded: false };
}

export function resolveMatterportThumbnail(matterportUrl: string): string | undefined {
  const trimmed = matterportUrl.trim();
  if (!trimmed) return undefined;

  const patterns = [
    /my\.matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/,
    /my\.matterport\.com\/models\/([a-zA-Z0-9]+)/,
    /[?&]m=([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return `https://my.matterport.com/api/v2/player/models/${match[1]}/thumb`;
    }
  }

  return undefined;
}

export { IMAGE_EXTENSIONS };
