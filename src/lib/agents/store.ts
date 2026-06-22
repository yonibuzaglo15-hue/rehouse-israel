import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { SYSTEM_USERS } from "@/lib/auth/users";
import { agentImage } from "@/lib/images";
import { emailToAgentSlug, resolveAgentImageUrl } from "./resolve-image";
import type { AgentProfile, AgentProfileUpdate } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "agent-profiles.json");

function defaultProfileFromUser(user: (typeof SYSTEM_USERS)[number]): AgentProfile {
  const slug = user.email.split("@")[0].replace(/\./g, "-");
  return {
    userId: user.id,
    id: user.id,
    role: user.role,
    name: user.fullName,
    title: user.role === "agent" ? "סוכן נדל״ן" : user.role === "admin" ? "בעלים" : "מפתח",
    specialization: "אשדוד · אשקלון · יבנה · גן יבנה",
    description: `${user.fullName} — נדל״ן יוקרה עם Rehouse Israel.`,
    image: agentImage(slug),
    phone: "0500000000",
    email: user.email,
    whatsapp: "972500000000",
    telegram: slug,
    instagram: slug,
    facebook: slug,
    updatedAt: new Date().toISOString(),
  };
}

function withResolvedImage(profile: AgentProfile): AgentProfile {
  const slug = emailToAgentSlug(profile.email);
  return {
    ...profile,
    image: resolveAgentImageUrl(slug, profile.image),
  };
}

async function ensureProfiles(): Promise<AgentProfile[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as AgentProfile[];
  } catch {
    const seed = SYSTEM_USERS.map(defaultProfileFromUser);
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
    return seed;
  }
}

async function writeProfiles(profiles: AgentProfile[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(profiles, null, 2), "utf8");
}

export async function listAgentProfiles(): Promise<AgentProfile[]> {
  return ensureProfiles();
}

export async function listPublicAgents(): Promise<AgentProfile[]> {
  const profiles = await ensureProfiles();
  return profiles.filter((p) => p.role === "agent").map(withResolvedImage);
}

export async function listCompanyOwners(): Promise<AgentProfile[]> {
  const profiles = await ensureProfiles();
  return profiles.filter((p) => p.role === "admin").map(withResolvedImage);
}

const SENIOR_CONSULTANT_IDS = new Set(["usr_yonatan_buzaglo"]);

export async function listSeniorConsultants(): Promise<AgentProfile[]> {
  const profiles = await ensureProfiles();
  return profiles
    .filter((p) => SENIOR_CONSULTANT_IDS.has(p.id))
    .map(withResolvedImage);
}

export async function getAgentProfileById(id: string): Promise<AgentProfile | null> {
  const profiles = await ensureProfiles();
  const profile = profiles.find((p) => p.id === id || p.userId === id) ?? null;
  return profile ? withResolvedImage(profile) : null;
}

export async function updateAgentProfile(
  id: string,
  updates: AgentProfileUpdate
): Promise<AgentProfile | null> {
  const profiles = await ensureProfiles();
  const index = profiles.findIndex((p) => p.id === id || p.userId === id);
  if (index === -1) return null;

  const next: AgentProfile = {
    ...profiles[index],
    ...updates,
    id: profiles[index].id,
    userId: profiles[index].userId,
    role: profiles[index].role,
    updatedAt: new Date().toISOString(),
  };

  profiles[index] = next;
  await writeProfiles(profiles);
  return next;
}

export { defaultProfileFromUser };
