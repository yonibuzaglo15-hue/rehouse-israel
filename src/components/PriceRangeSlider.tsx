"use client";

import { useCallback, useMemo } from "react";

export interface PriceRangeConfig {
  floor: number;
  ceiling: number;
  step: number;
}

export const BUY_PRICE_RANGE: PriceRangeConfig = {
  floor: 0,
  ceiling: 10_000_000,
  step: 100_000,
};

export const RENT_PRICE_RANGE: PriceRangeConfig = {
  floor: 0,
  ceiling: 25_000,
  step: 500,
};

function formatBuyPrice(value: number): string {
  if (value <= 0) return "ללא מינימום";
  if (value >= BUY_PRICE_RANGE.ceiling) return "10M+";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  return `₪${value.toLocaleString("he-IL")}`;
}

function formatRentPrice(value: number): string {
  if (value <= 0) return "ללא מינימום";
  if (value >= RENT_PRICE_RANGE.ceiling) return "25K+";
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `₪${value.toLocaleString("he-IL")}`;
}

interface PriceRangeSliderProps {
  listingType: "buy" | "rent";
  priceMin: number | "";
  priceMax: number | "";
  onChange: (priceMin: number | "", priceMax: number | "") => void;
  className?: string;
}

export default function PriceRangeSlider({
  listingType,
  priceMin,
  priceMax,
  onChange,
  className = "",
}: PriceRangeSliderProps) {
  const config = listingType === "rent" ? RENT_PRICE_RANGE : BUY_PRICE_RANGE;
  const format = listingType === "rent" ? formatRentPrice : formatBuyPrice;

  const minValue = priceMin === "" ? config.floor : Number(priceMin);
  const maxValue = priceMax === "" ? config.ceiling : Number(priceMax);

  const safeMin = Math.min(Math.max(minValue, config.floor), config.ceiling);
  const safeMax = Math.min(Math.max(maxValue, config.floor), config.ceiling);

  const minPercent = ((safeMin - config.floor) / (config.ceiling - config.floor)) * 100;
  const maxPercent = ((safeMax - config.floor) / (config.ceiling - config.floor)) * 100;

  const label = useMemo(() => {
    const minLabel = safeMin <= config.floor ? "ללא מינימום" : format(safeMin);
    const maxLabel = safeMax >= config.ceiling ? "ללא מקסימום" : format(safeMax);
    return `${minLabel} — ${maxLabel}`;
  }, [safeMin, safeMax, config.floor, config.ceiling, format]);

  const emitChange = useCallback(
    (nextMin: number, nextMax: number) => {
      const normalizedMin = Math.min(nextMin, nextMax);
      const normalizedMax = Math.max(nextMin, nextMax);
      onChange(
        normalizedMin <= config.floor ? "" : normalizedMin,
        normalizedMax >= config.ceiling ? "" : normalizedMax
      );
    },
    [config.floor, config.ceiling, onChange]
  );

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-navy-600 dark:text-white/60">טווח מחירים</span>
        <span className="font-mono text-xs tabular-nums text-gold-600 dark:text-gold-400">{label}</span>
      </div>

      <div className="price-range-slider relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-navy-200/80 dark:bg-white/10" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-l from-gold-600 to-gold-400"
          style={{
            insetInlineStart: `${minPercent}%`,
            width: `${Math.max(maxPercent - minPercent, 0)}%`,
          }}
        />
        <input
          type="range"
          min={config.floor}
          max={config.ceiling}
          step={config.step}
          value={safeMin}
          onChange={(e) => emitChange(Number(e.target.value), safeMax)}
          className="price-range-slider__input price-range-slider__input--min"
          aria-label="מחיר מינימום"
        />
        <input
          type="range"
          min={config.floor}
          max={config.ceiling}
          step={config.step}
          value={safeMax}
          onChange={(e) => emitChange(safeMin, Number(e.target.value))}
          className="price-range-slider__input price-range-slider__input--max"
          aria-label="מחיר מקסימום"
        />
      </div>
    </div>
  );
}
