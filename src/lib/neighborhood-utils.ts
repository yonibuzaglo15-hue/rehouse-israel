/** Canonical Ashdod quarter labels — must match `neighborhoods.ts` dropdown values */

const ROVA_ALIASES: Record<string, string> = {
  א: "רובע א׳",
  "א'": "רובע א׳",
  "א׳": "רובע א׳",
  ב: "רובע ב׳",
  "ב'": "רובע ב׳",
  "ב׳": "רובע ב׳",
  ג: "רובע ג׳",
  "ג'": "רובע ג׳",
  "ג׳": "רובע ג׳",
  ד: "רובע ד׳",
  "ד'": "רובע ד׳",
  "ד׳": "רובע ד׳",
  ה: "רובע ה׳",
  "ה'": "רובע ה׳",
  "ה׳": "רובע ה׳",
  ו: "רובע ו׳",
  "ו'": "רובע ו׳",
  "ו׳": "רובע ו׳",
  ז: "רובע ז׳",
  "ז'": "רובע ז׳",
  "ז׳": "רובע ז׳",
  ח: "רובע ח׳",
  "ח'": "רובע ח׳",
  "ח׳": "רובע ח׳",
  ט: "רובע ט׳",
  "ט'": "רובע ט׳",
  "ט׳": "רובע ט׳",
  י: "רובע י׳",
  "י'": "רובע י׳",
  "י׳": "רובע י׳",
  יא: "רובע י״א",
  "י\"א": "רובע י״א",
  "י״א": "רובע י״א",
  יב: "רובע י״ב",
  "י\"ב": "רובע י״ב",
  "י״ב": "רובע י״ב",
  יג: "רובע י״ג",
  "י\"ג": "רובע י״ג",
  "י״ג": "רובע י״ג",
  טו: "רובע ט״ו",
  "ט\"ו": "רובע ט״ו",
  "ט״ו": "רובע ט״ו",
  טז: "רובע ט״ז",
  "ט\"ז": "רובע ט״ז",
  "ט״ז": "רובע ט״ז",
  יז: "רובע י״ז",
  "י\"ז": "רובע י״ז",
  "י״ז": "רובע י״ז",
  סיטי: "רובע סיטי הקרייה",
  הסיטי: "רובע סיטי הקרייה",
  "רובע הסיטי": "רובע סיטי הקרייה",
  המרינה: "מרינה",
  מרינה: "מרינה",
};

/** Hard overrides for known bad sheet column values (column letter ≠ actual quarter) */
const ADDRESS_NEIGHBORHOOD_OVERRIDES: Record<string, string> = {
  "ירבעם המלך 12": "רובע י״ג",
  "ירבעם המלך": "רובע י״ג",
  'רמב"ם 8': "רובע י״א",
  "רמבם 8": "רובע י״א",
  'הרב הרצוג 3': "רובע י״ב",
  "הרב קוק": "רובע י״א",
};

function stripQuotes(value: string): string {
  return value.replace(/["״''`]/g, "").trim();
}

export function extractQuarterFromText(text: string): string | null {
  const match = text.match(/רובע\s*([^,\n]+)/i);
  if (!match?.[1]) return null;

  const fragment = stripQuotes(match[1].trim());
  if (ROVA_ALIASES[fragment]) return ROVA_ALIASES[fragment];

  const withPrefix = fragment.startsWith("רובע") ? fragment : `רובע ${fragment}`;
  return canonicalNeighborhood(withPrefix);
}

export function canonicalNeighborhood(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const override = ADDRESS_NEIGHBORHOOD_OVERRIDES[trimmed];
  if (override) return override;

  if (trimmed.startsWith("רובע")) {
    const suffix = stripQuotes(trimmed.replace(/^רובע\s*/i, ""));
    if (ROVA_ALIASES[suffix]) return ROVA_ALIASES[suffix];
    return `רובע ${suffix.replace(/"/g, "״")}`;
  }

  if (ROVA_ALIASES[trimmed]) return ROVA_ALIASES[trimmed];
  if (ROVA_ALIASES[stripQuotes(trimmed)]) return ROVA_ALIASES[stripQuotes(trimmed)];

  return trimmed;
}

export function resolvePropertyNeighborhood(
  columnValue: string,
  notes: string,
  address?: string
): string {
  if (address) {
    const addressOverride = ADDRESS_NEIGHBORHOOD_OVERRIDES[address.trim()];
    if (addressOverride) return addressOverride;
  }

  const fromNotes = extractQuarterFromText(notes);
  if (fromNotes) return fromNotes;

  return canonicalNeighborhood(columnValue);
}

export function neighborhoodsMatch(filterValue: string, propertyValue: string): boolean {
  return canonicalNeighborhood(filterValue) === canonicalNeighborhood(propertyValue);
}
