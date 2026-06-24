export const PROPERTIES_BUCKET = "properties";

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
]);

export function buildPropertyImageStoragePath(file: File): string {
  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ext = ALLOWED_IMAGE_EXTENSIONS.has(rawExt) ? rawExt : "jpg";
  const stamp = Date.now();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `uploads/${stamp}-${id}.${ext}`;
}

export function getPropertyImagePublicUrl(
  supabase: { storage: { from: (bucket: string) => { getPublicUrl: (path: string) => { data: { publicUrl: string } } } } },
  path: string
): string {
  return supabase.storage.from(PROPERTIES_BUCKET).getPublicUrl(path).data.publicUrl;
}
