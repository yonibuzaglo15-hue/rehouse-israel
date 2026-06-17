import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import type { SystemRole } from "./types";

export const SESSION_COOKIE_NAME = "rehouse_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  id: string;
  email: string;
  role: SystemRole;
  fullName: string;
  mustChangeOnFirstLogin: boolean;
}

function getAuthSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "rehouse-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return {
      id: String(payload.id),
      email: String(payload.email),
      role: payload.role as SystemRole,
      fullName: String(payload.fullName),
      mustChangeOnFirstLogin: Boolean(payload.mustChangeOnFirstLogin),
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
