"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { City } from "@/lib/types";

interface HeroCityContextValue {
  selectedCity: City | "";
  setSelectedCity: (city: City | "") => void;
}

const HeroCityContext = createContext<HeroCityContextValue | null>(null);

export function HeroCityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<City | "">("");

  const setSelectedCity = useCallback((city: City | "") => {
    setSelectedCityState(city);
  }, []);

  const value = useMemo(
    () => ({ selectedCity, setSelectedCity }),
    [selectedCity, setSelectedCity]
  );

  return (
    <HeroCityContext.Provider value={value}>{children}</HeroCityContext.Provider>
  );
}

export function useHeroCity(): HeroCityContextValue {
  const ctx = useContext(HeroCityContext);
  if (!ctx) {
    throw new Error("useHeroCity must be used within HeroCityProvider");
  }
  return ctx;
}
