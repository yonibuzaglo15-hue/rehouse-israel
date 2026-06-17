import { INITIAL_MANAGED_PROPERTIES } from "./mockData";
import type {
  ManagedProperty,
  PropertyIntakeInput,
  PropertyUpdateInput,
} from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __rehouseManagedProperties: ManagedProperty[] | undefined;
}

function getStore(): ManagedProperty[] {
  if (!global.__rehouseManagedProperties) {
    global.__rehouseManagedProperties = structuredClone(INITIAL_MANAGED_PROPERTIES);
  }
  return global.__rehouseManagedProperties;
}

export function listManagedProperties(): ManagedProperty[] {
  return [...getStore()].sort(
    (a, b) =>
      new Date(b.recruitedAt).getTime() - new Date(a.recruitedAt).getTime()
  );
}

export function getManagedPropertyById(id: string): ManagedProperty | undefined {
  return getStore().find((property) => property.id === id);
}

export function addManagedProperty(
  input: PropertyIntakeInput,
  agent: { id: string; email: string; fullName: string }
): ManagedProperty {
  const property: ManagedProperty = {
    id: `mp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    city: input.city,
    neighborhood: input.neighborhood,
    street: input.street.trim(),
    houseNumber: input.houseNumber.trim(),
    rooms: input.rooms,
    floor: input.floor,
    totalFloors: input.totalFloors,
    elevator: input.elevator,
    parking: input.parking,
    mamad: input.mamad,
    askingPrice: input.askingPrice,
    status: input.status,
    recruitedAt: new Date().toISOString(),
    agentId: agent.id,
    agentEmail: agent.email,
    agentName: agent.fullName,
    media: {
      imageNames: input.imageNames ?? [],
      videoUrl: input.videoUrl?.trim() ?? "",
      matterportUrl: input.matterportUrl?.trim() ?? "",
    },
  };

  getStore().unshift(property);
  return property;
}

export function updateManagedProperty(
  id: string,
  updates: PropertyUpdateInput
): ManagedProperty | null {
  const store = getStore();
  const index = store.findIndex((property) => property.id === id);
  if (index === -1) return null;

  const current = store[index];
  const next: ManagedProperty = {
    ...current,
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.askingPrice !== undefined
      ? { askingPrice: updates.askingPrice }
      : {}),
  };

  store[index] = next;
  return next;
}
