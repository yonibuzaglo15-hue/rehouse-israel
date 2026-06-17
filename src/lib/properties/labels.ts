import type { PropertyStatus } from "./types";

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  active: "פעיל",
  exclusive: "בבלעדיות",
  frozen: "הוקפא",
  sold: "נמכר",
};

export const PROPERTY_STATUS_STYLES: Record<PropertyStatus, string> = {
  active: "border-emerald-500/35 bg-emerald-500/10 text-emerald-200",
  exclusive: "border-gold-500/40 bg-gold-500/12 text-gold-200",
  frozen: "border-sky-400/35 bg-sky-500/10 text-sky-200",
  sold: "border-white/20 bg-white/5 text-white/50",
};
