/**
 * Central image config — swap to local paths when real assets are provided.
 */

const UNSPLASH = "https://images.unsplash.com";

/** Premium portrait placeholder when a local agent asset is not committed yet */
export const AGENT_PLACEHOLDER = `${UNSPLASH}/photo-1560250097-0b93528c311a?w=800&q=80`;

/** Preferred public paths; committed files may use .png variants */
const AGENT_IMAGE_PATHS: Record<string, readonly string[]> = {
  yonatan: [
    "/images/agents/yonatan.jpg",
    "/images/agents/yonatan-buzaglo.png",
  ],
  igor: ["/images/agents/igor.jpg", "/images/agents/igor-hanin.png"],
  alon: ["/images/agents/alon.jpg", "/images/agents/alon-hanin.png"],
  "yonatan-buzaglo": ["/images/agents/yonatan-buzaglo.png"],
  "igor-hanin": ["/images/agents/igor-hanin.png"],
  "alon-hanin": ["/images/agents/alon-hanin.png"],
  elin: ["/images/agents/elin-smirnov.png"],
  "elin-smirnov": ["/images/agents/elin-smirnov.png"],
};

export const IMAGES = {
  hero: {
    poster: "/assets/hero-bg.jpg",
    posterLow: "/assets/hero-bg.jpg",
    video: "/videos/rehouse-hero-gemini.mp4",
    logoOverlay: "/videos/rehouse-logo-overlay-v2.mp4",
    fallback: `${UNSPLASH}/photo-1613490493576-7fde63acd811?w=1920&q=80`,
  },
  logo: "/assets/rehouse-logo-transparent.png",
  properties: [
    `${UNSPLASH}/photo-1600596542815-ffad4c1539a9?w=800&q=80`,
    `${UNSPLASH}/photo-1600585154340-be6161a56a0c?w=800&q=80`,
    `${UNSPLASH}/photo-1600607687939-ce8a6c25118c?w=800&q=80`,
    `${UNSPLASH}/photo-1600566753190-17fedebaa25a?w=800&q=80`,
    `${UNSPLASH}/photo-1600573472592-401b489a3cdc?w=800&q=80`,
    `${UNSPLASH}/photo-1613490493576-7fde63acd811?w=800&q=80`,
    `${UNSPLASH}/photo-1600047509807-ba8f99d2cdde?w=800&q=80`,
    `${UNSPLASH}/photo-1600210492493-0946911127ea?w=800&q=80`,
    `${UNSPLASH}/photo-1600585154526-990dced4db0d?w=800&q=80`,
  ],
  agents: {
    yonatan: "/images/agents/yonatan-buzaglo.png",
    igor: "/images/agents/igor-hanin.png",
    alon: "/images/agents/alon-hanin.png",
    "yonatan-buzaglo": "/images/agents/yonatan-buzaglo.png",
    "igor-hanin": "/images/agents/igor-hanin.png",
    "alon-hanin": "/images/agents/alon-hanin.png",
    elin: "/images/agents/elin-smirnov.png",
    danny: `${UNSPLASH}/photo-1560250097-0b93528c311a?w=600&q=80`,
    michal: `${UNSPLASH}/photo-1573496359142-b8d87734a5a2?w=600&q=80`,
    yossi: `${UNSPLASH}/photo-1472099645785-5658abf4ff4e?w=600&q=80`,
    noa: `${UNSPLASH}/photo-1580489944761-15a19d654956?w=600&q=80`,
  },
} as const;

export function agentImage(slug: string): string {
  const key = slug as keyof typeof IMAGES.agents;
  if (key in IMAGES.agents) return IMAGES.agents[key];
  const paths = AGENT_IMAGE_PATHS[slug];
  if (paths?.length) return paths[0];
  return AGENT_PLACEHOLDER;
}

export function agentImageCandidates(slug: string): string[] {
  const normalized = slug.replace(/^usr_/, "").replace(/_/g, "-");

  const alias =
    normalized.startsWith("yonatan")
      ? "yonatan"
      : normalized.startsWith("igor")
        ? "igor"
        : normalized.startsWith("alon")
          ? "alon"
          : normalized;

  const paths = AGENT_IMAGE_PATHS[alias] ?? AGENT_IMAGE_PATHS[normalized];
  if (paths?.length) return [...paths];

  const key = alias as keyof typeof IMAGES.agents;
  if (key in IMAGES.agents) return [IMAGES.agents[key]];

  const fallbackKey = normalized as keyof typeof IMAGES.agents;
  if (fallbackKey in IMAGES.agents) return [IMAGES.agents[fallbackKey]];

  return [AGENT_PLACEHOLDER];
}

export function propertyImage(index: number): string {
  return IMAGES.properties[index % IMAGES.properties.length];
}
