"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface PropertyActionMenuProps {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  className?: string;
  disabled?: boolean;
  loadingAction?: "edit" | "duplicate" | "delete" | null;
}

export default function PropertyActionMenu({
  onEdit,
  onDuplicate,
  onDelete,
  className = "",
  disabled = false,
  loadingAction = null,
}: PropertyActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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

  const stopMenuEvent = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      ref={menuRef}
      className={`relative ${className}`}
      onClick={stopMenuEvent}
      onMouseDown={stopMenuEvent}
    >
      <button
        type="button"
        aria-label="פעולות נכס"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled || loadingAction !== null}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200/80 bg-white/90 text-slate-600 shadow-sm transition-colors hover:border-gold-500/40 hover:text-gold-700 dark:border-white/15 dark:bg-navy-950/85 dark:text-white/70 dark:hover:border-gold-500/30 dark:hover:text-gold-300"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div
          role="menu"
          dir="rtl"
          className="absolute end-0 top-full z-50 mt-1 min-w-[12rem] overflow-hidden rounded-xl border border-navy-200/80 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-navy-950"
          onClick={stopMenuEvent}
          onMouseDown={stopMenuEvent}
        >
          <MenuItem
            icon={<Pencil className="h-4 w-4 ml-2 shrink-0" />}
            label="עריכת נכס"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
            disabled={loadingAction === "edit"}
          />
          <MenuItem
            icon={<Copy className="h-4 w-4 ml-2 shrink-0" />}
            label="שכפול נכס"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDuplicate();
            }}
            disabled={loadingAction === "duplicate"}
          />
          <MenuItem
            icon={<Trash2 className="h-4 w-4 ml-2 shrink-0" />}
            label="מחיקת נכס"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            disabled={loadingAction === "delete"}
            destructive
          />
        </div>
      ) : null}
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
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={[
        "flex w-full items-center justify-start gap-3 px-4 py-2 text-right text-sm transition-colors disabled:opacity-50",
        destructive
          ? "text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          : "text-slate-700 hover:bg-slate-100 dark:text-white/90 dark:hover:bg-slate-800",
      ].join(" ")}
      dir="rtl"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
