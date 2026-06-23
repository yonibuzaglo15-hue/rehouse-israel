"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import PropertyEditModal from "@/components/admin/PropertyEditModal";
import type { CatalogProperty } from "@/lib/properties/catalog-schema";

interface PropertyActionMenuProps {
  propertyId: string;
  className?: string;
}

export default function PropertyActionMenu({
  propertyId,
  className = "",
}: PropertyActionMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [initialRaw, setInitialRaw] = useState<CatalogProperty | null>(null);
  const [loadingAction, setLoadingAction] = useState<"edit" | "duplicate" | "delete" | null>(
    null,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const fetchRawProperty = async (): Promise<CatalogProperty> => {
    const encodedId = encodeURIComponent(propertyId);
    const res = await fetch(`/api/catalog/properties/${encodedId}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? "טעינת הנכס נכשלה");
    }

    if (!data.raw) {
      throw new Error("לא ניתן לטעון את פרטי הנכס — חסרות הרשאות עריכה");
    }

    return data.raw as CatalogProperty;
  };

  const handleEdit = async () => {
    setOpen(false);
    setError("");
    setLoadingAction("edit");

    try {
      const raw = await fetchRawProperty();
      setInitialRaw(raw);
      setEditOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "לא ניתן לטעון את פרטי הנכס");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDuplicate = async () => {
    setOpen(false);
    setError("");
    setLoadingAction("duplicate");

    try {
      const raw = await fetchRawProperty();
      const { id: _id, recruitedAt: _r, updatedAt: _u, ...rest } = raw;
      const duplicate = {
        ...rest,
        title: `${raw.title} (עותק)`,
        published: false,
      };

      sessionStorage.setItem("rehouse:duplicate-property", JSON.stringify(duplicate));
      router.push("/admin/property/new?duplicate=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שכפול הנכס נכשל");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setOpen(false);
    setError("");

    const confirmed = window.confirm(
      "האם למחוק את הנכס מהקטלוג? הנכס יוסר מהאתר אך יישמר במערכת כלא מפורסם.",
    );
    if (!confirmed) return;

    setLoadingAction("delete");

    try {
      const encodedId = encodeURIComponent(propertyId);
      const res = await fetch(`/api/properties/${encodedId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "מחיקת הנכס נכשלה");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "מחיקת הנכס נכשלה");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="פעולות נכס"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={loadingAction !== null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200/80 bg-white/90 text-slate-600 shadow-sm transition-colors hover:border-gold-500/40 hover:text-gold-700 dark:border-white/15 dark:bg-navy-950/85 dark:text-white/70 dark:hover:text-gold-300"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-navy-200/80 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-navy-950"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <MenuItem
            icon={<Pencil className="h-4 w-4" />}
            label="עריכת נכס"
            onClick={handleEdit}
            disabled={loadingAction === "edit"}
          />
          <MenuItem
            icon={<Copy className="h-4 w-4" />}
            label="שכפול נכס"
            onClick={handleDuplicate}
            disabled={loadingAction === "duplicate"}
          />
          <MenuItem
            icon={<Trash2 className="h-4 w-4" />}
            label="מחיקת נכס"
            onClick={handleDelete}
            disabled={loadingAction === "delete"}
            destructive
          />
        </div>
      ) : null}

      {error ? (
        <p className="absolute end-0 top-full z-40 mt-12 max-w-[14rem] rounded-lg border border-red-500/30 bg-red-50 px-2 py-1 text-[11px] text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <PropertyEditModal
        propertyId={propertyId}
        initialRaw={initialRaw}
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setInitialRaw(null);
        }}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
  destructive = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors disabled:opacity-50",
        destructive
          ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          : "text-slate-700 hover:bg-slate-50 dark:text-white/85 dark:hover:bg-white/5",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
