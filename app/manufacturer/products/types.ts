export const PRODUCT_TYPES = ["lamel", "motor", "color", "kast", "option"] as const;

export type ManufacturerProductType = (typeof PRODUCT_TYPES)[number];

export function isManufacturerProductType(value: string): value is ManufacturerProductType {
  return PRODUCT_TYPES.includes(value as ManufacturerProductType);
}
