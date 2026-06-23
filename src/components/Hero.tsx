import Image from "next/image";
import Link from "next/link";
import { BRAND, HERO_LOGO_DIMENSIONS } from "@/lib/brand";
import HeroBackground from "@/components/HeroBackground";

export type HeroHeight = "screen" | "tall";

export interface HeroProps {
  children?: React.ReactNode;
  /** `screen` = full viewport; `tall` = min 600px with 85vh cap */
  height?: HeroHeight;
  /** Centered hero logo — off on homepage (header already shows brand) */
  showLogo?: boolean;
  className?: string;
}

const HEIGHT_CLASS: Record<HeroHeight, string> = {
  screen: "min-h-[600px] h-screen max-h-[100svh]",
  tall: "min-h-[600px] h-[85svh] max-h-[900px]",
};

export default function Hero({
  children,
  height = "screen",
  showLogo = true,
  className = "",
}: HeroProps) {
  return (
    <section
      className={[
        "hero-layered relative isolate flex w-full flex-col overflow-hidden transition-colors duration-300",
        HEIGHT_CLASS[height],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Rehouse Israel — נדל״ן יוקרה"
    >
      <HeroBackground />

      {showLogo ? (
        <div className="hero-layered__logo absolute z-10">
          <Link
            href="/"
            className="hero-layered__logo-link group inline-block"
            aria-label={`${BRAND.nameEn} — ${BRAND.nameHe}`}
          >
            <Image
              src={BRAND.heroLogoSrc}
              alt={`${BRAND.nameEn} — ${BRAND.nameHe}`}
              width={HERO_LOGO_DIMENSIONS.width}
              height={HERO_LOGO_DIMENSIONS.height}
              className="hero-layered__logo-img h-auto w-full object-contain"
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 520px"
              priority
            />
          </Link>
        </div>
      ) : null}

      {/* Layer 20 — hero content slot */}
      {children && (
        <div className="hero-layered__content relative z-20 flex flex-1 flex-col justify-end">
          {children}
        </div>
      )}
    </section>
  );
}
