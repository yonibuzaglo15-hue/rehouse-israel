import Image from "next/image";
import Link from "next/link";
import { BRAND, HERO_LOGO_DIMENSIONS } from "@/lib/brand";
import HeroBackground from "@/components/HeroBackground";

export type HeroHeight = "screen" | "tall" | "front";

export interface HeroProps {
  children?: React.ReactNode;
  /** `front` = homepage logo overlay; `screen` = full viewport; `tall` = capped viewport */
  height?: HeroHeight;
  showLogo?: boolean;
  /** `front` uses the dedicated hero overlay asset */
  logoVariant?: "default" | "front";
  className?: string;
}

const HEIGHT_CLASS: Record<HeroHeight, string> = {
  front: "hero-layered--front min-h-[min(62svh,640px)] h-[min(62svh,640px)] max-h-[720px]",
  screen: "min-h-[600px] h-screen max-h-[100svh]",
  tall: "min-h-[600px] h-[85svh] max-h-[900px]",
};

export default function Hero({
  children,
  height = "screen",
  showLogo = true,
  logoVariant = "default",
  className = "",
}: HeroProps) {
  const logoSrc =
    logoVariant === "front" ? BRAND.heroFrontLogoSrc : BRAND.heroLogoSrc;

  return (
    <section
      className={[
        "hero-layered relative isolate flex w-full flex-col overflow-hidden",
        HEIGHT_CLASS[height],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Rehouse Israel — נדל״ן יוקרה"
    >
      <HeroBackground />

      {showLogo ? (
        <div
          className={[
            "hero-layered__logo absolute z-10",
            height === "front" ? "hero-layered__logo--front" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Link
            href="/"
            className="hero-layered__logo-link inline-block"
            aria-label={`${BRAND.nameEn} — ${BRAND.nameHe}`}
          >
            <Image
              src={logoSrc}
              alt={`${BRAND.nameEn} — ${BRAND.nameHe}`}
              width={HERO_LOGO_DIMENSIONS.width}
              height={HERO_LOGO_DIMENSIONS.height}
              className="hero-layered__logo-img h-auto w-full object-contain"
              sizes={
                height === "front"
                  ? "(max-width: 640px) 88vw, (max-width: 1024px) 72vw, 540px"
                  : "(max-width: 640px) 72vw, (max-width: 1024px) 50vw, 520px"
              }
              priority
            />
          </Link>
        </div>
      ) : null}

      {children ? (
        <div className="hero-layered__content relative z-20 flex flex-1 flex-col justify-end">
          {children}
        </div>
      ) : null}
    </section>
  );
}
