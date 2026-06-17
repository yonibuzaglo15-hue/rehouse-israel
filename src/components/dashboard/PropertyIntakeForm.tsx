"use client";

import { FormEvent, useRef, useState } from "react";
import {
  Building,
  Car,
  ImagePlus,
  Link2,
  Loader2,
  Shield,
  Video,
} from "lucide-react";
import { NEIGHBORHOODS } from "@/lib/constants";
import {
  PROPERTY_STATUS_LABELS,
  type PropertyStatus,
} from "@/lib/properties";

const ASHDOD_DISTRICTS = NEIGHBORHOODS.ashdod;

interface PropertyIntakeFormProps {
  onSuccess: () => void;
}

interface FormState {
  district: string;
  street: string;
  houseNumber: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  elevator: boolean;
  parking: boolean;
  mamad: boolean;
  askingPrice: string;
  status: PropertyStatus;
  videoUrl: string;
  matterportUrl: string;
}

const INITIAL_FORM: FormState = {
  district: "",
  street: "",
  houseNumber: "",
  rooms: "",
  floor: "",
  totalFloors: "",
  elevator: false,
  parking: false,
  mamad: false,
  askingPrice: "",
  status: "active",
  videoUrl: "",
  matterportUrl: "",
};

function FeatureToggle({
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  icon: typeof Building;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
        checked
          ? "border-gold-500/45 bg-gold-500/10 text-gold-100"
          : "border-white/10 bg-white/[0.03] text-white/55"
      }`}
    >
      <span className="flex items-center gap-2 font-display text-sm">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span
        className={`h-5 w-9 rounded-full p-0.5 transition-colors ${
          checked ? "bg-gold-500" : "bg-white/15"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-0" : "-translate-x-4"
          }`}
        />
      </span>
    </button>
  );
}

export default function PropertyIntakeForm({ onSuccess }: PropertyIntakeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    setImageNames(Array.from(files).map((file) => file.name));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          rooms: Number(form.rooms),
          floor: Number(form.floor),
          totalFloors: Number(form.totalFloors),
          askingPrice: Number(form.askingPrice),
          imageNames,
        }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        setError(data.error ?? "שגיאה בשמירת הנכס");
        return;
      }

      setForm(INITIAL_FORM);
      setImageNames([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccess("הנכס נוסף בהצלחה ושויך לחשבון שלך");
      onSuccess();
    } catch {
      setError("שגיאת רשת. נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6 sm:p-8">
      <div className="mb-6">
        <p className="font-display text-xs tracking-[0.18em] text-gold-400 uppercase">
          גיוס נכס
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">
          הוספת נכס חדש
        </h2>
        <p className="mt-2 text-sm text-white/50">
          הנכס ישויך אוטומטית לסוכן המחובר
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-white/70">רובע *</label>
            <select
              required
              value={form.district}
              onChange={(e) => updateField("district", e.target.value)}
              className="luxury-input"
            >
              <option value="">בחרו רובע באשדוד</option>
              {ASHDOD_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">רחוב *</label>
            <input
              required
              value={form.street}
              onChange={(e) => updateField("street", e.target.value)}
              className="luxury-input"
              placeholder="שם הרחוב"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">מספר בית *</label>
            <input
              required
              value={form.houseNumber}
              onChange={(e) => updateField("houseNumber", e.target.value)}
              className="luxury-input"
              placeholder="מס׳"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">חדרים *</label>
            <input
              required
              type="number"
              min={1}
              max={20}
              value={form.rooms}
              onChange={(e) => updateField("rooms", e.target.value)}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">מחיר מבוקש (₪) *</label>
            <input
              required
              type="number"
              min={1}
              value={form.askingPrice}
              onChange={(e) => updateField("askingPrice", e.target.value)}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">קומה *</label>
            <input
              required
              type="number"
              min={0}
              value={form.floor}
              onChange={(e) => updateField("floor", e.target.value)}
              className="luxury-input"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">קומות בבניין *</label>
            <input
              required
              type="number"
              min={1}
              value={form.totalFloors}
              onChange={(e) => updateField("totalFloors", e.target.value)}
              className="luxury-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-white/70">סטטוס</label>
            <select
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as PropertyStatus)
              }
              className="luxury-input"
            >
              {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FeatureToggle
            label="מעלית"
            icon={Building}
            checked={form.elevator}
            onChange={(value) => updateField("elevator", value)}
          />
          <FeatureToggle
            label="חניה"
            icon={Car}
            checked={form.parking}
            onChange={(value) => updateField("parking", value)}
          />
          <FeatureToggle
            label={'ממ"ד'}
            icon={Shield}
            checked={form.mamad}
            onChange={(value) => updateField("mamad", value)}
          />
        </div>

        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5">
          <p className="mb-4 flex items-center gap-2 font-display text-sm font-medium text-white/75">
            <ImagePlus className="h-4 w-4 text-gold-400" />
            מדיה וסיור וירטואלי (סימולציה)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={(e) => handleFilesSelected(e.target.files)}
            className="luxury-input cursor-pointer file:me-4 file:rounded-lg file:border-0 file:bg-gold-500/20 file:px-3 file:py-1.5 file:text-sm file:text-gold-200"
          />

          {imageNames.length > 0 && (
            <p className="mt-3 text-xs text-white/45">
              {imageNames.length} קבצים נבחרו: {imageNames.join(", ")}
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Video className="h-4 w-4" />
                קישור לוידאו
              </label>
              <input
                value={form.videoUrl}
                onChange={(e) => updateField("videoUrl", e.target.value)}
                className="luxury-input"
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm text-white/70">
                <Link2 className="h-4 w-4" />
                Matterport 360
              </label>
              <input
                value={form.matterportUrl}
                onChange={(e) => updateField("matterportUrl", e.target.value)}
                className="luxury-input"
                placeholder="https://my.matterport.com/..."
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="luxury-btn-primary w-full sm:w-auto disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              שומר נכס...
            </>
          ) : (
            "שמירת נכס חדש"
          )}
        </button>
      </form>
    </section>
  );
}
