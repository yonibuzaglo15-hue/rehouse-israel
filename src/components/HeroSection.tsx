"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerPlugin } from "gsap/ScrollTrigger";
import { IMAGES } from "@/lib/images";
import { HERO_AREA_CARDS } from "@/lib/hero-content";
import HeroEvaporatingLogo from "@/components/HeroEvaporatingLogo";

const SCRUB_SMOOTHING = 0.5;
const HERO_VIDEO_DURATION = 10;
const PIN_SCROLL_DISTANCE = "+=300%";
const LOGO_PHASE_RATIO = 0.5;
const CONTENT_FADE_START = 0.82;
const LOGO_FADE_START = 0.4;

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
    <motion.div
      ref={ref}
      variants={cascadeItem}
      className="hero-stat-card text-center"
    >
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

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationTrackRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);
  const logoLayerRef = useRef<HTMLDivElement>(null);

  const scrollToProperties = () => {
    if (typeof window === "undefined") return;
    document.getElementById("properties")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const animationTrack = animationTrackRef.current;
    const videoWrapper = videoWrapperRef.current;
    const heroVideo = heroVideoRef.current;
    const logoVideo = logoVideoRef.current;
    const logoLayer = logoLayerRef.current;
    if (!animationTrack || !videoWrapper || !heroVideo || !logoVideo || !logoLayer) return;

    let isActive = true;
    let timeline: gsap.core.Timeline | null = null;
    let ScrollTriggerInstance: typeof ScrollTriggerPlugin | null = null;

    const waitForVideoMetadata = (video: HTMLVideoElement): Promise<void> =>
      new Promise((resolve) => {
        if (video.readyState >= 1) {
          resolve();
          return;
        }
        video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      });

    const updateContentVisibility = (scrollProgress: number) => {
      if (!contentRef.current) return;

      if (scrollProgress < CONTENT_FADE_START) {
        contentRef.current.style.opacity = "0";
        contentRef.current.style.visibility = "hidden";
        contentRef.current.style.pointerEvents = "none";
        return;
      }

      const opacity = Math.min(
        1,
        (scrollProgress - CONTENT_FADE_START) / (1 - CONTENT_FADE_START)
      );
      contentRef.current.style.opacity = String(opacity);
      contentRef.current.style.visibility = opacity > 0.02 ? "visible" : "hidden";
      contentRef.current.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    };

    const initScrollTimeline = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (!isActive) return;

      ScrollTriggerInstance = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        heroVideo.pause();
        logoVideo.pause();
        heroVideo.currentTime = 0;
        logoVideo.currentTime = 0;
        logoLayer.style.opacity = "0";
        logoLayer.style.visibility = "hidden";
        if (contentRef.current) {
          contentRef.current.style.opacity = "1";
          contentRef.current.style.visibility = "visible";
        }
        return;
      }

      await Promise.all([
        waitForVideoMetadata(heroVideo),
        waitForVideoMetadata(logoVideo),
      ]);

      if (!isActive) return;

      heroVideo.pause();
      logoVideo.pause();
      heroVideo.currentTime = 0;
      logoVideo.currentTime = 0;

      gsap.set(logoLayer, { opacity: 1, scale: 1, visibility: "visible" });
      logoLayer.style.pointerEvents = "none";

      timeline?.scrollTrigger?.kill();
      timeline?.kill();

      const agentDuration =
        heroVideo.duration && !Number.isNaN(heroVideo.duration)
          ? heroVideo.duration
          : HERO_VIDEO_DURATION;

      const logoDuration =
        logoVideo.duration && !Number.isNaN(logoVideo.duration)
          ? logoVideo.duration
          : HERO_VIDEO_DURATION;

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: videoWrapper,
          start: "top top",
          end: PIN_SCROLL_DISTANCE,
          pin: true,
          scrub: SCRUB_SMOOTHING,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateContentVisibility(self.progress);
            if (self.progress >= 0.995) {
              logoLayer.style.opacity = "0";
              logoLayer.style.visibility = "hidden";
              logoLayer.style.pointerEvents = "none";
            } else if (self.progress < LOGO_FADE_START + 0.1) {
              logoLayer.style.visibility = "visible";
              logoLayer.style.pointerEvents = "none";
            } else {
              logoLayer.style.opacity = "0";
              logoLayer.style.visibility = "hidden";
              logoLayer.style.pointerEvents = "none";
            }
          },
        },
      });

      timeline.to(
        heroVideo,
        { currentTime: agentDuration, ease: "none", duration: 1 },
        0
      );

      timeline.to(
        logoVideo,
        { currentTime: logoDuration, ease: "none", duration: LOGO_PHASE_RATIO },
        0
      );

      timeline.fromTo(
        logoLayer,
        { opacity: 1, scale: 1 },
        {
          opacity: 0,
          scale: 1.04,
          ease: "power3.out",
          duration: LOGO_PHASE_RATIO - LOGO_FADE_START,
        },
        LOGO_FADE_START
      );

      if (timeline.scrollTrigger) {
        updateContentVisibility(timeline.scrollTrigger.progress);
      }

      ScrollTrigger.refresh();
    };

    const onResize = () => {
      if (!isActive || !ScrollTriggerInstance) return;
      ScrollTriggerInstance.refresh();
    };

    initScrollTimeline().catch(() => {});
    window.addEventListener("resize", onResize);

    return () => {
      isActive = false;
      window.removeEventListener("resize", onResize);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      timeline = null;
    };
  }, []);

  return (
    <div ref={containerRef} className="video-scroll-container video-scroll-container--home">
      <div ref={animationTrackRef} className="hero-animation-track">
        <div ref={videoWrapperRef} className="video-wrapper">
        <video
          ref={heroVideoRef}
          className="hero-video"
          muted
          playsInline
          preload="auto"
          poster={IMAGES.hero.posterLow}
        >
          <source src={IMAGES.hero.video} type="video/mp4" />
        </video>

        <HeroEvaporatingLogo
          logoVideoRef={logoVideoRef}
          logoLayerRef={logoLayerRef}
        />

        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1929]/25 via-transparent to-[#0a1929]/25"
          aria-hidden
        />
        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1929]/75"
          aria-hidden
        />
        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_85%,rgba(10,25,41,0.45)_0%,transparent_55%)]"
          aria-hidden
        />

        <div className="hero-cinematic-overlays pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-1/4 -end-1/4 h-[600px] w-[600px] rounded-full bg-[#c9952e]/[0.06] blur-3xl" />
          <div className="absolute -bottom-1/4 -start-1/4 h-[500px] w-[500px] rounded-full bg-navy-700/25 blur-3xl" />
        </div>

        <div className="hero-scroll-hint" aria-hidden>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-white/40"
          >
            <span className="font-display text-xs tracking-[0.18em]">גללו למטה</span>
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </div>
        </div>
      </div>

      <motion.div
        ref={contentRef}
        className="hero-content"
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
            Rehouse Israel — חוויית נדל״ן פרימיום עם ליווי אישי, נכסים נבחרים
            ושירות ברמה בינלאומית
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
            <button
              type="button"
              onClick={scrollToProperties}
              className="hero-cta-btn"
            >
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
    </div>
  );
}
