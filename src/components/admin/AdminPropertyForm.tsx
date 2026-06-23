"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Star,
  ImageIcon,
} from "lucide-react";
import { CITIES } from "@/lib/constants";
import { PROPERTY_STATUS_LABELS } from "@/lib/properties/labels";
import {
  PROPERTY_TYPE_OPTIONS,
  type PropertyTypeOption,
} from "@/lib/properties/property-types";
import type { City } from "@/lib/types";
import type { PropertyStatus } from "@/lib/properties/types";

export interface AdminPropertyFormValues {
  title: string;
  price: string;
  city: City | "";
  rooms: string;
  status: PropertyStatus;
  propertyType: PropertyTypeOption;
  floor: string;
  totalFloors: string;
  hasSafeRoom: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  images: string[];
  coverImage: string;
  virtualTourUrl: string;
}

interface AdminPropertyFormProps {
  mode: "create" | "edit";
  propertyId?: string;
  initialValues?: Partial<AdminPropertyFormValues>;
}

const STATUS_OPTIONS: PropertyStatus[] = ["active", "exclusive", "frozen", "sold"];

const defaultValues: AdminPropertyFormValues = {
  title: "",
  price: "",
  city: "ashdod",
  rooms: "4",
  status: "active",
  propertyType: "דירה",
  floor: "0",
  totalFloors: "1",
  hasSafeRoom: false,
  hasBalcony: false,
  hasElevator: false,
  images: [""],
  coverImage: "",
  virtualTourUrl: "",
};

function getValidImages(images: string[]): string[] {
  return images.map((url) => url.trim()).filter(Boolean);
}

function resolveCoverImage(images: string[], currentCover: string): string {
  const valid = getValidImages(images);
  if (valid.length === 0) return "";
  if (currentCover && valid.includes(currentCover)) return currentCover;
  return valid[0];
}

function FeatureToggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className={[
        "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
        checked
          ? "border-gold-500/50 bg-gold-500/10 text-slate-900 dark:text-white"
          : "border-navy-200/70 bg-white/50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70",
      ].join(" ")}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-navy-300 text-gold-600 focus:ring-gold-500/40 dark:border-white/20"
      />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export default function AdminPropertyForm({
  mode,
  propertyId,
  initialValues,
}: AdminPropertyFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AdminPropertyFormValues>(() => {
    const images =
      initialValues?.images && initialValues.images.length > 0
        ? initialValues.images
        : [""];
    const coverImage =
      initialValues?.coverImage ??
      resolveCoverImage(images, initialValues?.coverImage ?? "");

    return {
      ...defaultValues,
      ...initialValues,
      images,
      coverImage,
    };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const pageTitle = useMemo(
    () => (mode === "create" ? "הוספת נכס חדש" : "עריכת נכס"),
    [mode]
  );

  const validImages = useMemo(() => getValidImages(form.images), [form.images]);

  const syncImages = (images: string[], coverImage = form.coverImage) => {
    setForm((prev) => ({
      ...prev,
      images,
      coverImage: resolveCoverImage(images, coverImage),
    }));
  };

  const updateImage = (index: number, value: string) => {
    const images = [...form.images];
    images[index] = value;
    syncImages(images);
  };

  const addImageField = () => {
    syncImages([...form.images, ""]);
  };

  const removeImageField = (index: number) => {
    syncImages(form.images.filter((_, i) => i !== index));
  };

  const setCoverImage = (url: string) => {
    setForm((prev) => ({ ...prev, coverImage: url }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const images = getValidImages(form.images);
    const coverImage = resolveCoverImage(form.images, form.coverImage);

    const payload = {
      title: form.title.trim(),
      price: Number(form.price),
      city: form.city,
      rooms: Number(form.rooms),
      status: form.status,
      propertyType: form.propertyType,
      floor: Number(form.floor),
      totalFloors: Number(form.totalFloors),
      hasSafeRoom: form.hasSafeRoom,
      hasBalcony: form.hasBalcony,
      hasElevator: form.hasElevator,
      images,
      coverImage,
      virtualTourUrl: form.virtualTourUrl.trim(),
    };

    try {
      const url =
        mode === "create"
          ? "/api/catalog/properties"
          : `/api/properties/${propertyId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "שמירת הנכס נכשלה");
      }

      const successMessage =
        mode === "create"
          ? "הנכס התווסף בהצלחה!"
          : "הנכס עודכן בהצלחה!";

      toast.success(successMessage, {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        duration: 2000,
      });

      window.setTimeout(() => {
        router.push("/properties");
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שמירת הנכס נכשלה");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-28 sm:px-6">
      <div className="mb-8">
        <Link
          href="/properties"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-gold-600 dark:text-white/50 dark:hover:text-gold-300"
        >
          <ArrowRight className="h-4 w-4" />
          חזרה לקטלוג
        </Link>
        <p className="font-display text-xs tracking-[0.2em] text-gold-600 uppercase dark:text-gold-400">
          ניהול נכסים
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">
          {pageTitle}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel space-y-8 rounded-2xl p-6 sm:p-8">
        <section className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            פרטי הנכס
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                כותרת הנכס
              </span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="luxury-input w-full"
                placeholder="לדוגמה: פנטהאוז יוקרתי עם נוף לים"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                מחיר (₪)
              </span>
              <input
                required
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                className="luxury-input w-full"
                placeholder="2500000"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                עיר
              </span>
              <select
                required
                value={form.city}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, city: e.target.value as City }))
                }
                className="luxury-input w-full"
              >
                {CITIES.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                סוג נכס
              </span>
              <select
                required
                value={form.propertyType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    propertyType: e.target.value as PropertyTypeOption,
                  }))
                }
                className="luxury-input w-full"
              >
                {PROPERTY_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                חדרים
              </span>
              <input
                required
                type="number"
                min={1}
                max={20}
                value={form.rooms}
                onChange={(e) => setForm((prev) => ({ ...prev, rooms: e.target.value }))}
                className="luxury-input w-full"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                קומה
              </span>
              <input
                required
                type="number"
                min={0}
                value={form.floor}
                onChange={(e) => setForm((prev) => ({ ...prev, floor: e.target.value }))}
                className="luxury-input w-full"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                מתוך קומות
              </span>
              <input
                required
                type="number"
                min={1}
                value={form.totalFloors}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, totalFloors: e.target.value }))
                }
                className="luxury-input w-full"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
                סטטוס
              </span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as PropertyStatus,
                  }))
                }
                className="luxury-input w-full"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {PROPERTY_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
            מאפיינים
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <FeatureToggle
              id="hasSafeRoom"
              label="ממ״ד"
              checked={form.hasSafeRoom}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, hasSafeRoom: checked }))
              }
            />
            <FeatureToggle
              id="hasBalcony"
              label="מרפסת"
              checked={form.hasBalcony}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, hasBalcony: checked }))
              }
            />
            <FeatureToggle
              id="hasElevator"
              label="מעלית"
              checked={form.hasElevator}
              onChange={(checked) =>
                setForm((prev) => ({ ...prev, hasElevator: checked }))
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              קישורי תמונות
            </h2>
            <button
              type="button"
              onClick={addImageField}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gold-500/30 px-3 py-1.5 text-xs font-medium text-gold-700 transition-colors hover:border-gold-500/60 hover:text-gold-600 dark:text-gold-300"
            >
              <Plus className="h-3.5 w-3.5" />
              הוסף תמונה
            </button>
          </div>

          <div className="space-y-3">
            {form.images.map((imageUrl, index) => (
              <div key={`image-${index}`} className="flex gap-2">
                <input
                  value={imageUrl}
                  onChange={(e) => updateImage(index, e.target.value)}
                  className="luxury-input min-w-0 flex-1"
                  placeholder="https://example.com/image.jpg"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="inline-flex shrink-0 items-center justify-center rounded-lg border border-red-300/40 px-3 text-red-600 transition-colors hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10"
                    aria-label="הסר תמונה"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {validImages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-white/80">
                תצוגה מקדימה — בחרו תמונת תצוגה ראשית
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {validImages.map((url) => {
                  const isCover = form.coverImage === url;
                  return (
                    <div
                      key={url}
                      className={[
                        "group relative overflow-hidden rounded-xl border-2 transition-all",
                        isCover
                          ? "border-gold-500 shadow-lg shadow-gold-500/20"
                          : "border-navy-200/60 dark:border-white/10",
                      ].join(" ")}
                    >
                      <div className="relative aspect-[4/3] bg-navy-900/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt="תצוגה מקדימה"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                        <div className="absolute inset-0 hidden flex-col items-center justify-center gap-1 bg-navy-900/60 text-white/50">
                          <ImageIcon className="h-7 w-7" />
                          <span className="text-[10px]">תמונה לא זמינה</span>
                        </div>
                        {isCover && (
                          <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-semibold text-navy-950">
                            <Star className="h-3 w-3 fill-current" />
                            תצוגה
                          </span>
                        )}
                      </div>
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => setCoverImage(url)}
                          className="absolute inset-x-0 bottom-0 bg-navy-950/80 px-2 py-2 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          קבע כתמונת תצוגה
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-white/80">
            קישור לסיור וירטואלי
          </span>
          <input
            value={form.virtualTourUrl}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, virtualTourUrl: e.target.value }))
            }
            className="luxury-input w-full"
            placeholder="https://my.matterport.com/show/?m=..."
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-300/40 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="luxury-btn-primary inline-flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === "create" ? "פרסם נכס" : "שמור שינויים"}
          </button>
          <Link href="/properties" className="luxury-btn-ghost">
            ביטול
          </Link>
        </div>
      </form>
    </div>
  );
}
