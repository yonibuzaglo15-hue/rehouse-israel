"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PropertySearch from "@/components/PropertySearch";
import { DEFAULT_FILTERS, filtersToSearchParams } from "@/lib/constants";
import { useHeroCity } from "@/contexts/HeroCityContext";
import type { PropertyFilters } from "@/lib/types";

export default function HeroPropertySearch() {
  const router = useRouter();
  const { setSelectedCity } = useHeroCity();
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    setSelectedCity(filters.city);
  }, [filters.city, setSelectedCity]);

  const handleFiltersChange = useCallback((next: PropertyFilters) => {
    setFilters(next);
  }, []);

  const handleSearch = () => {
    const qs = filtersToSearchParams(filters);
    router.push(`/properties${qs ? `?${qs}` : ""}`);
  };

  return (
    <section
      id="property-search"
      className="hero-search-overlay relative z-30 -mt-12 px-4 sm:-mt-16 sm:px-6 lg:-mt-20 lg:px-8"
      aria-label="חיפוש נכסים"
    >
      <div className="mx-auto max-w-5xl">
        <PropertySearch
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSearch={handleSearch}
          variant="hero"
        />
      </div>
    </section>
  );
}
