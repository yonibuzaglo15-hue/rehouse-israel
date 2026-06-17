"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PropertyFilters } from "@/lib/types";
import {
  DEFAULT_FILTERS,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/constants";

export function usePropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<PropertyFilters>(() =>
    searchParams.toString()
      ? filtersFromSearchParams(searchParams)
      : DEFAULT_FILTERS
  );

  // Sync state when URL changes externally (e.g. back/forward navigation)
  useEffect(() => {
    const fromUrl = filtersFromSearchParams(searchParams);
    setFilters(fromUrl);
  }, [searchParams]);

  const updateFilters = useCallback(
    (next: PropertyFilters) => {
      setFilters(next);
      const qs = filtersToSearchParams(next);
      router.replace(`/properties${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router]
  );

  const resetFilters = useCallback(() => {
    updateFilters(DEFAULT_FILTERS);
  }, [updateFilters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.neighborhoods.length > 0) count++;
    if (filters.priceMin !== "") count++;
    if (filters.priceMax !== "") count++;
    if (filters.rooms !== "") count++;
    if (filters.mamad) count++;
    if (filters.balcony) count++;
    if (filters.parking) count++;
    return count;
  }, [filters]);

  return { filters, updateFilters, resetFilters, activeFilterCount };
}
