import type { Permission, SystemRole } from "./types";

export const ROLE_LABELS: Record<SystemRole, string> = {
  dev: "מפתח (Dev)",
  admin: "מנהל (Admin)",
  agent: "סוכן (Agent)",
};

export const ROLE_PERMISSIONS: Record<SystemRole, readonly Permission[]> = {
  dev: [
    "system.settings",
    "users.manage",
    "logs.view",
    "dashboard.technical",
    "properties.manage.all",
    "properties.approve",
    "properties.create",
    "properties.edit.own",
    "agents.view",
    "agents.edit",
  ],
  admin: [
    "properties.manage.all",
    "properties.approve",
    "properties.create",
    "properties.edit.own",
    "agents.view",
    "agents.edit",
  ],
  agent: ["properties.create", "properties.edit.own"],
};

export function hasPermission(role: SystemRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canManageUsers(role: SystemRole): boolean {
  return hasPermission(role, "users.manage");
}

export function canManageAllProperties(role: SystemRole): boolean {
  return hasPermission(role, "properties.manage.all");
}

export function canApproveProperties(role: SystemRole): boolean {
  return hasPermission(role, "properties.approve");
}

export function canEditProperty(
  role: SystemRole,
  propertyOwnerId: string,
  userId: string
): boolean {
  if (canManageAllProperties(role)) return true;
  return hasPermission(role, "properties.edit.own") && propertyOwnerId === userId;
}

export function isRoleAtLeast(role: SystemRole, minimum: SystemRole): boolean {
  const rank: Record<SystemRole, number> = { agent: 1, admin: 2, dev: 3 };
  return rank[role] >= rank[minimum];
}
