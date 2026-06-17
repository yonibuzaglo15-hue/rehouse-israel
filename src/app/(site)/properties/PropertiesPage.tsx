"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Activity } from "lucide-react";
import PropertySearch from "@/components/PropertySearch";
import PropertyCard from "@/components/PropertyCard";
import { usePropertyFilters } from "@/lib/hooks/usePropertyFilters";
import { MOCK_PROPERTIES, filterProperties, getCityLabel } from "@/lib/constants";

export default function PropertiesPage() {
  const { filters, updateFilters, resetFilters, activeFilterCount } =
    usePropertyFilters();

  const results = useMemo(
    () => filterProperties(MOCK_PROPERTIES, filters),
    [filters]
  );

  const filterSummary = [
    filters.listingType === "buy" ? "מכירה" : "השכרה",
    filters.city ? getCityLabel(filters.city) : null,
    filters.neighborhood || null,
    filters.rooms !== "" ? `${filters.rooms} חדרים` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-screen bg-navy-950 pt-20">
      {/* Terminal status bar */}
      <div className="border-b border-gold-500/20 bg-navy-900/90">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-emerald-400" />
            <span className="terminal-label hidden sm:inline">Rehouse Terminal</span>
            <span className="font-mono text-xs text-white/40">|</span>
            <span className="truncate font-mono text-xs text-white/60">
              {filterSummary || "כל הנכסים"}
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-white/40">
              LIVE <span className="text-emerald-400">●</span>
            </span>
            <span className="font-bold tabular-nums text-gold-400">{results.length}</span>
            <span className="hidden text-white/40 sm:inline">נכסים</span>
          </div>
        </div>
      </div>

      {/* Dashboard layout: filters pinned visual-left (ltr shell), results right */}
      <div className="mx-auto max-w-[1600px]">
        {/* Mobile filters */}
        <div className="border-b border-white/10 p-4 lg:hidden" dir="rtl">
          <PropertySearch
            filters={filters}
            onFiltersChange={updateFilters}
            variant="dashboard"
            resultCount={results.length}
            onReset={resetFilters}
          />
        </div>

        {/* Desktop: ltr grid pins sidebar to visual left */}
        <div className="hidden lg:grid lg:grid-cols-[300px_1fr]" dir="ltr">
          <div className="sticky top-20 h-[calc(100vh-5rem)] border-e border-white/10" dir="rtl">
            <PropertySearch
              filters={filters}
              onFiltersChange={updateFilters}
              variant="dashboard"
              resultCount={results.length}
              onReset={resetFilters}
              className="h-full rounded-none border-0"
            />
          </div>

          <main id="property-results" className="min-w-0 p-4 sm:p-6" dir="rtl">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-display text-lg font-semibold text-white">
                קטלוג נכסים
              </h1>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-mono text-xs text-gold-400 hover:text-gold-300"
                >
                  RESET ({activeFilterCount})
                </button>
              )}
            </div>

            <ResultsFeed results={results} resetFilters={resetFilters} />
          </main>
        </div>

        {/* Mobile results */}
        <main className="p-4 lg:hidden" dir="rtl">
          <ResultsFeed results={results} resetFilters={resetFilters} />
        </main>
      </div>
    </div>
  );
}

function ResultsFeed({
  results,
  resetFilters,
}: {
  results: ReturnType<typeof filterProperties>;
  resetFilters: () => void;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {results.length > 0 ? (
        <motion.div
          key={results.map((p) => p.id).join(",")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-2"
        >
          {results.map((property, i) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={i}
              variant="dashboard"
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center border border-dashed border-white/15 py-24 text-center"
        >
          <Building2 className="mb-4 h-10 w-10 text-white/20" />
          <h3 className="font-mono text-sm font-semibold text-white/70">NO RESULTS</h3>
          <p className="mt-2 text-xs text-white/40">נסו לשנות את פרמטרי הסינון</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 border border-gold-500/40 px-4 py-2 font-mono text-xs text-gold-400 hover:bg-gold-500/10"
          >
            איפוס סינון
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
