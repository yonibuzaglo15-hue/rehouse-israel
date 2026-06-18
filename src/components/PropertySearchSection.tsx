"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PropertySearch from "@/components/PropertySearch";
import { DEFAULT_FILTERS, filtersToSearchParams } from "@/lib/constants";
import type { PropertyFilters } from "@/lib/types";

export default function PropertySearchSection() {
  const router = useRouter();
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  const handleSearch = () => {
    const qs = filtersToSearchParams(filters);
    router.push(`/properties${qs ? `?${qs}` : ""}`);
  };

  return (
    <section id="properties" className="relative border-t border-white/5 py-24 scroll-mt-24">
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/60 to-navy-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(201,149,46,0.06),transparent_55%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <span className="mb-3 inline-block text-xs font-medium tracking-widest text-gold-400 uppercase">
            חיפוש נכסים
          </span>
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            מצאו את <span className="gold-gradient-text">הנכס המושלם</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/50">
            סננו לפי עיר, שכונה, מחיר ומאפיינים — והתחילו את המסע לבית החדש
          </p>
        </motion.div>

        <PropertySearch
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          variant="hero"
        />
      </div>
    </section>
  );
}
