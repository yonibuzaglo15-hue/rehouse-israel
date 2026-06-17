export type ListingType = "buy" | "rent";

export type City = "ashdod" | "ashkelon" | "yavne" | "gan-yavne";

export interface PropertyFilters {
  listingType: ListingType;
  city: City | "";
  neighborhood: string;
  priceMin: number | "";
  priceMax: number | "";
  rooms: number | "";
  mamad: boolean;
  balcony: boolean;
  parking: boolean;
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
  image: string;
  featured?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  specialization: string;
  image: string;
  phone: string;
  email: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  calendarUrl?: string;
}
