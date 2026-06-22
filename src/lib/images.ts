/**
 * Central image config — swap to local paths when real assets are provided.
 * Example: agentImage("danny") → "/images/agents/danny.jpg"
 */

const UNSPLASH = "https://images.unsplash.com";

/** Premium portrait placeholder when a local agent asset is not committed yet */
export const AGENT_PLACEHOLDER = `${UNSPLASH}/photo-1560250097-0b93528c311a?w=800&q=80`;

export const IMAGES = {
  hero: {
    poster: `${UNSPLASH}/photo-1600596542815-ffad4c1539a9?w=1920&q=80`,
    posterLow: `${UNSPLASH}/photo-1600596542815-ffad4c1539a9?w=640&q=60`,
    video: "/videos/rehouse-hero-gemini.mp4",
    logoOverlay: "/videos/rehouse-logo-overlay-v2.mp4",
    fallback: `${UNSPLASH}/photo-1613490493576-7fde63acd811?w=1920&q=80`,
  },
  logo: "/images/logo.png",
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
    elin: "/images/agents/elin-smirnov.png",
    "igor-hanin": "/images/agents/igor-hanin.png",
    "alon-hanin": "/images/agents/alon-hanin.png",
    "yonatan-buzaglo": "/images/agents/yonatan-buzaglo.png",
    danny: `${UNSPLASH}/photo-1560250097-0b93528c311a?w=600&q=80`,
    michal: `${UNSPLASH}/photo-1573496359142-b8d87734a5a2?w=600&q=80`,
    yossi: `${UNSPLASH}/photo-1472099645785-5658abf4ff4e?w=600&q=80`,
    noa: `${UNSPLASH}/photo-1580489944761-15a19d654956?w=600&q=80`,
  },
} as const;

export function agentImage(slug: string): string {
  const key = slug as keyof typeof IMAGES.agents;
  if (key in IMAGES.agents) return IMAGES.agents[key];
  return AGENT_PLACEHOLDER;
}

export function propertyImage(index: number): string {
  return IMAGES.properties[index % IMAGES.properties.length];
}
