import "server-only";

import type { PropertyImportRow } from "@/lib/properties/catalog-schema";
import { SYSTEM_USERS } from "@/lib/auth/users";
import { listAgentProfiles, updateAgentProfile } from "@/lib/agents/store";
import type { AgentProfileUpdate } from "@/lib/agents/types";

const AGENT_FIELD_ALIASES: Record<string, keyof AgentProfileUpdate | "email" | "userId"> = {
  email: "email",
  "אימייל": "email",
  "דוא״ל": "email",
  "דואל": "email",
  name: "name",
  "שם": "name",
  "שם מלא": "name",
  title: "title",
  "תפקיד": "title",
  phone: "phone",
  "טלפון": "phone",
  whatsapp: "whatsapp",
  "וואטסאפ": "whatsapp",
  instagram: "instagram",
  "אינסטגרם": "instagram",
  facebook: "facebook",
  "פייסבוק": "facebook",
  specialization: "specialization",
  "התמחות": "specialization",
  description: "description",
  "תיאור": "description",
  calendarurl: "calendarUrl",
  "יומן": "calendarUrl",
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function rowToAgentUpdate(row: PropertyImportRow): AgentProfileUpdate & { email?: string } {
  const update: AgentProfileUpdate & { email?: string } = {};

  for (const [header, rawValue] of Object.entries(row)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    const field = AGENT_FIELD_ALIASES[normalizeHeader(header)];
    if (!field) continue;
    (update as Record<string, string>)[field] = String(rawValue).trim();
  }

  return update;
}

export interface AgentSyncResult {
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export async function syncAgentsFromSheetRows(
  rows: PropertyImportRow[]
): Promise<AgentSyncResult> {
  const result: AgentSyncResult = { updated: 0, skipped: 0, errors: [] };
  const profiles = await listAgentProfiles();

  for (let i = 0; i < rows.length; i++) {
    const update = rowToAgentUpdate(rows[i]);
    const email = update.email?.trim().toLowerCase();

    if (!email) {
      result.skipped++;
      continue;
    }

    const systemUser = SYSTEM_USERS.find((user) => user.email.toLowerCase() === email);
    const profile = profiles.find((entry) => entry.email.toLowerCase() === email);

    if (!profile) {
      result.errors.push({ row: i + 1, message: `סוכן לא נמצא במערכת: ${email}` });
      result.skipped++;
      continue;
    }

    const { email: _email, ...profileUpdate } = update;
    const next = await updateAgentProfile(profile.id, {
      ...profileUpdate,
      name: profileUpdate.name ?? (systemUser?.fullName || profile.name),
    });

    if (next) result.updated++;
    else {
      result.errors.push({ row: i + 1, message: `עדכון נכשל עבור ${email}` });
      result.skipped++;
    }
  }

  return result;
}
