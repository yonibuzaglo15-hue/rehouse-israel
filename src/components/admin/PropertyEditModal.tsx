"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import type { CatalogProperty } from "@/lib/properties/catalog-schema";
import { CITIES, getNeighborhoodFieldLabel, getNeighborhoodZones } from "@/lib/constants";
import { PROPERTY_STATUS_LABELS } from "@/lib/properties/labels";
import type { City, ListingType } from "@/lib/types";
import type { PropertyStatus } from "@/lib/properties/types";
import { normalizePropertyId, propertyApiPath } from "@/lib/properties/ids";

interface PropertyEditModalProps {
  propertyId: string;
  open: boolean;
  onClose: () => void;
  initialRaw?: CatalogProperty | null;
}

const STATUS_OPTIONS: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

export default function PropertyEditModal({
  propertyId,
  open,
  onClose,
  initialRaw = null,
}: PropertyEditModalProps) {
  const router = useRouter();
  const safePropertyId = normalizePropertyId(propertyId);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolvingImages, setResolvingImages] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CatalogProperty | null>(null);

  useEffect(() => {
    if (!open || !safePropertyId) return;

    if (
      initialRaw &&
      normalizePropertyId(initialRaw.id) === safePropertyId
    ) {
      setForm({ ...initialRaw, id: safePropertyId });
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setForm(null);

    const fetchUrl = `/api/catalog/properties/${encodeURIComponent(safePropertyId)}`;

    fetch(fetchUrl, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "טעינת הנכס נכשלה");
        }
        if (!data.raw) {
          throw new Error("לא ניתן לטעון את פרטי הנכס — חסרות הרשאות עריכה");
        }
        setForm({ ...(data.raw as CatalogProperty), id: safePropertyId });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "לא ניתן לטעון את פרטי הנכס");
      })
      .finally(() => setLoading(false));
  }, [open, safePropertyId, initialRaw]);

  const propertyData = form;
  const neighborhoodZones = propertyData?.city ? getNeighborhoodZones(propertyData.city) : [];

  const resolveImages = async () => {
    if (!form) return;
    setResolvingImages(true);
    setError("");
    try {
      const resolvePath = propertyApiPath(form.id);
      if (!resolvePath) throw new Error("מזהה נכס לא תקין");

      const res = await fetch(`${resolvePath}/resolve-images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageFolderUrl: form.media.imageFolderUrl ?? "",
          city: form.city,
          neighborhood: form.neighborhood,
          matterportThumbnailUrl: form.media.matterportThumbnailUrl ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שליפת תמונות נכשלה");
      setForm(data.property as CatalogProperty);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שליפת תמונות נכשלה");
    } finally {
      setResolvingImages(false);
    }
  };

  const updateField = <K extends keyof CatalogProperty>(key: K, value: CatalogProperty[K]) => {
    if (!form) return;
    const next = { ...form, [key]: value };
    if (key === "city") next.neighborhood = "";
    setForm(next);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError("");

    try {
      const savePath = propertyApiPath(form.id);
      if (!savePath) throw new Error("מזהה נכס לא תקין");

      const res = await fetch(savePath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          listingType: form.listingType,
          city: form.city,
          neighborhood: form.neighborhood,
          price: form.price,
          rooms: form.rooms,
          area: form.area,
          floor: form.floor,
          totalFloors: form.totalFloors,
          mamad: form.mamad,
          balcony: form.balcony,
          parking: form.parking,
          elevator: form.elevator,
          storage: form.storage,
          street: form.street,
          houseNumber: form.houseNumber,
          featured: form.featured,
          published: form.published,
          status: form.status,
          attributes: form.attributes,
          media: form.media,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "שמירה נכשלה");

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירה נכשלה");
    } finally {
      setSaving(false);
    }
  };

  if (!open || !safePropertyId) return null;

  if (
    !propertyId ||
    typeof propertyId !== "string" ||
    propertyId.includes("[object Object]")
  ) {
    return (
      <div className="p-4 bg-red-100 text-red-700">
        Critical Error: Invalid Property ID provided to Modal.
      </div>
    );
  }

  const renderFormBody = () => {
    if (loading || !propertyData) {
      return <div className="p-8 text-center text-slate-600 dark:text-white/70">טוען נתונים...</div>;
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
                <Field label="כותרת" className="sm:col-span-2">
                  <input
                    value={propertyData.title ?? ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="luxury-input"
                  />
                </Field>

                <Field label="תיאור" className="sm:col-span-2">
                  <textarea
                    value={propertyData.description ?? ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    className="luxury-input resize-y"
                  />
                </Field>

                <Field label="סוג עסקה">
                  <select
                    value={propertyData.listingType ?? "buy"}
                    onChange={(e) => updateField("listingType", e.target.value as ListingType)}
                    className="luxury-input"
                  >
                    <option value="buy">מכירה</option>
                    <option value="rent">השכרה</option>
                  </select>
                </Field>

                <Field label="מחיר">
                  <input
                    type="number"
                    value={propertyData.price}
                    onChange={(e) => updateField("price", Number(e.target.value))}
                    className="luxury-input"
                  />
                </Field>

                <Field label="עיר">
                  <select
                    value={propertyData.city}
                    onChange={(e) => updateField("city", e.target.value as City)}
                    className="luxury-input"
                  >
                    {CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={getNeighborhoodFieldLabel(propertyData.city)}>
                  <select
                    value={propertyData.neighborhood}
                    onChange={(e) => updateField("neighborhood", e.target.value)}
                    className="luxury-input"
                  >
                    <option value="">בחרו שכונה / אזור</option>
                    {neighborhoodZones.map((zone) => (
                      <optgroup key={zone.zoneLabel} label={zone.zoneLabel}>
                        {zone.neighborhoods.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>

                <Field label="חדרים">
                  <input
                    type="number"
                    value={propertyData.rooms}
                    onChange={(e) => updateField("rooms", Number(e.target.value))}
                    className="luxury-input"
                  />
                </Field>

                <Field label={'שטח (מ"ר)'}>
                  <input
                    type="number"
                    value={propertyData.area}
                    onChange={(e) => updateField("area", Number(e.target.value))}
                    className="luxury-input"
                  />
                </Field>

                <Field label="קומה">
                  <input
                    type="number"
                    value={propertyData.floor}
                    onChange={(e) => updateField("floor", Number(e.target.value))}
                    className="luxury-input"
                  />
                </Field>

                <Field label="קומות בבניין">
                  <input
                    type="number"
                    value={propertyData.totalFloors}
                    onChange={(e) => updateField("totalFloors", Number(e.target.value))}
                    className="luxury-input"
                  />
                </Field>

                <Field label="רחוב">
                  <input
                    value={propertyData.street}
                    onChange={(e) => updateField("street", e.target.value)}
                    className="luxury-input"
                  />
                </Field>

                <Field label="מספר בית">
                  <input
                    value={propertyData.houseNumber}
                    onChange={(e) => updateField("houseNumber", e.target.value)}
                    className="luxury-input"
                  />
                </Field>

                <Field label="סטטוס">
                  <select
                    value={propertyData.status}
                    onChange={(e) => updateField("status", e.target.value as PropertyStatus)}
                    className="luxury-input"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {PROPERTY_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="פרסום באתר">
                  <select
                    value={propertyData.published ? "1" : "0"}
                    onChange={(e) => updateField("published", e.target.value === "1")}
                    className="luxury-input"
                  >
                    <option value="1">מפורסם</option>
                    <option value="0">לא מפורסם</option>
                  </select>
                </Field>

                <div className="sm:col-span-2 flex flex-wrap gap-4">
                  <Toggle label="ממ״ד" checked={propertyData.mamad} onChange={(v) => updateField("mamad", v)} />
                  <Toggle label="מרפסת" checked={propertyData.balcony} onChange={(v) => updateField("balcony", v)} />
                  <Toggle label="חניה" checked={propertyData.parking} onChange={(v) => updateField("parking", v)} />
                  <Toggle label="מעלית" checked={propertyData.elevator} onChange={(v) => updateField("elevator", v)} />
                  <Toggle label="מחסן" checked={propertyData.storage} onChange={(v) => updateField("storage", v)} />
                  <Toggle label="מומלץ" checked={propertyData.featured} onChange={(v) => updateField("featured", v)} />
                </div>

                <Field label="ניתוב תמונות מתיקייה" className="sm:col-span-2">
                  <div className="space-y-3 rounded-xl border border-gold-500/20 bg-gold-500/5 p-4">
                    <p className="text-xs text-white/50">
                      הזינו נתיב בסיס לתיקיית צילום. המערכת תשלוף 1.jpg כקאבר, 2.jpg, 3.jpg…
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <select
                        value={propertyData.city}
                        onChange={(e) => updateField("city", e.target.value as City)}
                        className="luxury-input"
                      >
                        {CITIES.map((city) => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={propertyData.neighborhood}
                        onChange={(e) => updateField("neighborhood", e.target.value)}
                        className="luxury-input"
                      >
                        <option value="">בחרו שכונה / רובע</option>
                        {neighborhoodZones.map((zone) => (
                          <optgroup key={zone.zoneLabel} label={zone.zoneLabel}>
                            {zone.neighborhoods.map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                    <input
                      value={propertyData.media.imageFolderUrl ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          media: { ...propertyData.media, imageFolderUrl: e.target.value },
                        })
                      }
                      placeholder="https://drive.../folder או /images/properties/ashdod/marina"
                      className="luxury-input"
                    />
                    <input
                      value={propertyData.media.matterportUrl ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          media: { ...propertyData.media, matterportUrl: e.target.value },
                        })
                      }
                      placeholder="קישור Matterport / סיור וירטואלי"
                      className="luxury-input"
                    />
                    <input
                      value={propertyData.media.matterportThumbnailUrl ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          media: { ...propertyData.media, matterportThumbnailUrl: e.target.value },
                        })
                      }
                      placeholder="Thumbnail לסיור (אופציונלי)"
                      className="luxury-input"
                    />
                    <button
                      type="button"
                      onClick={resolveImages}
                      disabled={resolvingImages}
                      className="luxury-btn-ghost text-sm disabled:opacity-50"
                    >
                      {resolvingImages ? "שולף תמונות…" : "שלוף תמונות מהתיקייה"}
                    </button>
                  </div>
                </Field>

                {Object.keys(propertyData.attributes).length > 0 && (
                  <Field label="קריטריונים דינמיים (Google Sheets)" className="sm:col-span-2">
                    <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      {Object.entries(propertyData.attributes).map(([key, value]) => (
                        <div key={key} className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                          <span className="text-xs text-white/45">{key}</span>
                          <input
                            value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                attributes: { ...propertyData.attributes, [key]: e.target.value },
                              })
                            }
                            className="luxury-input py-2 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </Field>
                )}
              </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-navy-950/80 sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-navy-200/70 px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-xs tracking-widest text-gold-600 uppercase dark:text-gold-400">
                Admin Edit
              </p>
              <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                עריכת נכס
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-5 py-5">
            {renderFormBody()}

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-navy-200/70 px-5 py-4 dark:border-white/10">
            <button type="button" onClick={onClose} className="luxury-btn-ghost px-5 py-2.5">
              ביטול
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || !propertyData}
              className="luxury-btn-primary inline-flex items-center gap-2 px-5 py-2.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              שמור שינויים
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-white/60">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-white/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-white/20 bg-white/5 text-gold-500 focus:ring-gold-500/30"
      />
      {label}
    </label>
  );
}
