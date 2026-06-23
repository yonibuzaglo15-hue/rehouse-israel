"use client";

import Hero from "@/components/Hero";

/** Full-bleed dynamic background with centered brand logo only — no floating text */
export default function HeroSection() {
  return <Hero height="front" showLogo logoVariant="front" />;
}
