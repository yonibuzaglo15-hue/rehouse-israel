import { buildCatalogPropertyInput, type CatalogProperty } from "./catalog-schema";
import type { ManagedProperty, PropertyIntakeInput } from "./types";

export function catalogToManagedProperty(property: CatalogProperty): ManagedProperty {
  return {
    id: property.id,
    city: property.city,
    neighborhood: property.neighborhood,
    street: property.street,
    houseNumber: property.houseNumber,
    rooms: property.rooms,
    floor: property.floor,
    totalFloors: property.totalFloors,
    elevator: property.elevator,
    parking: property.parking,
    mamad: property.mamad,
    askingPrice: property.price,
    status: property.status,
    recruitedAt: property.recruitedAt,
    agentId: property.agentId,
    agentEmail: property.agentEmail,
    agentName: property.agentName,
    media: {
      imageNames: property.media.images,
      videoUrl: property.media.videoUrl,
      matterportUrl: property.media.matterportUrl,
    },
  };
}

export function intakeToCatalogInput(
  input: PropertyIntakeInput,
  agent: { id: string; email: string; fullName: string }
) {
  const title = `${input.street} ${input.houseNumber}, ${input.neighborhood}`.trim();
  return buildCatalogPropertyInput({
    title,
    description: "",
    listingType: "buy",
    city: input.city,
    neighborhood: input.neighborhood,
    price: input.askingPrice,
    rooms: input.rooms,
    area: 0,
    floor: input.floor,
    totalFloors: input.totalFloors,
    mamad: input.mamad,
    balcony: false,
    parking: input.parking,
    elevator: input.elevator ?? false,
    storage: false,
    street: input.street,
    houseNumber: input.houseNumber,
    media: {
      images: input.imageNames ?? [],
      videoUrl: input.videoUrl?.trim() ?? "",
      matterportUrl: input.matterportUrl?.trim() ?? "",
    },
    featured: false,
    status: input.status,
    published: input.status === "active" || input.status === "exclusive",
    agentId: agent.id,
    agentEmail: agent.email,
    agentName: agent.fullName,
    attributes: {},
  });
}
