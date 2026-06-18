export type ListingType = "buy" | "rent";

export type City = "ashdod" | "ashkelon" | "yavne" | "gan-yavne";

export type PropertyAttributeValue = string | number | boolean | string[] | null;

export interface PropertyFilters {
  listingType: ListingType;
  city: City | "";
  neighborhoods: string[];
  priceMin: number | "";
  priceMax: number | "";
  minRooms: number | "";
  maxRooms: number | "";
  mamad: boolean;
  balcony: boolean;
  parking: boolean;
  storage: boolean;
  elevator: boolean;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  listingType: ListingType;
  city: City;
  neighborhood: string;
  price: number;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  mamad: boolean;
  balcony: boolean;
  parking: boolean;
  elevator?: boolean;
  storage?: boolean;
  image: string;
  images?: string[];
  matterportUrl?: string;
  matterportThumbnail?: string;
  agentId?: string;
  agentName?: string;
  featured?: boolean;
  /** Dynamic criteria imported from Google Sheets */
  attributes?: Record<string, PropertyAttributeValue>;
  published?: boolean;
  status?: "active" | "exclusive" | "frozen" | "sold";
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  specialization: string;
  description?: string;
  image: string;
  phone: string;
  email: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  facebook?: string;
  calendarUrl?: string;
}
