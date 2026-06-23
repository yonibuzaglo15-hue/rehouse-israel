import Image from "next/image";
import Link from "next/link";
import { BRAND, HERO_LOGO_DIMENSIONS } from "@/lib/brand";

export const LOGO_SRC = BRAND.heroLogoSrc;

type LogoVariant = "header" | "hero" | "footer";

interface LogoProps {
  variant?: LogoVariant;
  /** @deprecated Use variant="header" | "footer" | "hero" */
  size?: "sm" | "md" | "lg";
  linked?: boolean;
  showTagline?: boolean;
  className?: string;
}

const VARIANT_WIDTH: Record<LogoVariant, { mobile: number; desktop: number }> = {
  header: { mobile: 100, desktop: 140 },
  hero: { mobile: 220, desktop: 340 },
  footer: { mobile: 140, desktop: 180 },
};

const LEGACY_SIZE: Record<"sm" | "md" | "lg", LogoVariant> = {
  sm: "header",
  md: "footer",
  lg: "hero",
};

export default function Logo({
  variant,
  size,
  linked = true,
  showTagline = false,
  className = "",
}: LogoProps) {
  const resolvedVariant = variant ?? (size ? LEGACY_SIZE[size] : "header");
  const widths = VARIANT_WIDTH[resolvedVariant];
  const isHeader = resolvedVariant === "header";

  const img = (
    <Image
      src={BRAND.heroLogoSrc}
      alt={`${BRAND.nameEn} — ${BRAND.nameHe}`}
      width={HERO_LOGO_DIMENSIONS.width}
      height={HERO_LOGO_DIMENSIONS.height}
      className={[
        "h-auto w-full object-contain object-center",
        `logo--${resolvedVariant}`,
        isHeader ? "site-header__logo-img" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--logo-w-mobile": `${widths.mobile}px`,
          "--logo-w-desktop": `${widths.desktop}px`,
          maxWidth: widths.mobile,
        } as React.CSSProperties
      }
      sizes={
        resolvedVariant === "header"
          ? "(max-width: 768px) 100px, 140px"
          : resolvedVariant === "hero"
            ? "(max-width: 768px) 220px, 340px"
            : "(max-width: 768px) 140px, 180px"
      }
      priority={isHeader}
    />
  );

  const content = (
    <span className="site-header__brand-inner inline-flex flex-col items-end gap-0.5">
      {img}
      {showTagline && isHeader && (
        <span className="site-header__brand-tagline hidden text-end lg:block">
          {BRAND.tagline}
        </span>
      )}
    </span>
  );

  if (!linked) return <span className="inline-flex shrink-0">{content}</span>;

  return (
    <Link
      href="/"
      className="site-header__brand inline-flex shrink-0 items-center transition-opacity hover:opacity-90"
      aria-label={`${BRAND.nameEn} — חזרה לדף הבית`}
    >
      {content}
    </Link>
  );
}
