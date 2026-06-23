"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import HeroContent from "@/components/HeroContent";

const HeroScrollMedia = dynamic(() => import("@/components/HeroScrollMedia"), {
  ssr: false,
  loading: () => (
    <div className="hero-animation-track flex min-h-[100svh] items-center justify-center bg-navy-950">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
    </div>
  ),
});

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToProperties = useCallback(() => {
    if (typeof window === "undefined") return;
    document.getElementById("property-search")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="video-scroll-container video-scroll-container--home">
      <HeroScrollMedia contentRef={contentRef} />

      <div
        ref={contentRef}
        className="hero-content pointer-events-none opacity-0"
        style={{ visibility: "hidden" }}
        aria-hidden
      >
        <HeroContent onBrowseProperties={scrollToProperties} scrollControlled />
      </div>
    </div>
  );
}
