export const PROPERTY_TYPE_OPTIONS = [
  "דירה",
  "דירת גן",
  "וילה",
  "פנטהאוז",
  "דופלקס",
] as const;

export type PropertyTypeOption = (typeof PROPERTY_TYPE_OPTIONS)[number];

export function isPropertyType(value: string): value is PropertyTypeOption {
  return PROPERTY_TYPE_OPTIONS.includes(value as PropertyTypeOption);
}
