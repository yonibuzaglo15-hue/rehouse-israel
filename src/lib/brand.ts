/** Official Rehouse Israel brand assets and copy */

/** Header / footer / favicon — transparent PNG */
export const HEADER_LOGO_SRC = "/assets/rehouse-logo-transparent.png";

/** Homepage hero center overlay — transparent gold logo (no solid background) */
export const HERO_FRONT_LOGO_SRC = "/assets/rehouse-logo-transparent.png";

export const BRAND = {
  heroLogoSrc: HEADER_LOGO_SRC,
  heroFrontLogoSrc: HERO_FRONT_LOGO_SRC,
  /** @deprecated Use heroLogoSrc */
  logoSrc: HEADER_LOGO_SRC,
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
    facebook: "https://www.facebook.com/rehouse.isr",
    instagram: "https://www.instagram.com/rehouse_int",
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
