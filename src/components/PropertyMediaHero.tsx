"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, ImageIcon } from "lucide-react";
import type { Property } from "@/lib/types";
import {
  hasPropertyVirtualTour,
  resolvePropertyCardImage,
} from "@/lib/properties/property-images";

interface PropertyMediaHeroProps {
  property: Property;
  href?: string;
  className?: string;
  priority?: boolean;
}

export default function PropertyMediaHero({
  property,
  href,
  className = "",
  priority = false,
}: PropertyMediaHeroProps) {
  const hasTour = hasPropertyVirtualTour(property);
  const coverSrc = resolvePropertyCardImage(property);

  const inner = (
    <div className={`relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy-900/80 ${className}`}>
      {coverSrc ? (
        <Image
          src={coverSrc}
          alt={property.title}
          fill
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={coverSrc.includes("drive.google.com")}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white/35">
          <ImageIcon className="h-10 w-10" />
          <span className="text-sm tracking-wide">תמונות בקרוב</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
      {hasTour && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-2 rounded-full border border-gold-500/50 bg-navy-950/70 px-4 py-2 text-sm font-medium text-gold-300 backdrop-blur-sm">
            <Play className="h-4 w-4 fill-current" />
            סיור וירטואלי
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block">
        {inner}
      </Link>
    );
  }

  return inner;
}

export function PropertyMatterportEmbed({ url }: { url: string }) {
  if (!url.trim()) return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10">
      <iframe
        src={url}
        title="סיור וירטואלי"
        className="absolute inset-0 h-full w-full"
        allowFullScreen
      />
    </div>
  );
}
