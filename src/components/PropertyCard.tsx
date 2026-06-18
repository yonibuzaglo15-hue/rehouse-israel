"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Maximize,
  Shield,
  Car,
  Sun,
  Building2,
  ImageIcon,
  Play,
} from "lucide-react";
import type { Property } from "@/lib/types";
import { formatPrice, getCityLabel } from "@/lib/constants";
import {
  hasPropertyVirtualTour,
  resolvePropertyCardImage,
} from "@/lib/properties/property-images";

interface PropertyCardProps {
  property: Property;
  index?: number;
  variant?: "luxury" | "dashboard";
}

export default function PropertyCard({
  property,
  index = 0,
  variant = "luxury",
}: PropertyCardProps) {
  if (variant === "dashboard") {
    return <DashboardPropertyCard property={property} index={index} />;
  }

  return <LuxuryPropertyCard property={property} index={index} />;
}

function PropertyCardMedia({
  property,
  className = "",
  sizes,
  priority = false,
}: {
  property: Property;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const imageSrc = resolvePropertyCardImage(property);
  const hasTour = hasPropertyVirtualTour(property);

  return (
    <div className={`relative overflow-hidden bg-navy-900/80 ${className}`}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={property.title}
          fill
          priority={priority}
          className="object-cover"
          sizes={sizes}
          unoptimized={
            imageSrc.startsWith("/images/") ||
            imageSrc.includes("drive.google.com") ||
            imageSrc.includes("googleusercontent.com") ||
            imageSrc.includes("matterport.com")
          }
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white/35">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs tracking-wide">תמונות בקרוב</span>
        </div>
      )}

      {hasTour && (
        <div className="absolute end-3 top-3 flex items-center gap-1 rounded-full border border-gold-500/40 bg-navy-950/75 px-2.5 py-1 text-[11px] font-medium text-gold-300 backdrop-blur-sm">
          <Play className="h-3 w-3 fill-current" />
          סיור
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard: dense, high-contrast, specs always visible ─── */

function DashboardPropertyCard({ property, index }: { property: Property; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Link href={`/properties/${property.id}`} className="group block">
        <div className="dashboard-panel flex overflow-hidden transition-colors hover:border-gold-500/40">
          <PropertyCardMedia
            property={property}
            className="h-full min-h-[9rem] w-36 shrink-0 self-stretch sm:min-h-[10rem] sm:w-44"
            sizes="176px"
          />

          <div className="flex min-w-0 flex-1 flex-col border-s border-white/10">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-navy-900/60 px-3 py-2">
              <span className="font-mono text-base font-bold tabular-nums text-gold-400">
                {formatPrice(property.price, property.listingType)}
              </span>
              <span className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/70">
                {property.listingType === "buy" ? "SALE" : "RENT"}
              </span>
            </div>

            <div className="flex-1 px-3 py-2">
              <h3 className="truncate text-sm font-semibold text-white group-hover:text-gold-300">
                {property.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                <MapPin className="h-3 w-3 shrink-0 text-gold-500/60" />
                <span className="truncate">
                  {getCityLabel(property.city)} · {property.neighborhood}
                </span>
              </div>

              <div className="mt-2 flex gap-3 font-mono text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <Bed className="h-3 w-3 text-white/40" />
                  {property.rooms}
                </span>
                <span className="flex items-center gap-1">
                  <Maximize className="h-3 w-3 text-white/40" />
                  {property.area}מ״ר
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-white/40" />
                  {property.floor}/{property.totalFloors}
                </span>
              </div>
            </div>

            <div className="flex gap-1 border-t border-white/10 bg-navy-950/80 px-3 py-2">
              <QuickSpec active={property.mamad} icon={<Shield className="h-3 w-3" />} label="ממ״ד" />
              <QuickSpec active={property.balcony} icon={<Sun className="h-3 w-3" />} label="מרפסת" />
              <QuickSpec active={property.parking} icon={<Car className="h-3 w-3" />} label="חניה" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

function QuickSpec({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className={active ? "spec-chip-on flex-1 justify-center" : "spec-chip-off flex-1 justify-center"}>
      <span className={active ? "text-emerald-400" : "text-white/20"}>{icon}</span>
      {label}
    </span>
  );
}

/* ─── Luxury: homepage grid cards ─── */

function LuxuryPropertyCard({ property, index }: { property: Property; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <Link href={`/properties/${property.id}`} className="block">
        <div className="glass-panel overflow-hidden rounded-2xl transition-all duration-500 group-hover:border-gold-500/30 group-hover:shadow-xl group-hover:shadow-gold-500/5">
          <div className="relative">
            <PropertyCardMedia
              property={property}
              className="aspect-[4/3]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
            <div className="absolute start-4 top-4 flex gap-2">
              {property.featured && (
                <span className="rounded-full bg-gold-500/90 px-3 py-1 text-xs font-medium text-navy-950">
                  מומלץ
                </span>
              )}
              <span className="rounded-full bg-navy-950/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {property.listingType === "buy" ? "למכירה" : "להשכרה"}
              </span>
            </div>
            <div className="absolute bottom-4 start-4">
              <div className="font-display text-2xl font-bold text-white">
                {formatPrice(property.price, property.listingType)}
              </div>
            </div>
          </div>

          <div className="p-5">
            <h3 className="mb-2 font-display text-lg font-semibold text-white transition-colors group-hover:text-gold-300">
              {property.title}
            </h3>
            <div className="mb-3 flex items-center gap-1.5 text-sm text-white/50">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-gold-500/70" />
              <span>
                {getCityLabel(property.city)}, {property.neighborhood}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Bed className="h-3.5 w-3.5" />
                {property.rooms} חדרים
              </span>
              <span className="flex items-center gap-1.5">
                <Maximize className="h-3.5 w-3.5" />
                {property.area} מ״ר
              </span>
            </div>
            <div className="mt-3 flex gap-1.5">
              <QuickSpec active={property.mamad} icon={<Shield className="h-3 w-3" />} label="ממ״ד" />
              <QuickSpec active={property.balcony} icon={<Sun className="h-3 w-3" />} label="מרפסת" />
              <QuickSpec active={property.parking} icon={<Car className="h-3 w-3" />} label="חניה" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
