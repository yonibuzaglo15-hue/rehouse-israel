import type { Agent } from "@/lib/types";

export interface AgentProfile extends Agent {
  userId: string;
  role: "agent" | "admin" | "dev";
  updatedAt: string;
}

export type AgentProfileUpdate = Partial<
  Pick<
    AgentProfile,
    | "name"
    | "title"
    | "specialization"
    | "description"
    | "image"
    | "phone"
    | "email"
    | "whatsapp"
    | "telegram"
    | "instagram"
    | "facebook"
    | "calendarUrl"
  >
>;
