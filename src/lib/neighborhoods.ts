import type { City } from "@/lib/types";

export interface NeighborhoodZone {
  zoneLabel: string;
  neighborhoods: readonly string[];
}

export const CITY_NEIGHBORHOOD_ZONES: Record<City, readonly NeighborhoodZone[]> = {
  ashdod: [
    {
      zoneLabel: "רובעי אשדוד",
      neighborhoods: [
        "רובע א׳",
        "רובע ב׳",
        "רובע ג׳",
        "רובע ד׳",
        "רובע ה׳",
        "רובע ו׳",
        "רובע ז׳",
        "רובע ח׳",
        "רובע ט׳",
        "רובע י׳",
        "רובע י״א",
        "רובע י״ב",
        "רובע י״ג",
        "רובע ט״ו",
        "רובע ט״ז",
        "רובע י״ז",
        "רובע סיטי הקרייה",
        "מע״ר דרום",
        "מרינה",
        "אזה״ת צפוני",
        "אזה״ת דרומי - עד הלום",
      ],
    },
  ],
  ashkelon: [
    {
      zoneLabel: "צפון העיר",
      neighborhoods: [
        "עיר ימים",
        "עיר היין",
        "ברנע",
        "כוכב הצפון",
      ],
    },
    {
      zoneLabel: "מרכז העיר",
      neighborhoods: [
        "גבעת ציון",
        "רמת אשכול",
        "העיר העתיקה (המגדל)",
        "נווה דקלים",
      ],
    },
    {
      zoneLabel: "דרום העיר",
      neighborhoods: [
        "אגמים",
        "שמשון",
        "בן גוריון",
        "נאות אשקלון",
        "עתיקות (א׳)",
        "עתיקות (ב׳)",
        "עתיקות (ג׳)",
        "עתיקות (ד׳)",
      ],
    },
  ],
  yavne: [
    {
      zoneLabel: "שכונות חדשות (צפון ומזרח)",
      neighborhoods: [
        "נאות שמיר (יבנה הירוקה - מערב)",
        "נאות רבין (יבנה הירוקה - מזרח)",
        "נאות בגין",
      ],
    },
    {
      zoneLabel: "שכונות ותיקות (מרכז ודרום)",
      neighborhoods: [
        "נווה אילן",
        "נאות בן גוריון",
        "נאות אשכול",
        "נאות שז״ר",
      ],
    },
    {
      zoneLabel: "אזור תעשייה",
      neighborhoods: ["אזור התעשייה (יבנה צפון)"],
    },
  ],
  "gan-yavne": [
    {
      zoneLabel: "שכונות ואזורים",
      neighborhoods: [
        "שכונת המכבים",
        "שיכון עובדים",
        "גבעת אביב",
        "נאות גן יבנה",
        "המרכז הוותיק",
        "אזורי ההרחבות",
      ],
    },
  ],
};

const VALID_CITIES: City[] = ["ashdod", "ashkelon", "yavne", "gan-yavne"];

export function getNeighborhoodZones(city: City): readonly NeighborhoodZone[] {
  return CITY_NEIGHBORHOOD_ZONES[city];
}

export function getFlatNeighborhoods(city: City): string[] {
  return CITY_NEIGHBORHOOD_ZONES[city].flatMap((zone) => [...zone.neighborhoods]);
}

export function isValidNeighborhood(city: City, neighborhood: string): boolean {
  return getFlatNeighborhoods(city).includes(neighborhood);
}

export function isCity(value: string): value is City {
  return VALID_CITIES.includes(value as City);
}

export function getNeighborhoodFieldLabel(city: City | ""): string {
  return city === "ashdod" ? "רובע" : "שכונה / אזור";
}
