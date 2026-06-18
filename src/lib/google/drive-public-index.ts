import {
  findBestDriveFolderMatch,
  loadDriveFolderIndex,
  refreshDriveFolderIndex,
  type DriveFolderIndexEntry,
} from "./drive-index";

export {
  loadDriveFolderIndex,
  saveDriveFolderIndex,
  refreshDriveFolderIndex,
  findBestDriveFolderMatch,
  normalizeFolderToken,
  appendDiscoveredFolder,
  type DriveFolderIndexEntry,
} from "./drive-index";

/** @deprecated Use findBestDriveFolderMatch from drive-index */
export function resolvePublicDriveFolderIdFromIndex(hints: {
  street?: string;
  houseNumber?: string;
  agentName?: string;
  title?: string;
}): string | undefined {
  const match = findBestDriveFolderMatch(
    {
      city: "ashdod",
      neighborhood: "",
      street: hints.street ?? hints.title,
      houseNumber: hints.houseNumber,
      agentName: hints.agentName,
    },
    loadDriveFolderIndex()
  );
  return match?.folderId;
}

/** @deprecated Use refreshDriveFolderIndex */
export async function crawlPublicDriveFolderTree(
  rootFolderId: string,
  options: { maxDepth?: number; onFolder?: (entry: DriveFolderIndexEntry) => void } = {}
): Promise<DriveFolderIndexEntry[]> {
  const result = await refreshDriveFolderIndex(rootFolderId);
  for (const entry of result.entries) {
    options.onFolder?.(entry);
  }
  return result.entries;
}
