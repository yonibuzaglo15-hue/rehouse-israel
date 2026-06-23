"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { HERO_AREA_CARDS } from "@/lib/hero-content";

const HERO_STATS = [
  { end: 500, suffix: "+", label: "נכסים פעילים" },
  { end: 15, suffix: "+", label: "שנות ניסיון" },
  { end: 98, suffix: "%", label: "שביעות רצון" },
] as const;

const cascadeContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.15,
    },
  },
};

const cascadeItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useCountUp(target: number, active: boolean, duration = 1800): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    let startTime: number | null = null;
    let rafId = 0;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    setCount(0);
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [active, target, duration]);

  return count;
}

function HeroStatCard({
  end,
  suffix,
  label,
  delayOffset = 0,
}: {
  end: number;
  suffix: string;
  label: string;
  delayOffset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const count = useCountUp(end, isInView, 1800 + delayOffset);

  return (
    <motion.div ref={ref} variants={cascadeItem} className="hero-stat-card text-center">
      <div className="min-h-[2rem] font-display text-2xl font-semibold tabular-nums text-[#f2d9a8] sm:min-h-[2.25rem] sm:text-3xl">
        {count}
        {suffix}
      </div>
      <div className="mt-1.5 font-display text-[0.7rem] font-medium tracking-wide text-white/70 sm:text-sm">
        {label}
      </div>
    </motion.div>
  );
}

interface HeroContentProps {
  onBrowseProperties: () => void;
}

function HeroContent({ onBrowseProperties }: HeroContentProps) {
  return (
    <motion.div
      className="hero-content hero-content--layered"
      variants={cascadeContainer}
      initial="hidden"
      animate="visible"
    >
      <div className="hero-content__main">
        <motion.h1
          variants={cascadeItem}
          className="hero-title-shadow max-w-4xl font-display text-[1.85rem] font-bold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          <span className="text-white">מצאו את </span>
          <span className="gold-gradient-text">הבית שלכם</span>
          <br />
          <span className="text-white">באשדוד, אשקלון ויבנה</span>
        </motion.h1>

        <motion.p
          variants={cascadeItem}
          className="hero-subtitle-shadow mt-4 max-w-2xl px-1 font-display text-sm font-light leading-relaxed text-white/90 sm:mt-6 sm:text-base md:text-lg"
        >
          Rehouse Israel — חוויית נדל״ן פרימיום עם ליווי אישי, נכסים נבחרים ושירות ברמה
          בינלאומית
        </motion.p>

        <motion.div
          variants={cascadeItem}
          className="hero-area-cards mt-6 grid w-full max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4"
        >
          {HERO_AREA_CARDS.map((card) => (
            <div key={card.id} className="hero-area-card text-center sm:text-start">
              <div className="font-display text-[0.65rem] font-medium tracking-[0.16em] text-[#c9952e]/80 uppercase">
                {card.city}
              </div>
              <div className="mt-1 font-display text-sm font-semibold text-white sm:text-base">
                {card.title}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/65 sm:text-sm">
                {card.description}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={cascadeItem} className="mt-7 w-full sm:mt-8">
          <button type="button" onClick={onBrowseProperties} className="hero-cta-btn">
            <span className="hero-cta-btn-label">נכסים למכירה</span>
          </button>
        </motion.div>

        <motion.div variants={cascadeItem} className="w-full max-w-[52rem]">
          <motion.div
            variants={cascadeContainer}
            initial="hidden"
            animate="visible"
            className="hero-stats-grid"
          >
            {HERO_STATS.map((stat, index) => (
              <HeroStatCard
                key={stat.label}
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
                delayOffset={index * 120}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default memo(HeroContent);
