import type { City } from "@/lib/types";

export interface KnownPropertyMedia {
  driveFolderId?: string;
  matterportId?: string;
  matterportUrl?: string;
}

function normalizeAddressKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\u0590-\u05FFa-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Prestige / VISIO portfolio — Matterport + public Drive folders when known */
const KNOWN_MEDIA: Record<string, KnownPropertyMedia> = {
  [normalizeAddressKey("נחל שניר 21")]: {
    matterportId: "cEtmuBEsSNq",
    matterportUrl: "https://my.matterport.com/show/?m=cEtmuBEsSNq",
  },
  [normalizeAddressKey("אריה בן אליעזר 14")]: {
    driveFolderId: "1IDNOAdEnbmNogFHRR6rHkTfRCB2YO4BS",
  },
  [normalizeAddressKey("שבט לוי 1")]: {
    driveFolderId: "1ERe2XMwaniVKNlJXTL3XWrN4n6x4Xsgc",
    matterportId: "g1C8Upb3G6q",
    matterportUrl: "https://my.matterport.com/show/?m=g1C8Upb3G6q",
  },
  [normalizeAddressKey("שבט לוי")]: {
    driveFolderId: "1ERe2XMwaniVKNlJXTL3XWrN4n6x4Xsgc",
  },
  [normalizeAddressKey("דקר 72")]: {
    matterportId: "ooDYEMx6TCr",
    matterportUrl: "https://my.matterport.com/show/?m=ooDYEMx6TCr",
  },
  [normalizeAddressKey("בלפור 7")]: {
    matterportId: "9YJGFmX8KbJ",
    matterportUrl: "https://my.matterport.com/show/?m=9YJGFmX8KbJ",
  },
  [normalizeAddressKey("הפטל 17")]: {
    matterportId: "AF18oBWVfrm",
    matterportUrl: "https://my.matterport.com/show/?m=AF18oBWVfrm",
  },
  [normalizeAddressKey("המשוט 8")]: {
    matterportId: "C6Uvbihrqvm",
    matterportUrl: "https://my.matterport.com/show/?m=C6Uvbihrqvm",
  },
};

function buildLookupKeys(street?: string, houseNumber?: string, title?: string): string[] {
  const keys = new Set<string>();
  const full = [street, houseNumber].filter(Boolean).join(" ").trim();
  if (full) keys.add(normalizeAddressKey(full));
  if (street) keys.add(normalizeAddressKey(street));
  if (title) keys.add(normalizeAddressKey(title));
  return [...keys];
}

export function resolveKnownPropertyMedia(input: {
  street?: string;
  houseNumber?: string;
  title?: string;
}): KnownPropertyMedia | null {
  for (const key of buildLookupKeys(input.street, input.houseNumber, input.title)) {
    const hit = KNOWN_MEDIA[key];
    if (hit) return hit;
  }

  return null;
}

export function matterportUrlFromId(id: string): string {
  return `https://my.matterport.com/show/?m=${id}`;
}

export function buildPropertyPathSlug(
  city: City,
  street?: string,
  houseNumber?: string
): string {
  const slug = [street, houseNumber]
    .filter(Boolean)
    .join("-")
    .replace(/[^\u0590-\u05FFa-zA-Z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return slug || city;
}
