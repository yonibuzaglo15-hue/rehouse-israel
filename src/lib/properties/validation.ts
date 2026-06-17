import type { City } from "@/lib/types";
import { isCity, isValidNeighborhood } from "./neighborhoods";
import type { PropertyIntakeInput, PropertyStatus } from "./types";

const VALID_STATUSES: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

export function validatePropertyIntake(
  body: unknown
): { success: true; data: PropertyIntakeInput } | { success: false; error: string } {
  if (!body || typeof body !== "object") {
    return { success: false, error: "נתוני הטופס אינם תקינים" };
  }

  const raw = body as Record<string, unknown>;

  const cityRaw = String(raw.city ?? "").trim();
  const neighborhood = String(raw.neighborhood ?? "").trim();
  const street = String(raw.street ?? "").trim();
  const houseNumber = String(raw.houseNumber ?? "").trim();
  const rooms = Number(raw.rooms);
  const floor = Number(raw.floor);
  const totalFloors = Number(raw.totalFloors);
  const askingPrice = Number(raw.askingPrice);
  const status = String(raw.status ?? "active") as PropertyStatus;

  if (!isCity(cityRaw)) return { success: false, error: "נא לבחור עיר" };
  const city = cityRaw as City;

  if (!neighborhood) {
    return {
      success: false,
      error: city === "ashdod" ? "נא לבחור רובע" : "נא לבחור שכונה / אזור",
    };
  }
  if (!isValidNeighborhood(city, neighborhood)) {
    return { success: false, error: "השכונה שנבחרה אינה תקינה עבור העיר" };
  }
  if (!street) return { success: false, error: "נא למלא שם רחוב" };
  if (!houseNumber) return { success: false, error: "נא למלא מספר בית" };
  if (!Number.isFinite(rooms) || rooms < 1 || rooms > 20) {
    return { success: false, error: "מספר חדרים אינו תקין" };
  }
  if (!Number.isFinite(floor) || floor < 0) {
    return { success: false, error: "קומה אינה תקינה" };
  }
  if (!Number.isFinite(totalFloors) || totalFloors < 1) {
    return { success: false, error: "מספר קומות בבניין אינו תקין" };
  }
  if (floor > totalFloors) {
    return { success: false, error: "הקומה לא יכולה להיות גבוהה מסך הקומות בבניין" };
  }
  if (!Number.isFinite(askingPrice) || askingPrice <= 0) {
    return { success: false, error: "מחיר מבוקש חייב להיות גדול מ-0" };
  }
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "סטטוס הנכס אינו תקין" };
  }

  return {
    success: true,
    data: {
      city,
      neighborhood,
      street,
      houseNumber,
      rooms,
      floor,
      totalFloors,
      elevator: Boolean(raw.elevator),
      parking: Boolean(raw.parking),
      mamad: Boolean(raw.mamad),
      askingPrice,
      status,
      videoUrl: raw.videoUrl ? String(raw.videoUrl) : "",
      matterportUrl: raw.matterportUrl ? String(raw.matterportUrl) : "",
      imageNames: Array.isArray(raw.imageNames)
        ? raw.imageNames.map(String)
        : [],
    },
  };
}
