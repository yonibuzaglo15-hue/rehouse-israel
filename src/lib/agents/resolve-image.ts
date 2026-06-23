import { agentImage, agentImageCandidates } from "@/lib/images";

/** Slugs with committed files under public/images/agents/ */
export const LOCAL_AGENT_IMAGE_SLUGS = new Set([
  "yonatan",
  "igor",
  "alon",
  "igor-hanin",
  "alon-hanin",
  "yonatan-buzaglo",
  "elin",
  "elin-smirnov",
]);

export function emailToAgentSlug(email: string): string {
  return email.split("@")[0].replace(/\./g, "-");
}

export function resolveAgentImageUrl(slug: string, storedPath?: string): string {
  if (LOCAL_AGENT_IMAGE_SLUGS.has(slug)) {
    return agentImage(slug);
  }

  if (storedPath?.startsWith("http")) {
    return storedPath;
  }

  if (storedPath?.startsWith("/images/agents/")) {
    return storedPath;
  }

  return agentImage(slug);
}

export { agentImageCandidates };
