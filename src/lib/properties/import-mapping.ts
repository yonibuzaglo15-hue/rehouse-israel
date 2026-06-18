import type { City, ListingType } from "@/lib/types";
import type { PropertyStatus } from "./types";
import { isCity } from "./neighborhoods";
import { canonicalNeighborhood } from "@/lib/neighborhood-utils";
import type {
  CatalogProperty,
  CatalogPropertyInput,
  PropertyAttributeValue,
  PropertyImportRow,
} from "./catalog-schema";
import { buildCatalogPropertyInput, createEmptyCatalogProperty } from "./catalog-schema";

/** Core fields — extend when Google Sheets column names are provided */
export type CoreFieldKey =
  | "id"
  | "externalId"
  | "title"
  | "description"
  | "listingType"
  | "city"
  | "neighborhood"
  | "price"
  | "rooms"
  | "area"
  | "floor"
  | "totalFloors"
  | "mamad"
  | "balcony"
  | "parking"
  | "elevator"
  | "storage"
  | "street"
  | "houseNumber"
  | "images"
  | "videoUrl"
  | "matterportUrl"
  | "featured"
  | "status"
  | "published"
  | "agentEmail"
  | "agentName";

/**
 * Column header aliases (Hebrew + English).
 * Unmapped columns are stored under `attributes` using the original header name.
 */
export const CORE_FIELD_ALIASES: Record<string, CoreFieldKey> = {
  id: "id",
  "מזהה": "id",
  "קוד נכס": "externalId",
  externalid: "externalId",
  "מזהה חיצוני": "externalId",
  title: "title",
  "כותרת": "title",
  "שם הנכס": "title",
  description: "description",
  "תיאור": "description",
  listingtype: "listingType",
  "סוג עסקה": "listingType",
  "מכירה/השכרה": "listingType",
  city: "city",
  "עיר": "city",
  neighborhood: "neighborhood",
  "שכונה": "neighborhood",
  "רובע": "neighborhood",
  "רובע/אזור": "neighborhood",
  "עם/בלי ממ\"ד": "mamad",
  "הערות": "description",
  "אזור": "neighborhood",
  price: "price",
  "מחיר": "price",
  "מחיר מבוקש": "price",
  askingprice: "price",
  rooms: "rooms",
  "חדרים": "rooms",
  "מספר חדרים": "rooms",
  "כמות חד'": "rooms",
  "כמות חדרים": "rooms",
  area: "area",
  "שטח": "area",
  'מ"ר': "area",
  "מ״ר": "area",
  floor: "floor",
  "קומה": "floor",
  totalfloors: "totalFloors",
  "קומות בבניין": "totalFloors",
  mamad: "mamad",
  'ממ"ד': "mamad",
  "ממ״ד": "mamad",
  balcony: "balcony",
  "מרפסת": "balcony",
  parking: "parking",
  "חניה": "parking",
  elevator: "elevator",
  "מעלית": "elevator",
  storage: "storage",
  "מחסן": "storage",
  street: "street",
  "רחוב": "street",
  housenumber: "houseNumber",
  "מספר בית": "houseNumber",
  "בית": "houseNumber",
  images: "images",
  "תמונות": "images",
  image: "images",
  "תמונה": "images",
  videourl: "videoUrl",
  "וידאו": "videoUrl",
  matterporturl: "matterportUrl",
  "מatterport": "matterportUrl",
  "סיור וירטואלי": "matterportUrl",
  "קישור לסיור": "matterportUrl",
  "קישור סיור": "matterportUrl",
  "קישור matterport": "matterportUrl",
  featured: "featured",
  "מומלץ": "featured",
  status: "status",
  "סטטוס": "status",
  published: "published",
  "מפורסם": "published",
  "פרסום": "published",
  agentemail: "agentEmail",
  "אימייל סוכן": "agentEmail",
  agentname: "agentName",
  "שם סוכן": "agentName",
  "סוכן": "agentName",
  "סוכן מטפל": "agentName",
  "כתובת": "street",
  "כתובת מלאה": "street",
  "מחיר ש״ח": "price",
  "מחיר שח": "price",
};

const CITY_LABELS: Record<string, City> = {
  ashdod: "ashdod",
  "אשדוד": "ashdod",
  ashkelon: "ashkelon",
  "אשקלון": "ashkelon",
  yavne: "yavne",
  "יבנה": "yavne",
  "gan-yavne": "gan-yavne",
  "gan yavne": "gan-yavne",
  "גן יבנה": "gan-yavne",
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function resolveCoreField(header: string): CoreFieldKey | null {
  const key = normalizeHeader(header);
  return CORE_FIELD_ALIASES[key] ?? CORE_FIELD_ALIASES[header.trim()] ?? null;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  return ["1", "true", "yes", "כן", "y", "v"].includes(s);
}

function parseFloorValue(value: unknown): { floor: number; totalFloors: number } {
  const raw = String(value ?? "").trim();
  if (!raw) return { floor: 0, totalFloors: 1 };

  const slashMatch = raw.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (slashMatch) {
    const floor = Number(slashMatch[1]);
    const totalFloors = Number(slashMatch[2]);
    return {
      floor: Number.isFinite(floor) ? floor : 0,
      totalFloors: Number.isFinite(totalFloors) && totalFloors > 0 ? totalFloors : 1,
    };
  }

  const floor = parseNumber(raw);
  return {
    floor: floor ?? 0,
    totalFloors: 1,
  };
}

function parseStreetAddress(raw: string): { street: string; houseNumber: string } {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(.+?)\s+(\d+[\w/-]*)$/);
  if (!match) {
    return { street: trimmed, houseNumber: "" };
  }
  return { street: match[1].trim(), houseNumber: match[2].trim() };
}

const MATTERPORT_URL_RE =
  /https?:\/\/(?:my\.)?matterport\.com\/[^\s,;|"'<>]+/i;

function extractMatterportUrl(
  row: PropertyImportRow,
  attributes: Record<string, PropertyAttributeValue>
): string {
  for (const value of Object.values(row)) {
    const text = String(value ?? "");
    const match = text.match(MATTERPORT_URL_RE);
    if (match) return match[0];
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (typeof value !== "string" || !value.trim()) continue;
    if (!/סיור|matterport|וירטואל/i.test(key) && !MATTERPORT_URL_RE.test(value)) {
      continue;
    }
    const match = value.match(MATTERPORT_URL_RE);
    if (match) return match[0];
  }

  return "";
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value ?? "")
    .replace(/[₪,\s]/g, "")
    .trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const s = String(value ?? "").trim();
  if (!s) return [];
  if (s.includes("|")) return s.split("|").map((x) => x.trim()).filter(Boolean);
  if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
  return [s];
}

function parseListingType(value: unknown): ListingType {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  if (["rent", "השכרה", "שכירות", "להשכרה"].includes(s)) return "rent";
  return "buy";
}

function parseCity(value: unknown): City | null {
  const s = String(value ?? "").trim();
  if (isCity(s)) return s;
  return CITY_LABELS[s.toLowerCase()] ?? CITY_LABELS[s] ?? null;
}

function parseStatus(value: unknown): PropertyStatus {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  const map: Record<string, PropertyStatus> = {
    active: "active",
    exclusive: "exclusive",
    frozen: "frozen",
    sold: "sold",
    "פעיל": "active",
    "בלעדי": "exclusive",
    "מוקפא": "frozen",
    "נמכר": "sold",
  };
  return map[s] ?? "active";
}

function toAttributeValue(value: unknown): PropertyAttributeValue {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value)) return value.map(String);
  const s = String(value).trim();
  if (s === "true" || s === "false") return s === "true";
  const n = parseNumber(s);
  if (n !== null && String(n) === s.replace(/,/g, "")) return n;
  return s;
}

export function mapImportRowToCatalogInput(
  row: PropertyImportRow,
  rowIndex: number
): { success: true; data: CatalogPropertyInput } | { success: false; error: string } {
  const attributes: Record<string, PropertyAttributeValue> = {};
  const core: Partial<CatalogPropertyInput> = { attributes };

  for (const [header, rawValue] of Object.entries(row)) {
    if (rawValue === undefined || rawValue === null || rawValue === "") continue;
    const field = resolveCoreField(header);
    if (!field) {
      attributes[header.trim()] = toAttributeValue(rawValue);
      continue;
    }

    switch (field) {
      case "id":
        core.id = String(rawValue).trim();
        break;
      case "externalId":
        core.externalId = String(rawValue).trim();
        break;
      case "title":
        core.title = String(rawValue).trim();
        break;
      case "description":
        core.description = String(rawValue).trim();
        break;
      case "listingType":
        core.listingType = parseListingType(rawValue);
        break;
      case "city": {
        const city = parseCity(rawValue);
        if (!city) {
          return { success: false, error: `שורה ${rowIndex + 1}: עיר לא תקינה (${String(rawValue)})` };
        }
        core.city = city;
        break;
      }
      case "neighborhood":
        core.neighborhood = canonicalNeighborhood(String(rawValue).trim());
        break;
      case "price": {
        const price = parseNumber(rawValue);
        if (price === null || price <= 0) {
          return { success: false, error: `שורה ${rowIndex + 1}: מחיר לא תקין` };
        }
        core.price = price;
        break;
      }
      case "rooms": {
        const rooms = parseNumber(rawValue);
        if (rooms === null || rooms < 1) {
          return { success: false, error: `שורה ${rowIndex + 1}: מספר חדרים לא תקין` };
        }
        core.rooms = rooms;
        break;
      }
      case "area": {
        const area = parseNumber(rawValue);
        core.area = area ?? 0;
        break;
      }
      case "floor": {
        const parsedFloor = parseFloorValue(rawValue);
        core.floor = parsedFloor.floor;
        core.totalFloors = parsedFloor.totalFloors;
        break;
      }
      case "totalFloors": {
        const totalFloors = parseNumber(rawValue);
        core.totalFloors = totalFloors && totalFloors > 0 ? totalFloors : 1;
        break;
      }
      case "mamad":
        core.mamad = parseBoolean(rawValue);
        break;
      case "balcony":
        core.balcony = parseBoolean(rawValue);
        break;
      case "parking":
        core.parking = parseBoolean(rawValue);
        break;
      case "elevator":
        core.elevator = parseBoolean(rawValue);
        break;
      case "storage":
        core.storage = parseBoolean(rawValue);
        break;
      case "street":
        core.street = String(rawValue).trim();
        break;
      case "houseNumber":
        core.houseNumber = String(rawValue).trim();
        break;
      case "images":
        core.media = {
          ...(core.media ?? { images: [], videoUrl: "", matterportUrl: "" }),
          images: parseStringArray(rawValue),
        };
        break;
      case "videoUrl":
        core.media = {
          ...(core.media ?? { images: [], videoUrl: "", matterportUrl: "" }),
          videoUrl: String(rawValue).trim(),
        };
        break;
      case "matterportUrl":
        core.media = {
          ...(core.media ?? { images: [], videoUrl: "", matterportUrl: "" }),
          matterportUrl: String(rawValue).trim(),
        };
        break;
      case "featured":
        core.featured = parseBoolean(rawValue);
        break;
      case "status":
        core.status = parseStatus(rawValue);
        break;
      case "published":
        core.published = parseBoolean(rawValue);
        break;
      case "agentEmail":
        core.agentEmail = String(rawValue).trim();
        break;
      case "agentName":
        core.agentName = String(rawValue).trim();
        break;
      default:
        break;
    }
  }

  if (!core.street && core.title) {
    const parsed = parseStreetAddress(core.title);
    core.street = parsed.street;
    core.houseNumber = core.houseNumber || parsed.houseNumber;
  }

  if (core.street && !core.houseNumber) {
    const parsed = parseStreetAddress(core.street);
    if (parsed.houseNumber) {
      core.street = parsed.street;
      core.houseNumber = parsed.houseNumber;
    }
  }

  const matterportFromRow = extractMatterportUrl(row, attributes);
  if (matterportFromRow) {
    core.media = {
      ...(core.media ?? { images: [], videoUrl: "", matterportUrl: "" }),
      matterportUrl: matterportFromRow,
    };
  }

  if (!core.title && core.street) {
    core.title = [core.street, core.houseNumber, core.neighborhood].filter(Boolean).join(" ");
  }
  if (!core.title) {
    return { success: false, error: `שורה ${rowIndex + 1}: חסרה כותרת או כתובת` };
  }
  if (!core.city) {
    return { success: false, error: `שורה ${rowIndex + 1}: חסרה עיר` };
  }
  if (!core.neighborhood) {
    const notesNeighborhood = String(attributes["הערות"] ?? "")
      .match(/רובע\s*([^,\n]+)/i)?.[1]
      ?.trim();
    if (notesNeighborhood) {
      core.neighborhood = canonicalNeighborhood(
        notesNeighborhood.startsWith("רובע")
          ? notesNeighborhood
          : `רובע ${notesNeighborhood}`
      );
    }
  }

  if (!core.neighborhood) {
    return { success: false, error: `שורה ${rowIndex + 1}: חסרה שכונה / רובע` };
  }
  if (!core.price || core.price <= 0) {
    return { success: false, error: `שורה ${rowIndex + 1}: חסר מחיר תקין` };
  }
  if (!core.rooms || core.rooms < 1) {
    return { success: false, error: `שורה ${rowIndex + 1}: חסר מספר חדרים` };
  }

  return {
    success: true,
    data: buildCatalogPropertyInput({
      ...core,
      attributes,
    }),
  };
}

export function mergeCatalogUpdate(
  current: CatalogProperty,
  updates: Partial<CatalogProperty>
): CatalogProperty {
  return {
    ...current,
    ...updates,
    media: {
      ...current.media,
      ...(updates.media ?? {}),
    },
    attributes: {
      ...current.attributes,
      ...(updates.attributes ?? {}),
    },
    updatedAt: new Date().toISOString(),
  };
}
