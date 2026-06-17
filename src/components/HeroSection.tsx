"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IMAGES } from "@/lib/images";

gsap.registerPlugin(ScrollTrigger);

const SCRUB_SMOOTHING = 1.5;

const HERO_STATS = [
  { value: "500+", label: "נכסים פעילים" },
  { value: "15+", label: "שנות ניסיון" },
  { value: "98%", label: "שביעות רצון" },
] as const;

const cascadeContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.12,
    },
  },
};

const cascadeItem = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      video.currentTime = 0;
      return;
    }

    let isActive = true;
    let scrollTrigger: ScrollTrigger | null = null;
    let rafId = 0;
    let pendingProgress = 0;

    const applyVideoTime = () => {
      rafId = 0;
      if (!isActive || !video.duration || Number.isNaN(video.duration)) return;
      video.currentTime = pendingProgress * video.duration;
    };

    const scheduleVideoUpdate = (progress: number) => {
      if (!isActive) return;
      pendingProgress = progress;
      if (!rafId) {
        rafId = requestAnimationFrame(applyVideoTime);
      }
    };

    const destroyScrollTrigger = () => {
      if (scrollTrigger) {
        scrollTrigger.kill();
        scrollTrigger = null;
      }
    };

    const initScrollTrigger = () => {
      if (!isActive) return;

      destroyScrollTrigger();

      scrollTrigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        scrub: SCRUB_SMOOTHING,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          scheduleVideoUpdate(self.progress);
        },
      });

      scheduleVideoUpdate(scrollTrigger.progress);
    };

    const onMetadata = () => {
      if (!isActive) return;
      video.pause();
      video.currentTime = 0;
      initScrollTrigger();
      ScrollTrigger.refresh();
    };

    const onResize = () => {
      if (!isActive) return;
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      onMetadata();
    } else {
      video.addEventListener("loadedmetadata", onMetadata, { once: true });
    }

    window.addEventListener("resize", onResize);

    return () => {
      isActive = false;
      window.removeEventListener("resize", onResize);
      video.removeEventListener("loadedmetadata", onMetadata);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      destroyScrollTrigger();
    };
  }, []);

  return (
    <div ref={containerRef} className="video-scroll-container">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          className="hero-video"
          muted
          playsInline
          preload="auto"
          poster={IMAGES.hero.posterLow}
        >
          <source src={IMAGES.hero.video} type="video/mp4" />
        </video>

        {/* Cinematic overlays — layered for headline readability over moving video */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1929]/75 via-[#0a1929]/20 to-[#0a1929]/75"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1929]/80 via-[#0a1929]/45 to-[#0a1929]/85"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,rgba(10,25,41,0.55)_0%,transparent_70%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,25,41,0.4)_100%)]"
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-1/4 -end-1/4 h-[600px] w-[600px] rounded-full bg-[#c9952e]/[0.06] blur-3xl" />
          <div className="absolute -bottom-1/4 -start-1/4 h-[500px] w-[500px] rounded-full bg-navy-700/25 blur-3xl" />
        </div>

        <motion.div
          className="hero-content"
          variants={cascadeContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={cascadeItem}
            className="mb-5 inline-block rounded-full border border-[#c9952e]/35 bg-black/25 px-4 py-1.5 font-display text-[0.65rem] font-medium tracking-[0.2em] text-[#f2d9a8] uppercase backdrop-blur-sm sm:mb-6 sm:px-5 sm:text-xs"
          >
            נדל״ן יוקרה בדרום
          </motion.span>

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
            Rehouse Israel — חוויית נדל״ן פרימיום עם ליווי אישי, נכסים נבחרים
            ושירות ברמה בינלאומית
          </motion.p>

          <motion.div
            variants={cascadeItem}
            className="hero-stats-grid mt-8 sm:mt-12"
          >
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="hero-stat-card text-center">
                <div className="font-display text-2xl font-semibold tabular-nums text-[#f2d9a8] sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1.5 font-display text-[0.7rem] font-medium tracking-wide text-white/70 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={cascadeItem}
            className="absolute bottom-8 start-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2 text-white/40"
            >
              <span className="font-display text-xs tracking-[0.18em]">גללו למטה</span>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
