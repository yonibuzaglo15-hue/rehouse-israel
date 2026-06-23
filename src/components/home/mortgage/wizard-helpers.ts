export function formatCurrencyDisplay(value: number): string {
  if (!value) return "";
  return Number(value).toLocaleString("en-US");
}

export function parseDigitsOnly(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return 0;
  const parsed = Number(digits);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export const CURRENCY_INPUT_CLASS =
  "luxury-input pe-12 text-start tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const WIZARD_STEPS = [
  { id: 1, label: "אפיון לקוח" },
  { id: 2, label: "תמהיל מומלץ" },
  { id: 3, label: "תוצאות ולוח סילוקין" },
] as const;
