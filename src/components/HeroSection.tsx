"use client";

import { useCallback } from "react";
import Hero from "@/components/Hero";
import HeroContent from "@/components/HeroContent";

export default function HeroSection() {
  const scrollToProperties = useCallback(() => {
    if (typeof window === "undefined") return;
    document.getElementById("property-search")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <Hero showLogo={false}>
      <HeroContent onBrowseProperties={scrollToProperties} />
    </Hero>
  );
}
