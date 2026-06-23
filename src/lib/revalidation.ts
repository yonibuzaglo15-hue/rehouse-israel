/** Paths revalidated when external automations (Make/n8n/Dror) update catalog data */
export const REVALIDATION_PATHS = [
  "/",
  "/properties",
  "/agents",
  "/projects",
] as const;

export type RevalidationPath = (typeof REVALIDATION_PATHS)[number];

/** Default ISR interval in seconds — override at deploy time via REVALIDATE_SECONDS env in route handlers */
export const DEFAULT_REVALIDATE_SECONDS = 300;

export function getRevalidateSeconds(): number {
  const raw = process.env.REVALIDATE_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : 300;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 300;
}

export function isValidRevalidationSecret(secret: string | null | undefined): boolean {
  const expected = process.env.REVALIDATION_SECRET?.trim();
  if (!expected) return false;
  return Boolean(secret && secret.trim() === expected);
}
