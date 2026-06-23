"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import PropertyEditModal from "./PropertyEditModal";
import { normalizePropertyId } from "@/lib/properties/ids";

interface EditPropertyButtonProps {
  propertyId: string;
  variant?: "primary" | "compact";
  className?: string;
}

export default function EditPropertyButton({
  propertyId,
  variant = "primary",
  className = "",
}: EditPropertyButtonProps) {
  const [open, setOpen] = useState(false);
  const safePropertyId = normalizePropertyId(propertyId);

  if (!safePropertyId) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          variant === "compact"
            ? `inline-flex items-center gap-1.5 rounded-lg border border-gold-500/40 bg-gold-500/10 px-2.5 py-1.5 text-xs font-medium text-gold-300 transition-colors hover:bg-gold-500/20 ${className}`
            : `inline-flex items-center gap-2 rounded-xl border border-gold-500/50 bg-gold-500/15 px-4 py-2.5 text-sm font-medium text-gold-300 shadow-lg shadow-gold-500/10 transition-colors hover:bg-gold-500/25 ${className}`
        }
      >
        <Pencil className={variant === "compact" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        ערוך נכס
      </button>

      <PropertyEditModal
        propertyId={safePropertyId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
