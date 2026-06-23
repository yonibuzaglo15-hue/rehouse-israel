"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Shield,
  Car,
  Sun,
  RotateCcw,
  ChevronDown,
  Check,
  Warehouse,
  ArrowUpFromDot,
} from "lucide-react";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import type { City, PropertyFilters } from "@/lib/types";
import {
  CITIES,
  ROOM_OPTIONS,
  DEFAULT_FILTERS,
  countActiveFilters,
  getNeighborhoodFieldLabel,
  getNeighborhoodZones,
} from "@/lib/constants";

interface PropertySearchProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSearch?: () => void;
  variant?: "hero" | "catalog" | "dashboard";
  className?: string;
  resultCount?: number;
  onReset?: () => void;
}

const RENT_PRICE_PRESETS = [
  { label: "עד 5K", min: "" as const, max: 5000 },
  { label: "5–8K", min: 5000, max: 8000 },
  { label: "8K+", min: 8000, max: "" as const },
];

const BUY_PRICE_PRESETS = [
  { label: "עד 2M", min: "" as const, max: 2_000_000 },
  { label: "2–4M", min: 2_000_000, max: 4_000_000 },
  { label: "4M+", min: 4_000_000, max: "" as const },
];

export default function PropertySearch({
  filters,
  onFiltersChange,
  onSearch,
  variant = "hero",
  className = "",
  resultCount,
  onReset,
}: PropertySearchProps) {
  if (variant === "dashboard") {
    return (
      <DashboardFilters
        filters={filters}
        onFiltersChange={onFiltersChange}
        resultCount={resultCount}
        onReset={onReset}
        className={className}
      />
    );
  }

  return (
    <HeroFilters
      filters={filters}
      onFiltersChange={onFiltersChange}
      onSearch={onSearch}
      variant={variant}
      className={className}
      resultCount={resultCount}
    />
  );
}

function DashboardFilters({
  filters,
  onFiltersChange,
  resultCount,
  onReset,
  className,
}: {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  resultCount?: number;
  onReset?: () => void;
  className?: string;
}) {
  const activeCount = countActiveFilters(filters);
  const neighborhoodZones = filters.city ? getNeighborhoodZones(filters.city) : [];
  const pricePresets =
    filters.listingType === "rent" ? RENT_PRICE_PRESETS : BUY_PRICE_PRESETS;

  const update = useCallback(
    <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
      const next = { ...filters, [key]: value };
      if (key === "city") next.neighborhoods = [];
      onFiltersChange(next);
    },
    [filters, onFiltersChange]
  );

  const toggleCity = (city: City) => {
    update("city", filters.city === city ? "" : city);
  };

  const applyPricePreset = (min: number | "", max: number | "") => {
    onFiltersChange({ ...filters, priceMin: min, priceMax: max });
  };

  const isPresetActive = (min: number | "", max: number | "") =>
    filters.priceMin === min && filters.priceMax === max;

  const handleReset = () => {
    if (onReset) onReset();
    else onFiltersChange(DEFAULT_FILTERS);
  };

  return (
    <aside className={`dashboard-panel flex h-full flex-col ${className ?? ""}`}>
      <div className="border-b border-gold-500/30 bg-slate-50 px-4 py-3 dark:bg-navy-900/80">
        <div className="flex items-center justify-between">
          <span className="terminal-label">סינון נכסים</span>
          {activeCount > 0 && (
            <span className="rounded bg-gold-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white dark:text-navy-950">
              {activeCount}
            </span>
          )}
        </div>
        {resultCount !== undefined && (
          <p className="mt-1.5 font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-white">
            {resultCount}
            <span className="ms-1.5 text-xs font-normal text-slate-500 dark:text-white/45">
              תוצאות
            </span>
          </p>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <FilterSection label="סוג עסקה">
          <div className="grid grid-cols-2 gap-1.5">
            {(["buy", "rent"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => update("listingType", type)}
                className={
                  filters.listingType === type
                    ? "filter-chip-active py-2"
                    : "filter-chip-inactive py-2"
                }
              >
                {type === "buy" ? "מכירה" : "השכרה"}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection label="עיר">
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((city) => (
              <button
                key={city.value}
                type="button"
                onClick={() => toggleCity(city.value)}
                className={
                  filters.city === city.value ? "filter-chip-active" : "filter-chip-inactive"
                }
              >
                {city.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {neighborhoodZones.length > 0 && (
          <FilterSection label={getNeighborhoodFieldLabel(filters.city)}>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => update("neighborhoods", [])}
                className={
                  filters.neighborhoods.length === 0
                    ? "filter-chip-active"
                    : "filter-chip-inactive"
                }
              >
                הכל
              </button>
              {neighborhoodZones.map((zone) => (
                <div key={zone.zoneLabel}>
                  <p className="mb-1.5 text-[10px] font-medium text-slate-500 dark:text-white/40">
                    {zone.zoneLabel}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {zone.neighborhoods.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          const selected = filters.neighborhoods.includes(n);
                          update(
                            "neighborhoods",
                            selected
                              ? filters.neighborhoods.filter((x) => x !== n)
                              : [...filters.neighborhoods, n]
                          );
                        }}
                        className={
                          filters.neighborhoods.includes(n)
                            ? "filter-chip-active"
                            : "filter-chip-inactive"
                        }
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FilterSection>
        )}

        <FilterSection label="טווח חדרים">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="terminal-label">מ-</span>
              <select
                value={String(filters.minRooms)}
                onChange={(e) =>
                  update("minRooms", e.target.value === "" ? "" : Number(e.target.value))
                }
                className="dashboard-input mt-1"
              >
                <option value="">הכל</option>
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="terminal-label">עד</span>
              <select
                value={String(filters.maxRooms)}
                onChange={(e) =>
                  update("maxRooms", e.target.value === "" ? "" : Number(e.target.value))
                }
                className="dashboard-input mt-1"
              >
                <option value="">הכל</option>
                {ROOM_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterSection>

        <FilterSection label="טווח מחיר">
          <div className="flex flex-wrap gap-1.5">
            {pricePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPricePreset(p.min, p.max)}
                className={
                  isPresetActive(p.min, p.max) ? "filter-chip-active" : "filter-chip-inactive"
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <PriceRangeSlider
              listingType={filters.listingType}
              priceMin={filters.priceMin}
              priceMax={filters.priceMax}
              onChange={(priceMin, priceMax) =>
                onFiltersChange({ ...filters, priceMin, priceMax })
              }
            />
          </div>
        </FilterSection>

        <FilterSection label="מאפיינים">
          <div className="space-y-1.5">
            <ToggleChip
              active={filters.mamad}
              onClick={() => update("mamad", !filters.mamad)}
              icon={<Shield className="h-3.5 w-3.5" />}
              label="ממ״ד"
              variant="dashboard"
            />
            <ToggleChip
              active={filters.balcony}
              onClick={() => update("balcony", !filters.balcony)}
              icon={<Sun className="h-3.5 w-3.5" />}
              label="מרפסת"
              variant="dashboard"
            />
            <ToggleChip
              active={filters.parking}
              onClick={() => update("parking", !filters.parking)}
              icon={<Car className="h-3.5 w-3.5" />}
              label="חניה"
              variant="dashboard"
            />
            <ToggleChip
              active={filters.storage}
              onClick={() => update("storage", !filters.storage)}
              icon={<Warehouse className="h-3.5 w-3.5" />}
              label="מחסן"
              variant="dashboard"
            />
            <ToggleChip
              active={filters.elevator}
              onClick={() => update("elevator", !filters.elevator)}
              icon={<ArrowUpFromDot className="h-3.5 w-3.5" />}
              label="מעלית"
              variant="dashboard"
            />
          </div>
        </FilterSection>
      </div>

      {activeCount > 0 && (
        <div className="border-t border-navy-200/70 p-3 dark:border-white/10">
          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded border border-navy-200/80 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-gold-500/40 hover:text-gold-600 dark:border-white/15 dark:text-white/60 dark:hover:text-gold-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס סינון
          </button>
        </div>
      )}
    </aside>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="terminal-label mb-2">{label}</div>
      {children}
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  icon,
  label,
  variant = "hero",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: "hero" | "dashboard";
}) {
  const inactiveClass =
    variant === "dashboard"
      ? "border-white/10 bg-navy-900 text-white/45 hover:border-white/25 hover:text-white/70"
      : "border-navy-200/80 bg-slate-50 text-navy-600 hover:border-gold-500/40 hover:text-navy-900 dark:border-white/10 dark:bg-navy-900 dark:text-white/45 dark:hover:border-white/25 dark:hover:text-white/70";

  const iconClass =
    variant === "dashboard"
      ? active
        ? "text-gold-400"
        : "text-white/30"
      : active
        ? "text-gold-400"
        : "text-navy-400 dark:text-white/30";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded border px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? "border-gold-500/60 bg-gold-500/15 text-gold-700 dark:text-gold-300"
          : inactiveClass
      }`}
    >
      <span className={iconClass}>{icon}</span>
      {label}
      <span className="ms-auto font-mono text-[10px]">{active ? "ON" : "—"}</span>
    </button>
  );
}

function HeroFilters({
  filters,
  onFiltersChange,
  onSearch,
  variant,
  className,
  resultCount,
}: {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onSearch?: () => void;
  variant: "hero" | "catalog";
  className?: string;
  resultCount?: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeCount = countActiveFilters(filters);
  const neighborhoodZones = filters.city ? getNeighborhoodZones(filters.city) : [];
  const isHero = variant === "hero";
  const isCatalog = variant === "catalog";

  const update = useCallback(
    <K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) => {
      const next = { ...filters, [key]: value };
      if (key === "city") next.neighborhoods = [];
      onFiltersChange(next);
    },
    [filters, onFiltersChange]
  );

  const resetFilters = () => {
    onFiltersChange({ ...DEFAULT_FILTERS, listingType: filters.listingType });
    setShowAdvanced(false);
  };

  const handleSearchClick = () => {
    if (onSearch) onSearch();
    else if (isCatalog)
      document.getElementById("property-results")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: isHero ? 0.4 : 0 }}
      className={`${isHero ? "w-full max-w-5xl" : "w-full"} ${className ?? ""}`}
    >
      <div
        className={`property-search-panel glass-panel overflow-hidden rounded-2xl ${
          isHero ? "shadow-2xl shadow-black/40" : "shadow-lg shadow-black/20"
        }`}
      >
        <div className="flex border-b border-navy-200/70 dark:border-white/10">
          {(["buy", "rent"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update("listingType", type)}
              className={`relative flex-1 py-4 text-sm font-medium transition-colors sm:text-base ${
                filters.listingType === type
                  ? "text-gold-600 dark:text-gold-400"
                  : "text-navy-500 hover:text-navy-800 dark:text-white/50 dark:hover:text-white/80"
              }`}
            >
              {filters.listingType === type && (
                <motion.div
                  layoutId={isCatalog ? "catalogListingType" : "listingTypeIndicator"}
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-l from-gold-600 to-gold-400"
                />
              )}
              {type === "buy" ? "מכירה" : "השכרה"}
            </button>
          ))}
        </div>

        {isCatalog && resultCount !== undefined && (
          <div className="border-b border-navy-200/50 bg-slate-50/80 px-4 py-2 text-center text-xs text-navy-500 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/40">
            {resultCount > 0
              ? `${resultCount} נכסים מתאימים — עדכון בזמן אמת`
              : "לא נמצאו נכסים"}
          </div>
        )}

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-4 sm:p-6">
          <HeroSelect
            label="עיר"
            value={filters.city}
            onChange={(v) => update("city", v as PropertyFilters["city"])}
            placeholder="כל הערים"
            options={CITIES.map((c) => ({ value: c.value, label: c.label }))}
          />
          <NeighborhoodMultiSelect
            label={getNeighborhoodFieldLabel(filters.city)}
            selected={filters.neighborhoods}
            onChange={(neighborhoods) => update("neighborhoods", neighborhoods)}
            zones={neighborhoodZones}
            disabled={!filters.city}
            cityKey={filters.city}
            emptyLabel={filters.city ? "כל השכונות" : "בחרו עיר תחילה"}
          />
          <HeroSelect
            label="מ-חדרים"
            value={String(filters.minRooms)}
            onChange={(v) => update("minRooms", v === "" ? "" : Number(v))}
            placeholder="הכל"
            options={ROOM_OPTIONS.map((r) => ({
              value: String(r),
              label: `${r}`,
            }))}
          />
          <HeroSelect
            label="עד חדרים"
            value={String(filters.maxRooms)}
            onChange={(v) => update("maxRooms", v === "" ? "" : Number(v))}
            placeholder="הכל"
            options={ROOM_OPTIONS.map((r) => ({
              value: String(r),
              label: `${r}`,
            }))}
          />
          <div className="flex gap-2 sm:flex-col">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`luxury-btn-ghost relative px-4 py-3 ${showAdvanced ? "border-gold-500/40 bg-gold-500/10 dark:bg-white/10" : ""}`}
            >
              <span className="hidden sm:inline">סינון</span>
              {activeCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-950">
                  {activeCount}
                </span>
              )}
            </button>
            <button type="button" onClick={handleSearchClick} className="luxury-btn-primary flex-1 px-6 py-3">
              <Search className="h-4 w-4" />
              <span>{isCatalog ? "לתוצאות" : "חיפוש"}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-navy-200/70 p-4 dark:border-white/10 sm:p-6"
            >
              <div className="mb-4 flex justify-between">
                <h3 className="text-sm text-navy-800 dark:text-white/80">סינון מתקדם</h3>
                {activeCount > 0 && (
                  <button type="button" onClick={resetFilters} className="text-xs text-gold-600 dark:text-gold-400">
                    <X className="inline h-3 w-3" /> נקה
                  </button>
                )}
              </div>
              <PriceRangeSlider
                listingType={filters.listingType}
                priceMin={filters.priceMin}
                priceMax={filters.priceMax}
                onChange={(priceMin, priceMax) =>
                  onFiltersChange({ ...filters, priceMin, priceMax })
                }
                className="sm:col-span-2"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <ToggleChip
                  active={filters.mamad}
                  onClick={() => update("mamad", !filters.mamad)}
                  icon={<Shield className="h-3.5 w-3.5" />}
                  label="ממ״ד"
                />
                <ToggleChip
                  active={filters.balcony}
                  onClick={() => update("balcony", !filters.balcony)}
                  icon={<Sun className="h-3.5 w-3.5" />}
                  label="מרפסת"
                />
                <ToggleChip
                  active={filters.parking}
                  onClick={() => update("parking", !filters.parking)}
                  icon={<Car className="h-3.5 w-3.5" />}
                  label="חניה"
                />
                <ToggleChip
                  active={filters.storage}
                  onClick={() => update("storage", !filters.storage)}
                  icon={<Warehouse className="h-3.5 w-3.5" />}
                  label="מחסן"
                />
                <ToggleChip
                  active={filters.elevator}
                  onClick={() => update("elevator", !filters.elevator)}
                  icon={<ArrowUpFromDot className="h-3.5 w-3.5" />}
                  label="מעלית"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function getNeighborhoodTriggerLabel(
  selected: string[],
  emptyLabel: string
): string {
  if (selected.length === 0) return emptyLabel;
  if (selected.length === 1) return selected[0];
  return `${selected.length} שכונות נבחרו`;
}

function NeighborhoodMultiSelect({
  label,
  selected,
  onChange,
  zones,
  disabled,
  cityKey,
  emptyLabel,
}: {
  label: string;
  selected: string[];
  onChange: (neighborhoods: string[]) => void;
  zones: readonly { zoneLabel: string; neighborhoods: readonly string[] }[];
  disabled?: boolean;
  cityKey?: string;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [cityKey, disabled]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((n) => n !== name)
        : [...selected, name]
    );
  };

  const triggerLabel = getNeighborhoodTriggerLabel(selected, emptyLabel);

  return (
    <div ref={containerRef} className="relative flex-1">
      <label className="mb-1.5 block text-xs font-medium text-navy-600 dark:text-white/60">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className="luxury-input flex w-full items-center justify-between gap-2 text-start disabled:opacity-40"
      >
        <span className={`truncate ${selected.length === 0 ? "text-navy-400 dark:text-white/40" : ""}`}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-navy-400 transition-transform dark:text-white/40 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && zones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-navy-200/80 bg-white shadow-2xl shadow-black/10 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/95 dark:shadow-black/40"
          >
            <div className="sticky top-0 border-b border-navy-200/70 bg-white px-3 py-2 backdrop-blur-xl dark:border-white/10 dark:bg-navy-900/95">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-gold-400 transition-colors hover:text-gold-300"
              >
                {selected.length > 0 ? "נקה הכל" : "כל השכונות"}
              </button>
            </div>

            {zones.map((zone) => (
              <div key={zone.zoneLabel} className="border-b border-navy-100 last:border-0 dark:border-white/5">
                <p className="px-3 py-2 text-[10px] font-semibold tracking-wide text-navy-400 uppercase dark:text-white/35">
                  {zone.zoneLabel}
                </p>
                {zone.neighborhoods.map((n) => {
                  const isChecked = selected.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggle(n)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-navy-800 transition-colors hover:bg-slate-50 dark:text-white/80 dark:hover:bg-white/5"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? "border-gold-500 bg-gold-500/20 text-gold-600 dark:text-gold-400"
                            : "border-navy-200 bg-slate-50 dark:border-white/25 dark:bg-white/5"
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className="truncate text-start">{n}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-xs font-medium text-navy-600 dark:text-white/60">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="luxury-input appearance-none disabled:opacity-40"
      >
        <option value="" className="bg-white text-navy-900 dark:bg-navy-900 dark:text-white">
          {placeholder}
        </option>
        {options?.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-navy-900 dark:bg-navy-900 dark:text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
