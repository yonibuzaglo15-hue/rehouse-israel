import type { SystemRole } from "./types";
import { isRoleAtLeast } from "./permissions";

/** Role-specific home dashboard after login */
export const ROLE_DASHBOARD_PATHS: Record<SystemRole, string> = {
  dev: "/dev",
  admin: "/admin",
  agent: "/agent-dashboard",
};

export function getDashboardPathForRole(role: SystemRole): string {
  return ROLE_DASHBOARD_PATHS[role];
}

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/dev",
  "/admin",
  "/agent-dashboard",
] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Minimum role required to access a path segment */
export function canAccessPath(role: SystemRole, pathname: string): boolean {
  if (pathname.startsWith("/dev")) {
    return role === "dev";
  }
  if (pathname.startsWith("/admin")) {
    return isRoleAtLeast(role, "admin");
  }
  if (pathname.startsWith("/agent-dashboard") || pathname.startsWith("/dashboard")) {
    return isRoleAtLeast(role, "agent");
  }
  return true;
}

export function getRoleLabelShort(role: SystemRole): string {
  const labels: Record<SystemRole, string> = {
    dev: "מפתח",
    admin: "מנהל",
    agent: "סוכן",
  };
  return labels[role];
}
