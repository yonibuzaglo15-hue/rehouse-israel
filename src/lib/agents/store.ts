import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { SYSTEM_USERS } from "@/lib/auth/users";
import { agentImage } from "@/lib/images";
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
    title: user.role === "agent" ? "סוכן נדל״ן" : user.role === "admin" ? "מנהל" : "מפתח",
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
  return profiles.filter((p) => p.role === "agent");
}

export async function getAgentProfileById(id: string): Promise<AgentProfile | null> {
  const profiles = await ensureProfiles();
  return profiles.find((p) => p.id === id || p.userId === id) ?? null;
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
