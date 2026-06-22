"use client";

import { useCallback, useRef } from "react";
import HeroContent from "@/components/HeroContent";
import HeroScrollMedia from "@/components/HeroScrollMedia";

export default function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToProperties = useCallback(() => {
    if (typeof window === "undefined") return;
    document.getElementById("properties")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="video-scroll-container video-scroll-container--home">
      {/* Phase 1–2: hero video walk. Phase 3: #brand-reveal-overlay (globe + REHOUSE) */}
      <HeroScrollMedia contentRef={contentRef} />
      <HeroContent contentRef={contentRef} onBrowseProperties={scrollToProperties} />
    </div>
  );
}
