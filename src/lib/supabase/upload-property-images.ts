import { isBrowserSupabaseConfigured } from "./browser-client";
import { uploadPropertyImagesFromBrowser } from "./upload-property-images-client";

export async function uploadPropertyImagesViaApi(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch("/api/catalog/properties/upload-images", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { urls?: string[]; error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "העלאת התמונות נכשלה");
  }

  return data.urls ?? [];
}

/**
 * Upload property images to the Supabase `properties` bucket.
 * Uses the browser Supabase client when public env vars are set, otherwise the secured API route.
 */
export async function uploadPropertyImages(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  if (isBrowserSupabaseConfigured()) {
    try {
      return await uploadPropertyImagesFromBrowser(files);
    } catch {
      return uploadPropertyImagesViaApi(files);
    }
  }

  return uploadPropertyImagesViaApi(files);
}
