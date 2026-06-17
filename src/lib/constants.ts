import type { City, Property, PropertyFilters } from "./types";
import { getFlatNeighborhoods } from "./neighborhoods";

export { MOCK_AGENTS, getAgentById } from "./mock-data/agents";
export { MOCK_PROPERTIES, getPropertyById } from "./mock-data/properties";
export {
  CITY_NEIGHBORHOOD_ZONES,
  getFlatNeighborhoods,
  getNeighborhoodFieldLabel,
  getNeighborhoodZones,
  isValidNeighborhood,
} from "./neighborhoods";

export const CITIES: { value: City; label: string }[] = [
  { value: "ashdod", label: "אשדוד" },
  { value: "ashkelon", label: "אשקלון" },
  { value: "yavne", label: "יבנה" },
  { value: "gan-yavne", label: "גן יבנה" },
];

/** Flat neighborhood list per city — derived from zoned data (Yad2-style source of truth) */
export const NEIGHBORHOODS: Record<City, string[]> = {
  ashdod: getFlatNeighborhoods("ashdod"),
  ashkelon: getFlatNeighborhoods("ashkelon"),
  yavne: getFlatNeighborhoods("yavne"),
  "gan-yavne": getFlatNeighborhoods("gan-yavne"),
};

export const ROOM_OPTIONS = [1, 2, 3, 4, 5, 6];

export const DEFAULT_FILTERS: PropertyFilters = {
  listingType: "buy",
  city: "",
  neighborhood: "",
  priceMin: "",
  priceMax: "",
  rooms: "",
  mamad: false,
  balcony: false,
  parking: false,
};

export function formatPrice(price: number, listingType: "buy" | "rent"): string {
  if (listingType === "rent") {
    return `₪${price.toLocaleString("he-IL")}/חודש`;
  }
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `₪${millions % 1 === 0 ? millions : millions.toFixed(1)}M`;
  }
  return `₪${price.toLocaleString("he-IL")}`;
}

export function getCityLabel(city: City): string {
  return CITIES.find((c) => c.value === city)?.label ?? city;
}

export function filterProperties(
  properties: Property[],
  filters: PropertyFilters
): Property[] {
  return properties.filter((p) => {
    if (filters.listingType && p.listingType !== filters.listingType) return false;
    if (filters.city && p.city !== filters.city) return false;
    if (filters.neighborhood && p.neighborhood !== filters.neighborhood) return false;
    if (filters.priceMin !== "" && p.price < filters.priceMin) return false;
    if (filters.priceMax !== "" && p.price > filters.priceMax) return false;
    if (filters.rooms !== "" && p.rooms !== filters.rooms) return false;
    if (filters.mamad && !p.mamad) return false;
    if (filters.balcony && !p.balcony) return false;
    if (filters.parking && !p.parking) return false;
    return true;
  });
}

export function filtersFromSearchParams(
  params: URLSearchParams
): PropertyFilters {
  const type = params.get("type");
  const city = params.get("city");
  const validCities: City[] = ["ashdod", "ashkelon", "yavne", "gan-yavne"];

  return {
    listingType: type === "rent" ? "rent" : "buy",
    city: validCities.includes(city as City) ? (city as City) : "",
    neighborhood: params.get("neighborhood") ?? "",
    priceMin: params.get("priceMin") ? Number(params.get("priceMin")) : "",
    priceMax: params.get("priceMax") ? Number(params.get("priceMax")) : "",
    rooms: params.get("rooms") ? Number(params.get("rooms")) : "",
    mamad: params.get("mamad") === "1",
    balcony: params.get("balcony") === "1",
    parking: params.get("parking") === "1",
  };
}

export function filtersToSearchParams(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  params.set("type", filters.listingType);
  if (filters.city) params.set("city", filters.city);
  if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
  if (filters.rooms !== "") params.set("rooms", String(filters.rooms));
  if (filters.priceMin !== "") params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== "") params.set("priceMax", String(filters.priceMax));
  if (filters.mamad) params.set("mamad", "1");
  if (filters.balcony) params.set("balcony", "1");
  if (filters.parking) params.set("parking", "1");
  return params.toString();
}

export function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.city) count++;
  if (filters.neighborhood) count++;
  if (filters.priceMin !== "") count++;
  if (filters.priceMax !== "") count++;
  if (filters.rooms !== "") count++;
  if (filters.mamad) count++;
  if (filters.balcony) count++;
  if (filters.parking) count++;
  return count;
}
