import "server-only";

import { promises as fs } from "fs";
import path from "path";
import type { City } from "@/lib/types";
import { driveFilePublicUrl, type ResolvedPropertyImages } from "./drive";
import { MAX_FOLDER_IMAGES } from "@/lib/properties/image-routing";

export interface PublicDriveEntry {
  id: string;
  title: string;
  kind: "folder" | "file";
}

const NUMBERED_IMAGE_FOLDER_RE = /תמונות\s*עם\s*מספר/i;
const NUMBERED_IMAGE_FILE_RE = /(\d+)\.(jpe?g|png|webp)$/i;

function parseEmbeddedFolderHtml(html: string): PublicDriveEntry[] {
  const entries: PublicDriveEntry[] = [];
  const blockRe =
    /<div class="flip-entry" id="entry-([^"]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<div class="flip-entry-title">([^<]*)<\/div>/g;

  for (const match of html.matchAll(blockRe)) {
    const id = match[1]?.trim();
    const href = match[2]?.trim() ?? "";
    const title = match[3]?.replace(/[\u200e\u200f]/g, "").trim() ?? "";
    if (!id) continue;

    entries.push({
      id,
      title,
      kind: href.includes("/drive/folders/") ? "folder" : "file",
    });
  }

  return entries;
}

export async function listPublicDriveFolder(folderId: string): Promise<PublicDriveEntry[]> {
  const response = await fetch(
    `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}`,
    { next: { revalidate: 0 } }
  );

  if (!response.ok) {
    return [];
  }

  return parseEmbeddedFolderHtml(await response.text());
}

function sortNumberedImageEntries(entries: PublicDriveEntry[]): PublicDriveEntry[] {
  return [...entries].sort((a, b) => {
    const aMatch = a.title.match(NUMBERED_IMAGE_FILE_RE);
    const bMatch = b.title.match(NUMBERED_IMAGE_FILE_RE);
    const aIndex = aMatch ? Number(aMatch[1]) : Number.MAX_SAFE_INTEGER;
    const bIndex = bMatch ? Number(bMatch[1]) : Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex;
  });
}

async function downloadPublicImage(
  fileId: string,
  city: City,
  publicRelativeDir: string,
  filename: string
): Promise<string | null> {
  const remoteUrl = driveFilePublicUrl(fileId);
  const publicAbsoluteDir = path.join(process.cwd(), "public", publicRelativeDir);

  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) return remoteUrl;

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(publicAbsoluteDir, { recursive: true });
    await fs.writeFile(path.join(publicAbsoluteDir, filename), buffer);
    return `/${publicRelativeDir}/${filename}`.replace(/\/+/g, "/");
  } catch {
    return remoteUrl;
  }
}

export async function resolvePublicDrivePropertyImages(
  propertyFolderId: string,
  options: {
    city?: City;
    pathSlug?: string;
    downloadToPublic?: boolean;
  } = {}
): Promise<ResolvedPropertyImages & { matchedFolder?: string; matchPath?: string }> {
  const rootEntries = await listPublicDriveFolder(propertyFolderId);
  if (rootEntries.length === 0) {
    return { coverImage: "", images: [], downloaded: false };
  }

  const numberedFolder = rootEntries.find(
    (entry) => entry.kind === "folder" && NUMBERED_IMAGE_FOLDER_RE.test(entry.title)
  );

  let imageEntries: PublicDriveEntry[] = [];

  if (numberedFolder) {
    const nested = await listPublicDriveFolder(numberedFolder.id);
    imageEntries = nested.filter((entry) => entry.kind === "file");
  } else {
    imageEntries = rootEntries.filter(
      (entry) => entry.kind === "file" && NUMBERED_IMAGE_FILE_RE.test(entry.title)
    );
  }

  const sorted = sortNumberedImageEntries(imageEntries).slice(0, MAX_FOLDER_IMAGES);
  if (sorted.length === 0) {
    return {
      coverImage: "",
      images: [],
      downloaded: false,
      matchedFolder: numberedFolder?.title,
      matchPath: numberedFolder?.title,
    };
  }

  const city = options.city ?? "ashdod";
  const slug = (options.pathSlug ?? propertyFolderId).replace(/^\/+|\/+$/g, "");
  const publicRelativeDir = `images/properties/${city}/${slug}`;

  const images: string[] = [];
  for (const [index, entry] of sorted.entries()) {
    const extMatch = entry.title.match(/\.(jpe?g|png|webp)$/i);
    const ext = extMatch ? extMatch[0].toLowerCase() : ".jpg";
    const filename = `${index + 1}${ext}`;

    if (options.downloadToPublic !== false) {
      const localOrRemote = await downloadPublicImage(
        entry.id,
        city,
        publicRelativeDir,
        filename
      );
      if (localOrRemote) images.push(localOrRemote);
    } else {
      images.push(driveFilePublicUrl(entry.id));
    }
  }

  return {
    coverImage: images[0] ?? "",
    images,
    imageFolderUrl: `/${publicRelativeDir}`,
    downloaded: images.some((url) => url.startsWith("/images/")),
    matchedFolder: numberedFolder?.title ?? propertyFolderId,
    matchPath: numberedFolder?.title ?? propertyFolderId,
  };
}

export function extractDriveFolderIdFromAttributes(
  attributes: Record<string, unknown>
): string | undefined {
  const keys = [
    "תיקיית תמונות",
    "תיקיית דרייב",
    "drive folder id",
    "drivefolderid",
    "folder id",
    "folderid",
    "google drive folder",
  ];

  for (const [rawKey, rawValue] of Object.entries(attributes)) {
    const key = rawKey.trim().toLowerCase();
    if (!keys.some((candidate) => key.includes(candidate))) continue;
    const value = String(rawValue ?? "").trim();
    const match = value.match(/[-\w]{20,}/);
    if (match) return match[0];
  }

  return undefined;
}
