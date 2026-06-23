import Image from "next/image";
import { BRAND, LOGO_DIMENSIONS } from "@/lib/brand";

interface HeroBrandBadgeProps {
  /** compact = floating video overlay; full = content card with Hebrew name */
  layout?: "compact" | "full";
  className?: string;
}

export default function HeroBrandBadge({
  layout = "full",
  className = "",
}: HeroBrandBadgeProps) {
  const isCompact = layout === "compact";

  return (
    <div
      className={[
        "hero-brand-badge",
        isCompact ? "hero-brand-badge--compact" : "hero-brand-badge--full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${BRAND.nameEn} ${BRAND.nameHe}`}
    >
      <div className="hero-brand-badge__backdrop" aria-hidden />

      <div className="hero-brand-badge__content">
        <Image
          src={BRAND.logoSrc}
          alt=""
          width={LOGO_DIMENSIONS.width}
          height={LOGO_DIMENSIONS.height}
          className="hero-brand-badge__logo"
          sizes={isCompact ? "120px" : "(max-width: 768px) 160px, 220px"}
          priority={!isCompact}
          aria-hidden
        />

        {!isCompact && (
          <div className="hero-brand-badge__text">
            <p className="hero-brand-badge__name-en">{BRAND.nameEn}</p>
            <p className="hero-brand-badge__name-he">{BRAND.nameHe}</p>
            <p className="hero-brand-badge__tagline">{BRAND.tagline}</p>
          </div>
        )}
      </div>
    </div>
  );
}
