const DEV_FALLBACK_SECRET = "rehouse-dev-secret-change-in-production";

/** Edge-safe — no next-auth imports */
export function getNextAuthSecret(): string {
  const secret =
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim();

  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[NextAuth] NEXTAUTH_SECRET is not set. Using fallback — set NEXTAUTH_SECRET in Vercel for secure sessions."
    );
  }

  return DEV_FALLBACK_SECRET;
}

/** Edge-safe — no next-auth imports */
export function getNextAuthUrl(): string {
  const explicit =
    process.env.NEXTAUTH_URL?.trim() || process.env.AUTH_URL?.trim();

  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function isNextAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXTAUTH_SECRET?.trim() || process.env.AUTH_SECRET?.trim()
  );
}

export function isGoogleAuthEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
}
