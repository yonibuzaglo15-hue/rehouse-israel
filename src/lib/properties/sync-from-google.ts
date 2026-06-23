import "server-only";

import { SYSTEM_USERS, getUserByEmail } from "@/lib/auth/users";
import type { CatalogPropertyInput, PropertyImportResult } from "@/lib/properties/catalog-schema";
import { mapImportRowToCatalogInput } from "@/lib/properties/import-mapping";
import { isSupabaseConfigured } from "@/lib/properties/repository/types";
import { supabasePropertyRepository } from "@/lib/properties/repository/supabase-repository";
import {
  GOOGLE_DRIVE_MEDIA_FOLDER_ID,
  GOOGLE_SHEETS_AGENTS_GID,
  GOOGLE_SHEETS_ID,
  GOOGLE_SHEETS_PROPERTIES_GID,
} from "@/lib/google/config";
import { refreshDriveFolderIndex } from "@/lib/google/drive-index";
import { resolvePropertyMediaIndividual } from "@/lib/google/drive-property-resolver";
import { fetchSheetRows } from "@/lib/google/sheets";
import { syncAgentsFromSheetRows } from "@/lib/agents/sync-from-google";
import {
  getLocalSheetExportPath,
  hasLocalSheetExport,
  loadLocalSheetExportIfExists,
} from "@/lib/properties/sheet-csv";
import type { PropertyImportRow } from "@/lib/properties/catalog-schema";

export interface GoogleSyncOptions {
  spreadsheetId?: string;
  propertiesGid?: string;
  agentsGid?: string;
  driveMediaFolderId?: string;
  downloadImages?: boolean;
  syncAgents?: boolean;
}

export interface GoogleSyncResult {
  properties: PropertyImportResult;
  agents?: Awaited<ReturnType<typeof syncAgentsFromSheetRows>>;
  imageMatches: {
    row: number;
    title?: string;
    folder?: string;
    imageCount: number;
    matterport?: boolean;
    matchSource?: string;
    hasCover?: boolean;
  }[];
  mediaStats: {
    totalSynced: number;
    withDriveImages: number;
    withMatterportCover: number;
    withAnyCover: number;
    indexSource: string;
    indexFolders: number;
  };
  rowsProcessed: number;
  source?: string;
}

async function upsertCatalogInputs(inputs: CatalogPropertyInput[]): Promise<PropertyImportResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before syncing catalog data.",
    );
  }

  const result: PropertyImportResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    try {
      const before = input.id
        ? await supabasePropertyRepository.getById(input.id)
        : input.externalId
          ? await supabasePropertyRepository.getByExternalId(input.externalId)
          : null;

      await supabasePropertyRepository.upsert(input);
      if (before) result.updated++;
      else result.created++;
    } catch (error) {
      result.skipped++;
      result.errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : "שגיאה בשמירה",
      });
    }
  }

  return result;
}

function resolveAgentFromRow(input: CatalogPropertyInput): CatalogPropertyInput {
  const email = input.agentEmail?.trim().toLowerCase();
  const name = input.agentName?.trim();

  if (email) {
    const user = getUserByEmail(email);
    if (user) {
      return {
        ...input,
        agentId: user.id,
        agentEmail: user.email,
        agentName: user.fullName,
      };
    }
  }

  if (name) {
    const user = SYSTEM_USERS.find(
      (entry) => entry.fullName.trim() === name || entry.fullName.includes(name)
    );
    if (user) {
      return {
        ...input,
        agentId: user.id,
        agentEmail: user.email,
        agentName: user.fullName,
      };
    }
  }

  return input;
}

async function enrichInputWithMedia(
  input: CatalogPropertyInput,
  driveMediaFolderId: string,
  downloadImages: boolean,
  driveIndex: Awaited<ReturnType<typeof refreshDriveFolderIndex>>["entries"],
  folderCache: Map<string, import("@/lib/google/drive").ResolvedPropertyImages & { matchedFolder?: string }>
): Promise<{
  input: CatalogPropertyInput;
  imageMatch: GoogleSyncResult["imageMatches"][number];
  resolution: Awaited<ReturnType<typeof resolvePropertyMediaIndividual>>;
}> {
  const resolution = await resolvePropertyMediaIndividual(input, {
    driveRootFolderId: driveMediaFolderId,
    driveIndex,
    downloadToPublic: downloadImages,
    folderCache,
  });

  const nextInput: CatalogPropertyInput = {
    ...input,
    media: {
      ...input.media,
      images: resolution.images.images,
      imageFolderUrl:
        resolution.images.images.length > 0
          ? resolution.images.imageFolderUrl
          : undefined,
      matterportUrl: resolution.matterportUrl,
      matterportThumbnailUrl: resolution.matterportThumbnailUrl,
    },
  };

  return {
    input: nextInput,
    resolution,
    imageMatch: {
      row: 0,
      title: input.title,
      folder: resolution.matchedFolderTitle,
      imageCount: resolution.images.images.length,
      matterport: Boolean(resolution.matterportUrl),
      matchSource: resolution.matchSource,
      hasCover: resolution.hasAnyCover,
    },
  };
}
export async function syncFromGoogle(
  options: GoogleSyncOptions = {}
): Promise<GoogleSyncResult> {
  if (hasLocalSheetExport()) {
    const csvRows = loadLocalSheetExportIfExists();
    if (csvRows?.length) {
      return syncFromSheetRows(csvRows, { ...options, sourceLabel: "local-csv-export" });
    }
  }

  try {
    const { rows, source } = await loadSheetRows(options);
    return syncFromSheetRows(rows, { ...options, sourceLabel: source });
  } catch (error) {
    if (!isGoogleCredentialsError(error)) {
      throw error;
    }
    return syncFromOfficialFallbackSeed(options);
  }
}

async function loadSheetRows(
  options: GoogleSyncOptions
): Promise<{ rows: PropertyImportRow[]; source: string }> {
  const spreadsheetId = options.spreadsheetId ?? GOOGLE_SHEETS_ID;
  const propertiesGid = options.propertiesGid ?? GOOGLE_SHEETS_PROPERTIES_GID;

  try {
    const rows = await fetchSheetRows(spreadsheetId, propertiesGid);
    return { rows, source: "google-sheets-api" };
  } catch (error) {
    if (!isGoogleCredentialsError(error)) {
      throw error;
    }

    const csvRows = loadLocalSheetExportIfExists();
    if (csvRows) {
      return { rows: csvRows, source: "local-csv-export" };
    }

    throw new Error(
      `חסרות הרשאות Google לטבלה. הוסיפו GOOGLE_SERVICE_ACCOUNT_JSON ל-.env.local או ייצאו CSV ל-${getLocalSheetExportPath()}`
    );
  }
}

async function syncFromSheetRows(
  rawRows: PropertyImportRow[],
  options: GoogleSyncOptions & { sourceLabel?: string }
): Promise<GoogleSyncResult> {
  const spreadsheetId = options.spreadsheetId ?? GOOGLE_SHEETS_ID;
  const agentsGid = options.agentsGid ?? GOOGLE_SHEETS_AGENTS_GID;
  const driveMediaFolderId = options.driveMediaFolderId ?? GOOGLE_DRIVE_MEDIA_FOLDER_ID;
  const downloadImages = options.downloadImages !== false;

  const indexRefresh = await refreshDriveFolderIndex(driveMediaFolderId);
  const driveIndex = indexRefresh.entries;
  const folderCache = new Map<
    string,
    import("@/lib/google/drive").ResolvedPropertyImages & { matchedFolder?: string }
  >();

  const enrichedRows: CatalogPropertyInput[] = [];
  const imageMatches: GoogleSyncResult["imageMatches"] = [];
  const mappingErrors: PropertyImportResult["errors"] = [];
  let withDriveImages = 0;
  let withMatterportCover = 0;
  let withAnyCover = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const mapped = mapImportRowToCatalogInput(rawRows[i], i);
    if (!mapped.success) {
      mappingErrors.push({ row: i + 1, message: mapped.error });
      imageMatches.push({ row: i + 1, imageCount: 0 });
      continue;
    }

    let input = resolveAgentFromRow({
      ...mapped.data,
      sourceSheet: spreadsheetId,
    });

    const enriched = await enrichInputWithMedia(
      input,
      driveMediaFolderId,
      downloadImages,
      driveIndex,
      folderCache
    );
    input = enriched.input;
    if (enriched.resolution.hasDriveImages) withDriveImages++;
    if (enriched.resolution.hasMatterportCover) withMatterportCover++;
    if (enriched.resolution.hasAnyCover) withAnyCover++;
    imageMatches.push({ ...enriched.imageMatch, row: i + 1 });

    enrichedRows.push(input);
  }

  const importResult = await upsertCatalogInputs(enrichedRows);
  importResult.errors.push(...mappingErrors);
  importResult.skipped += mappingErrors.length;

  let agentsResult;
  if (options.syncAgents !== false && agentsGid) {
    try {
      const agentRows = await fetchSheetRows(spreadsheetId, agentsGid);
      agentsResult = await syncAgentsFromSheetRows(agentRows);
    } catch {
      // Agents tab is optional.
    }
  }

  return {
    properties: importResult,
    agents: agentsResult,
    imageMatches,
    mediaStats: {
      totalSynced: enrichedRows.length,
      withDriveImages,
      withMatterportCover,
      withAnyCover,
      indexSource: indexRefresh.source,
      indexFolders: driveIndex.length,
    },
    rowsProcessed: rawRows.length,
    source: options.sourceLabel,
  };
}

function isGoogleCredentialsError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("הרשאות Google") ||
    message.includes("GOOGLE_SERVICE_ACCOUNT") ||
    message.includes("Could not load the default credentials")
  );
}

async function syncFromOfficialFallbackSeed(
  options: GoogleSyncOptions = {}
): Promise<GoogleSyncResult> {
  const { buildOfficialFallbackCatalogProperties } = await import("./official-fallback-seed");
  const driveMediaFolderId = options.driveMediaFolderId ?? GOOGLE_DRIVE_MEDIA_FOLDER_ID;
  const downloadImages = options.downloadImages !== false;

  const seed = buildOfficialFallbackCatalogProperties();
  const indexRefresh = await refreshDriveFolderIndex(driveMediaFolderId);
  const folderCache = new Map<
    string,
    import("@/lib/google/drive").ResolvedPropertyImages & { matchedFolder?: string }
  >();
  const enrichedRows: CatalogPropertyInput[] = [];
  const imageMatches: GoogleSyncResult["imageMatches"] = [];
  let withDriveImages = 0;
  let withMatterportCover = 0;
  let withAnyCover = 0;

  for (let i = 0; i < seed.length; i++) {
    const property = seed[i];
    const input = resolveAgentFromRow(property);
    const enriched = await enrichInputWithMedia(
      input,
      driveMediaFolderId,
      downloadImages,
      indexRefresh.entries,
      folderCache
    );
    if (enriched.resolution.hasDriveImages) withDriveImages++;
    if (enriched.resolution.hasMatterportCover) withMatterportCover++;
    if (enriched.resolution.hasAnyCover) withAnyCover++;
    enrichedRows.push(enriched.input);
    imageMatches.push({ ...enriched.imageMatch, row: i + 1 });
  }

  const importResult = await upsertCatalogInputs(enrichedRows);

  return {
    properties: {
      ...importResult,
      errors: [
        {
          row: 0,
          message:
            withAnyCover > 0
              ? `Google Sheets לא מחובר — נטענו ${seed.length} נכסי fallback עם ${withAnyCover} נכסים עם תמונת תצוגה.`
              : `Google Sheets לא מחובר — נטענו ${seed.length} נכסי fallback מקומיים. הוסיפו GOOGLE_SERVICE_ACCOUNT_JSON ל-.env.local לסנכרון מלא מהטבלה.`,
        },
        ...importResult.errors,
      ],
    },
    imageMatches,
    mediaStats: {
      totalSynced: enrichedRows.length,
      withDriveImages,
      withMatterportCover,
      withAnyCover,
      indexSource: indexRefresh.source,
      indexFolders: indexRefresh.entries.length,
    },
    rowsProcessed: seed.length,
    source: "official-fallback-seed",
  };
}
