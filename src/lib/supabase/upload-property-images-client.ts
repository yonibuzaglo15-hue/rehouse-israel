import { getBrowserSupabaseClient } from "./browser-client";
import {
  PROPERTIES_BUCKET,
  buildPropertyImageStoragePath,
  getPropertyImagePublicUrl,
} from "./property-storage";

export async function uploadPropertyImagesFromBrowser(files: File[]): Promise<string[]> {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client is not configured for browser uploads.");
  }

  const urls: string[] = [];

  for (const file of files) {
    const path = buildPropertyImageStoragePath(file);
    const { error } = await supabase.storage.from(PROPERTIES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

    if (error) {
      throw new Error(error.message || `Failed to upload ${file.name}`);
    }

    urls.push(getPropertyImagePublicUrl(supabase, path));
  }

  return urls;
}
