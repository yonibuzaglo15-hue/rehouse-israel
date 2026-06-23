"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Bed, Flame } from "lucide-react";
import type { Property } from "@/lib/types";
import { formatPrice, getCityLabel } from "@/lib/constants";
import {
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_STYLES,
} from "@/lib/properties/labels";
import { resolvePropertyCardImage } from "@/lib/properties/property-images";

interface HotPropertiesSliderProps {
  properties: Property[];
}

function useVisibleCount(): number {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      if (width >= 1280) setCount(3);
      else if (width >= 768) setCount(2);
      else setCount(1);
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return count;
}

export default function HotPropertiesSlider({ properties }: HotPropertiesSliderProps) {
  const visibleCount = useVisibleCount();
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(0, properties.length - visibleCount);

  const goTo = useCallback(
    (direction: "prev" | "next") => {
      setActiveIndex((current) => {
        if (direction === "next") return Math.min(current + 1, maxIndex);
        return Math.max(current - 1, 0);
      });
    },
    [maxIndex]
  );

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  if (properties.length === 0) return null;

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < maxIndex;
  const slidePercent = visibleCount > 0 ? 100 / visibleCount : 100;

  return (
    <section className="relative overflow-hidden py-20 sm:py-24" aria-label="נכסים חמים">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-white to-slate-50 dark:from-navy-950 dark:via-navy-900/50 dark:to-navy-950" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,149,46,0.06),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium tracking-widest text-gold-400 uppercase">
              <Flame className="h-3.5 w-3.5" />
              נכסים חמים
            </span>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              הנכסים <span className="gold-gradient-text">הנבחרים</span> שלנו
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-600 dark:text-white/50">
              נכסים מומלצים שנבחרו בקפידה על ידי צוות הסוכנים — הזדמנויות שלא כדאי לפספס
            </p>
          </motion.div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goTo("prev")}
              disabled={!canGoPrev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-700 transition-colors hover:border-gold-500/40 hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:text-gold-300"
              aria-label="נכס קודם"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo("next")}
              disabled={!canGoNext}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-700 transition-colors hover:border-gold-500/40 hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:text-gold-300"
              aria-label="נכס הבא"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" dir="rtl">
          <motion.div
            className="flex gap-5"
            animate={{ x: `-${activeIndex * slidePercent}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
          >
            {properties.map((property, index) => (
              <HotPropertyCard
                key={property.id}
                property={property}
                index={index}
                slidePercent={slidePercent}
              />
            ))}
          </motion.div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={[
                "h-2 rounded-full transition-all",
                index === activeIndex
                  ? "w-6 bg-gold-500"
                  : "w-2 bg-navy-200 dark:bg-white/20",
              ].join(" ")}
              aria-label={`עבור לשקופית ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/properties" className="luxury-btn-ghost inline-flex">
            לכל הנכסים
          </Link>
        </div>
      </div>
    </section>
  );
}

function HotPropertyCard({
  property,
  index,
  slidePercent,
}: {
  property: Property;
  index: number;
  slidePercent: number;
}) {
  const imageSrc = resolvePropertyCardImage(property);
  const status = property.status ?? "active";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="hot-property-card group shrink-0"
      style={{ width: `calc(${slidePercent}% - 0.85rem)` }}
    >
      <Link href={`/properties/${property.id}`} className="block">
        <div className="glass-panel overflow-hidden rounded-2xl transition-all duration-400 group-hover:-translate-y-1 group-hover:border-gold-500/30 group-hover:shadow-xl group-hover:shadow-gold-500/10">
          <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                unoptimized={
                  imageSrc.startsWith("/images/") ||
                  imageSrc.includes("googleusercontent.com")
                }
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent" />

            <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-gold-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-navy-950">
                חם
              </span>
              <span className="rounded-full bg-navy-950/75 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                {property.listingType === "buy" ? "מכירה" : "השכרה"}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm ${PROPERTY_STATUS_STYLES[status]}`}
              >
                {PROPERTY_STATUS_LABELS[status]}
              </span>
            </div>

            <div className="absolute bottom-3 start-3 end-3">
              <div className="font-display text-xl font-bold text-white">
                {formatPrice(property.price, property.listingType)}
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="truncate font-display text-base font-semibold text-slate-900 transition-colors group-hover:text-gold-600 dark:text-white dark:group-hover:text-gold-300">
              {property.title}
            </h3>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-600 dark:text-white/50">
              <MapPin className="h-3 w-3 shrink-0 text-gold-600/80 dark:text-gold-500/70" />
              <span className="truncate">
                {getCityLabel(property.city)} · {property.neighborhood}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-700 dark:text-white/60">
              <Bed className="h-3.5 w-3.5" />
              {property.rooms} חדרים
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
