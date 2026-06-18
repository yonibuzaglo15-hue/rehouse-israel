export type PropertyStatus = "active" | "exclusive" | "frozen" | "sold";

import type { City } from "@/lib/types";

export interface ManagedPropertyMedia {
  imageNames: string[];
  videoUrl: string;
  matterportUrl: string;
}

export interface ManagedProperty {
  id: string;
  city: City;
  neighborhood: string;
  street: string;
  houseNumber: string;
  rooms: number;
  floor: number;
  totalFloors: number;
  elevator: boolean;
  parking: boolean;
  mamad: boolean;
  askingPrice: number;
  status: PropertyStatus;
  recruitedAt: string;
  agentId: string;
  agentEmail: string;
  agentName: string;
  media: ManagedPropertyMedia;
}

export interface PropertyIntakeInput {
  city: City;
  neighborhood: string;
  street: string;
  houseNumber: string;
  rooms: number;
  floor: number;
  totalFloors: number;
  elevator: boolean;
  parking: boolean;
  mamad: boolean;
  askingPrice: number;
  status: PropertyStatus;
  videoUrl?: string;
  matterportUrl?: string;
  imageNames?: string[];
}

export interface PropertyUpdateInput {
  status?: PropertyStatus;
  askingPrice?: number;
}

export type { CatalogProperty, CatalogPropertyUpdateInput } from "./catalog-schema";
