import "server-only";

import { existsSync, readdirSync } from "fs";
import path from "path";
import { resolveMatterportThumbnail } from "@/lib/google/drive";
import type { CatalogProperty } from "./catalog-schema";
import { resolveImagesFromFolder } from "./image-routing";
import {
  buildPropertyPathSlug,
  matterportUrlFromId,
  resolveKnownPropertyMedia,
} from "./known-property-media";

function sortImageFilenames(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const ai = Number(a.match(/^(\d+)/)?.[1] ?? Number.MAX_SAFE_INTEGER);
    const bi = Number(b.match(/^(\d+)/)?.[1] ?? Number.MAX_SAFE_INTEGER);
    return ai - bi;
  });
}

function listLocalImageUrls(city: string, slug: string): string[] {
  const relativeDir = path.join("images", "properties", city, slug);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);
  if (!existsSync(absoluteDir)) return [];

  const files = sortImageFilenames(
    readdirSync(absoluteDir).filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
  );

  return files.map((file) => `/${relativeDir}/${file}`.replace(/\\/g, "/"));
}

/** Latin folder slugs on disk that differ from Hebrew address slugs */
const LOCAL_FOLDER_SLUG_ALIASES: Record<string, string> = {
  "שבט-לוי-1": "shevet-levi-1",
  "שבט-לוי": "shevet-levi-1",
};

function listCityImageFolderSlugs(city: string): string[] {
  const absoluteCityDir = path.join(process.cwd(), "public", "images", "properties", city);
  if (!existsSync(absoluteCityDir)) return [];
  return readdirSync(absoluteCityDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function candidateSlugs(property: CatalogProperty): string[] {
  const slugs = new Set<string>();
  const primary = buildPropertyPathSlug(property.city, property.street, property.houseNumber);
  if (primary) {
    slugs.add(primary);
    const alias = LOCAL_FOLDER_SLUG_ALIASES[primary];
    if (alias) slugs.add(alias);
  }

  const known = resolveKnownPropertyMedia({
    street: property.street,
    houseNumber: property.houseNumber,
    title: property.title,
  });
  if (known?.driveFolderId) {
    slugs.add("shevet-levi-1");
  }

  if (property.media.imageFolderUrl) {
    const folderSlug = property.media.imageFolderUrl.split("/").filter(Boolean).pop();
    if (folderSlug) slugs.add(folderSlug);
  }

  for (const folder of listCityImageFolderSlugs(property.city)) {
    if (primary && folder.replace(/-/g, "").includes(primary.replace(/-/g, ""))) {
      slugs.add(folder);
    }
  }

  return [...slugs];
}

function withMatterportThumbnail(property: CatalogProperty): CatalogProperty {
  const matterportUrl =
    property.media.matterportUrl?.trim() ||
    (() => {
      const known = resolveKnownPropertyMedia({
        street: property.street,
        houseNumber: property.houseNumber,
        title: property.title,
      });
      return known?.matterportUrl || (known?.matterportId ? matterportUrlFromId(known.matterportId) : "");
    })();

  if (!matterportUrl) return property;

  const matterportThumbnailUrl =
    property.media.matterportThumbnailUrl?.trim() ||
    resolveMatterportThumbnail(matterportUrl);

  if (
    matterportThumbnailUrl === property.media.matterportThumbnailUrl &&
    matterportUrl === property.media.matterportUrl
  ) {
    return property;
  }

  return {
    ...property,
    media: {
      ...property.media,
      matterportUrl: property.media.matterportUrl || matterportUrl,
      matterportThumbnailUrl: matterportThumbnailUrl || property.media.matterportThumbnailUrl,
    },
  };
}

export function hydrateCatalogPropertyMedia(property: CatalogProperty): CatalogProperty {
  let next = withMatterportThumbnail(property);

  if (next.media.images.some((url) => url?.trim())) {
    return next;
  }

  for (const slug of candidateSlugs(next)) {
    const localImages = listLocalImageUrls(next.city, slug);
    if (localImages.length > 0) {
      return {
        ...next,
        media: {
          ...next.media,
          images: localImages,
          imageFolderUrl: localImages[0].replace(/\/[^/]+$/, ""),
        },
      };
    }
  }

  if (next.media.imageFolderUrl) {
    const fromFolder = resolveImagesFromFolder(next.media.imageFolderUrl);
    if (fromFolder.length > 0) {
      return {
        ...next,
        media: {
          ...next.media,
          images: fromFolder,
        },
      };
    }
  }

  return next;
}

export function hydrateCatalogPropertiesMedia(
  properties: CatalogProperty[]
): CatalogProperty[] {
  return properties.map(hydrateCatalogPropertyMedia);
}
