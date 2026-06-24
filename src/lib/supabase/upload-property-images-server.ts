import "server-only";

import { getSupabaseAdminClient } from "./server-client";
import {
  PROPERTIES_BUCKET,
  buildPropertyImageStoragePath,
  getPropertyImagePublicUrl,
} from "./property-storage";

export async function uploadPropertyImagesToStorage(files: File[]): Promise<string[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error(
      "Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const urls: string[] = [];

  for (const file of files) {
    const path = buildPropertyImageStoragePath(file);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(PROPERTIES_BUCKET).upload(path, buffer, {
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
