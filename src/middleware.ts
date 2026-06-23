import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getNextAuthSecret } from "@/lib/auth/nextauth-env";
import type { SystemRole } from "@/lib/auth/types";
import {
  canAccessPath,
  getDashboardPathForRole,
  isProtectedPath,
} from "@/lib/auth/routes";

function getAuthSecret(): Uint8Array {
  return new TextEncoder().encode(getNextAuthSecret());
}

interface MiddlewareSession {
  role: SystemRole;
}

async function getLegacySessionFromRequest(
  request: NextRequest
): Promise<MiddlewareSession | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const role = payload.role as SystemRole;
    if (role !== "dev" && role !== "admin" && role !== "agent") {
      return null;
    }
    return { role };
  } catch {
    return null;
  }
}

async function getNextAuthAdminSessionFromRequest(
  request: NextRequest
): Promise<MiddlewareSession | null> {
  const token = await getToken({
    req: request,
    secret: getNextAuthSecret(),
  });

  if (token?.role === "admin") {
    return { role: "admin" };
  }

  return null;
}

async function getSessionFromRequest(
  request: NextRequest
): Promise<MiddlewareSession | null> {
  const legacy = await getLegacySessionFromRequest(request);
  if (legacy) return legacy;
  return getNextAuthAdminSessionFromRequest(request);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const isLogin = pathname === "/login";
  const isAccessDenied = pathname === "/access-denied";
  const protectedRoute = isProtectedPath(pathname);

  if (protectedRoute) {
    if (!session) {
      if (pathname.startsWith("/admin/property")) {
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set("login", "1");
        return NextResponse.redirect(homeUrl);
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessPath(session.role, pathname)) {
      const deniedUrl = new URL("/access-denied", request.url);
      deniedUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(deniedUrl);
    }
  }

  if (isLogin && session) {
    const redirectPath =
      session.role === "admin" ? "/" : getDashboardPathForRole(session.role);
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isAccessDenied && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dev/:path*",
    "/admin/:path*",
    "/agent-dashboard/:path*",
    "/login",
    "/access-denied",
  ],
};
