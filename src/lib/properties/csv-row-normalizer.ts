import type { PropertyImportRow } from "./catalog-schema";
import { resolvePropertyNeighborhood } from "@/lib/neighborhood-utils";

const ASHKELON_NEIGHBORHOODS = [
  "ברנע",
  "עתיקות",
  "נווה אילן",
  "נווה הדרים",
  "אפרידר",
  "אגמים",
  "שקמים",
  "רמת אשכול",
  "נאות אשקלון",
  "עיר היין",
  "עיר ימים",
];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function pickField(row: PropertyImportRow, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}

function parseNotes(notes: string) {
  const text = notes.replace(/\r/g, "");
  const firstLine = text.split("\n")[0]?.trim() ?? "";
  const dashSplit = firstLine.match(/^(.+?)\s*-\s*(.+)$/);
  const addressPart = normalizeWhitespace(dashSplit?.[1] ?? firstLine);
  const detailsPart = dashSplit?.[2] ?? "";

  const neighborhoodMatch =
    detailsPart.match(/רובע\s*([^,]+)/i) ??
    text.match(/רובע\s*([^,\n]+)/i) ??
    text.match(/שכונת\s*([^,\n]+)/i);

  const floorMatch =
    detailsPart.match(/קומה\s*([^,]+)/i) ?? text.match(/קומה\s*([^,\n]+)/i);

  const roomsMatch =
    detailsPart.match(/(\d+(?:\.\d+)?)\s*חדרים/i) ??
    text.match(/דירת\s*(\d+(?:\.\d+)?)\s*חד/i);

  const areaMatch =
    detailsPart.match(/(\d+)\s*מ["״]ר/i) ?? text.match(/(\d+)\s*מ["״]ר/i);

  const priceMatch = text.match(/מחיר:\s*([^\n\{]+)/i);

  return {
    addressPart,
    neighborhood: neighborhoodMatch?.[1]?.trim(),
    floor: floorMatch?.[1]?.trim(),
    rooms: roomsMatch?.[1],
    area: areaMatch?.[1],
    priceText: priceMatch?.[1]?.trim(),
    fullText: text,
  };
}

function normalizeNeighborhood(raw: string, notes: string, address: string): string {
  const fromResolver = resolvePropertyNeighborhood(raw, notes, address);
  if (fromResolver) return fromResolver;

  for (const name of ASHKELON_NEIGHBORHOODS) {
    if (notes.includes(name)) return name;
  }

  return normalizeWhitespace(raw);
}

function normalizeCity(rawCity: string, notes: string): string {
  const city = normalizeWhitespace(rawCity);
  const upperNotes = notes.toUpperCase();

  if (upperNotes.includes("ASHKELON") || notes.includes("אשקלון")) {
    return "אשקלון";
  }

  if (
    ASHKELON_NEIGHBORHOODS.some((name) => notes.includes(name)) ||
    /ברנע|עתיקות|נווה אילן|נווה הדרים|אפרידר|אגמים|שקמים|רמת אשכול|נאות אשקלון/.test(
      notes
    )
  ) {
    return "אשקלון";
  }

  if (/יבנה|גן יבנה/.test(notes)) return "יבנה";
  if (/שדרות/.test(notes)) return "שדרות";

  return city || "אשדוד";
}

function parseStreetAddress(address: string): { street: string; houseNumber: string } {
  const trimmed = normalizeWhitespace(address);
  const match = trimmed.match(/^(.+?)\s+(\d+[\w/-]*)$/);
  if (!match) return { street: trimmed, houseNumber: "" };
  return { street: match[1].trim(), houseNumber: match[2].trim() };
}

function normalizePrice(rawPrice: unknown, notes: string): string {
  const parsedNotes = parseNotes(notes);
  const rawNumber =
    typeof rawPrice === "number"
      ? rawPrice
      : Number(String(rawPrice ?? "").replace(/[₪,\s]/g, ""));

  let price = Number.isFinite(rawNumber) ? rawNumber : NaN;

  if ((!Number.isFinite(price) || price <= 0) && parsedNotes.priceText) {
    const cleaned = parsedNotes.priceText
      .replace(/[₪]/g, "")
      .replace(/M|מ/gi, "")
      .replace(/K/gi, "")
      .replace(/,/g, "")
      .trim();
    price = Number(cleaned);
  }

  if (!Number.isFinite(price) || price <= 0) return "";

  if (price > 50_000_000) return "";

  if (price < 10_000) {
    if (parsedNotes.priceText && /M|מ/i.test(parsedNotes.priceText)) {
      return String(Math.round(price * 1_000_000));
    }
    return String(Math.round(price * 1000));
  }

  return String(Math.round(price));
}

function normalizeMamad(raw: string, notes: string): string {
  const value = raw.toLowerCase();
  if (value.includes("עם")) return "כן";
  if (value.includes("בלי")) return "לא";
  if (/ממ["״]ד/.test(notes)) return "כן";
  return raw;
}

function normalizeBalcony(notes: string): string {
  if (/מרפסת/.test(notes) && !/ללא מרפסת|בלי מרפסת/.test(notes)) return "כן";
  return "";
}

export function normalizeRehouseCsvRow(row: PropertyImportRow): PropertyImportRow {
  const notes = pickField(row, "הערות", "תיאור", "הערות נוספות");
  const parsed = parseNotes(notes);
  const agentName = pickField(row, "סוכן מטפל", "סוכן 1", "סוכן", "שם סוכן");
  const neighborhoodRaw = pickField(row, "רובע/אזור", "רובע", "שכונה", "אזור");
  const city = normalizeCity(pickField(row, "עיר"), notes);
  const address = parsed.addressPart;
  const neighborhood = normalizeNeighborhood(neighborhoodRaw, notes, address);
  const { street, houseNumber } = parseStreetAddress(address);
  const rooms =
    pickField(row, "כמות חדרים", "כמות חד'", "חדרים") || parsed.rooms || "";
  const floor = pickField(row, "קומה") || parsed.floor || "";
  const price = normalizePrice(row["מחיר"], notes);
  const mamad = normalizeMamad(pickField(row, 'עם/בלי ממ"ד', 'ממ"ד'), notes);
  const balcony = normalizeBalcony(notes);

  const normalized: PropertyImportRow = {
    ...row,
    "סוכן מטפל": agentName,
    עיר: city,
    רובע: neighborhood,
    "רובע/אזור": neighborhood,
    כתובת: address || pickField(row, "כתובת", "רחוב"),
    רחוב: street || address,
    "מספר בית": houseNumber,
    "כמות חדרים": rooms,
    "כמות חד'": rooms,
    קומה: floor,
    מחיר: price,
    'ממ"ד': mamad,
    מרפסת: balcony || pickField(row, "מרפסת"),
    הערות: notes,
  };

  if (parsed.area) {
    normalized['מ"ר'] = parsed.area;
    normalized["שטח"] = parsed.area;
  }

  return normalized;
}

export function normalizeRehouseCsvRows(rows: PropertyImportRow[]): PropertyImportRow[] {
  return rows.map(normalizeRehouseCsvRow);
}
