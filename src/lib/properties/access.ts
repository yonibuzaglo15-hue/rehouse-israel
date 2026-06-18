import type { SessionPayload } from "@/lib/auth/session";
import { canManageAllProperties } from "@/lib/auth/permissions";
import type { ManagedProperty } from "./types";

export function filterPropertiesForSession(
  properties: ManagedProperty[],
  session: SessionPayload
): ManagedProperty[] {
  if (session.role === "dev" || session.role === "admin") {
    return properties;
  }
  return properties.filter(
    (property) => property.agentEmail.toLowerCase() === session.email.toLowerCase()
  );
}

export function canEditManagedProperty(
  property: ManagedProperty,
  session: SessionPayload
): boolean {
  if (session.role === "dev" || session.role === "admin") return true;
  return property.agentEmail.toLowerCase() === session.email.toLowerCase();
}

export function getPropertiesListTitle(role: SessionPayload["role"]): string {
  return role === "dev" || role === "admin" ? "נכסי המשרד" : "הנכסים שלי";
}

/** Admin/Dev inline editing on the public catalog */
export function canEditCatalogProperty(session: SessionPayload): boolean {
  return canManageAllProperties(session.role);
}
