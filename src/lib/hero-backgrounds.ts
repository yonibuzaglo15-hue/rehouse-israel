import type { City } from "@/lib/types";
import { BRAND } from "@/lib/brand";

export interface HeroBackgroundSet {
  light: string;
  dark: string;
}

const DEFAULT_BACKGROUNDS: HeroBackgroundSet = {
  light: BRAND.heroBgLightSrc,
  dark: BRAND.heroBgSrc,
};

const CITY_BACKGROUNDS: Partial<Record<City, HeroBackgroundSet>> = {
  yavne: {
    light: BRAND.yavneHeroLightSrc,
    dark: BRAND.yavneHeroDarkSrc,
  },
  "gan-yavne": {
    light: BRAND.ganYavneHeroLightSrc,
    dark: BRAND.ganYavneHeroDarkSrc,
  },
  ashkelon: {
    light: BRAND.ashkelonHeroLightSrc,
    dark: BRAND.ashkelonHeroDarkSrc,
  },
};

/** Ashdod + empty selection use the default hero pair. */
export function getHeroBackgrounds(city: City | ""): HeroBackgroundSet {
  if (!city || city === "ashdod") {
    return DEFAULT_BACKGROUNDS;
  }

  return CITY_BACKGROUNDS[city] ?? DEFAULT_BACKGROUNDS;
}
