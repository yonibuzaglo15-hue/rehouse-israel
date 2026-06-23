"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useHeroCity } from "@/contexts/HeroCityContext";
import { getHeroBackgrounds } from "@/lib/hero-backgrounds";

export default function HeroBackground() {
  const { resolvedTheme } = useTheme();
  const { selectedCity } = useHeroCity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mounted && resolvedTheme === "light";
  const backgrounds = getHeroBackgrounds(selectedCity);

  return (
    <div key={selectedCity} className="hero-bg-city-swap absolute inset-0 z-0">
      <Image
        src={backgrounds.dark}
        alt=""
        fill
        priority
        sizes="100vw"
        className={[
          "absolute inset-0 object-cover object-center transition-opacity duration-700 ease-in-out",
          isLight ? "opacity-0" : "opacity-100",
        ].join(" ")}
        aria-hidden
      />

      <Image
        src={backgrounds.light}
        alt=""
        fill
        priority
        sizes="100vw"
        className={[
          "absolute inset-0 object-cover object-center transition-opacity duration-700 ease-in-out",
          isLight ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />

      <div
        className={[
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700",
          "bg-gradient-to-b from-[#0a1929]/45 via-[#0a1929]/15 to-[#0a1929]/75",
          isLight ? "opacity-0" : "opacity-100",
        ].join(" ")}
        aria-hidden
      />
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700",
          "bg-gradient-to-l from-[#0a1929]/35 via-transparent to-transparent",
          isLight ? "opacity-0" : "opacity-100",
        ].join(" ")}
        aria-hidden
      />

      <div
        className={[
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700",
          "bg-gradient-to-b from-white/25 via-white/10 to-white/35",
          isLight ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700",
          "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_65%)]",
          isLight ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
    </div>
  );
}
