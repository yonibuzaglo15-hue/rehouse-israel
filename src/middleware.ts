import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import type { SystemRole } from "@/lib/auth/types";
import {
  canAccessPath,
  getDashboardPathForRole,
  isProtectedPath,
} from "@/lib/auth/routes";

function getAuthSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ?? "rehouse-dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

interface MiddlewareSession {
  role: SystemRole;
}

async function getSessionFromRequest(
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);
  const isLogin = pathname === "/login";
  const isAccessDenied = pathname === "/access-denied";
  const protectedRoute = isProtectedPath(pathname);

  if (protectedRoute) {
    if (!session) {
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
    return NextResponse.redirect(
      new URL(getDashboardPathForRole(session.role), request.url)
    );
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
