import "server-only";

import { getPropertyRepository } from "./repository";
import { catalogToManagedProperty, intakeToCatalogInput } from "./adapters";
import type {
  ManagedProperty,
  PropertyIntakeInput,
  PropertyUpdateInput,
} from "./types";

export async function listManagedProperties(): Promise<ManagedProperty[]> {
  const properties = await getPropertyRepository().listAll();
  return properties.map(catalogToManagedProperty);
}

export async function getManagedPropertyById(
  id: string
): Promise<ManagedProperty | undefined> {
  const property = await getPropertyRepository().getById(id);
  return property ? catalogToManagedProperty(property) : undefined;
}

export async function addManagedProperty(
  input: PropertyIntakeInput,
  agent: { id: string; email: string; fullName: string }
): Promise<ManagedProperty> {
  const property = await getPropertyRepository().create(
    intakeToCatalogInput(input, agent)
  );
  return catalogToManagedProperty(property);
}

export async function updateManagedProperty(
  id: string,
  updates: PropertyUpdateInput
): Promise<ManagedProperty | null> {
  const updated = await getPropertyRepository().update(id, {
    ...(updates.status !== undefined ? { status: updates.status } : {}),
    ...(updates.askingPrice !== undefined ? { price: updates.askingPrice } : {}),
  });
  return updated ? catalogToManagedProperty(updated) : null;
}
