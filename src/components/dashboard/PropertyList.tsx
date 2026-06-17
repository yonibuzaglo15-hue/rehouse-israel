"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, MapPin, User } from "lucide-react";
import type { SystemRole } from "@/lib/auth/types";
import { getCityLabel } from "@/lib/constants";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_STYLES,
  type ManagedProperty,
  type PropertyStatus,
} from "@/lib/properties";

interface PropertyListProps {
  role: SystemRole;
  listTitle: string;
  refreshKey: number;
}

function formatCurrency(value: number): string {
  return `₪${value.toLocaleString("he-IL")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PropertyList({
  role,
  listTitle,
  refreshKey,
}: PropertyListProps) {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canViewAll = role === "dev" || role === "admin";

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/properties");
      const data = (await response.json()) as {
        properties?: ManagedProperty[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "שגיאה בטעינת נכסים");
        return;
      }
      setProperties(data.properties ?? []);
    } catch {
      setError("שגיאת רשת בטעינת הנכסים");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties, refreshKey]);

  async function handleStatusChange(id: string, status: PropertyStatus) {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as {
        success?: boolean;
        property?: ManagedProperty;
        error?: string;
      };
      if (!response.ok || !data.property) {
        setError(data.error ?? "שגיאה בעדכון סטטוס");
        return;
      }
      setProperties((prev) =>
        prev.map((property) =>
          property.id === id ? data.property! : property
        )
      );
    } catch {
      setError("שגיאת רשת בעדכון");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs tracking-[0.18em] text-gold-400 uppercase">
            מלאי נכסים
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">
            {listTitle}
          </h2>
          {canViewAll && (
            <p className="mt-1 text-sm text-white/45">
              תצוגת מנהל — כל הנכסים שגויסו במשרד
            </p>
          )}
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/55">
          {properties.length} נכסים
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-16 text-white/45">
          <Loader2 className="h-5 w-5 animate-spin" />
          טוען נכסים...
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="glass-panel rounded-2xl px-6 py-14 text-center text-white/45">
          אין נכסים להצגה עדיין. גייסו נכס חדש באמצעות הטופס למעלה.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {properties.map((property) => (
          <article
            key={property.id}
            className="glass-panel rounded-2xl p-5 transition-colors hover:border-white/15"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="h-4 w-4 shrink-0 text-gold-400" />
                  <h3 className="font-display text-lg font-semibold">
                    {property.street} {property.houseNumber}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-white/50">
                  {getCityLabel(property.city)} · {property.neighborhood}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  {property.rooms} חדרים · קומה {property.floor}/{property.totalFloors}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${PROPERTY_STATUS_STYLES[property.status]}`}
              >
                {PROPERTY_STATUS_LABELS[property.status]}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {property.elevator && (
                <span className="rounded-full border border-white/10 px-2 py-1 text-white/55">
                  מעלית
                </span>
              )}
              {property.parking && (
                <span className="rounded-full border border-white/10 px-2 py-1 text-white/55">
                  חניה
                </span>
              )}
              {property.mamad && (
                <span className="rounded-full border border-white/10 px-2 py-1 text-white/55">
                  ממ״ד
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div>
                <p className="font-display text-xl font-semibold text-gold-200">
                  {formatCurrency(property.askingPrice)}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  גויס ב-{formatDate(property.recruitedAt)}
                </p>
              </div>

              {canViewAll && (
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <User className="h-3.5 w-3.5" />
                  {property.agentName}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs text-white/45">עדכון סטטוס</label>
              <select
                value={property.status}
                disabled={updatingId === property.id}
                onChange={(e) =>
                  handleStatusChange(property.id, e.target.value as PropertyStatus)
                }
                className="luxury-input text-sm disabled:opacity-60"
              >
                {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {(property.media.matterportUrl || property.media.imageNames.length > 0) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-white/35">
                <Building2 className="h-3.5 w-3.5" />
                {property.media.imageNames.length > 0 &&
                  `${property.media.imageNames.length} קבצי מדיה`}
                {property.media.matterportUrl && " · Matterport"}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
