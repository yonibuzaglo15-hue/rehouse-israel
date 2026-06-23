/** Official Rehouse Israel brand assets and copy */
export const BRAND = {
  /** Gold emblem + REHOUSE — transparent PNG (header, hero, footer) */
  heroLogoSrc: "/assets/rehouse-logo-transparent.png",
  /** @deprecated Use heroLogoSrc — kept for backward compatibility */
  logoSrc: "/assets/rehouse-logo-transparent.png",
  heroBgSrc: "/assets/hero-bg.jpg",
  heroBgLightSrc: "/assets/hero-bg-light.jpg",
  yavneHeroLightSrc: "/assets/yavne-hero-light.jpg",
  yavneHeroDarkSrc: "/assets/yavne-hero-dark.jpg",
  ganYavneHeroLightSrc: "/assets/ganyavne-hero-light.jpg",
  ganYavneHeroDarkSrc: "/assets/ganyavne-hero-dark.jpg",
  ashkelonHeroLightSrc: "/assets/ashkelon-hero-light.jpg",
  ashkelonHeroDarkSrc: "/assets/ashkelon-hero-dark.jpg",
  nameHe: "ריהאוס ישראל",
  nameEn: "REHOUSE",
  tagline: "international real estate and realty investment company",
  social: {
    facebook: "https://facebook.com/rehouseisrael",
    instagram: "https://instagram.com/rehouseisrael",
    youtube: "https://youtube.com/@rehouseisrael",
    whatsapp: "https://wa.me/972501234567",
  },
} as const;

export const LOGO_DIMENSIONS = {
  width: 512,
  height: 512,
} as const;

/** Cropped transparent hero logo natural size (globe + REHOUSE horizontal) */
export const HERO_LOGO_DIMENSIONS = {
  width: 1198,
  height: 687,
} as const;
