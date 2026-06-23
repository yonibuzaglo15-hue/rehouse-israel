"use client";

import { memo, useEffect, useRef, useState, type RefObject } from "react";
import type gsap from "gsap";
import type { ScrollTrigger as ScrollTriggerPlugin } from "gsap/ScrollTrigger";
import { IMAGES } from "@/lib/images";
import {
  describeVideo,
  heroDebug,
  waitForDomRefs,
  waitForVideoReady,
} from "@/lib/hero/video-ready";
import HeroEvaporatingLogo, {
  type HeroEvaporatingLogoHandle,
} from "@/components/HeroEvaporatingLogo";
import HeroScrollHint from "@/components/HeroScrollHint";
import HeroBrandBadge from "@/components/HeroBrandBadge";
import HeroBackground from "@/components/HeroBackground";
import { BRAND } from "@/lib/brand";

const SCRUB_SMOOTHING = 0.35;
const HERO_VIDEO_DURATION = 10;
const PIN_SCROLL_DISTANCE = "+=300%";
const CONTENT_FADE_START = 0.82;

/** Phases 1–2: background video only (0% → 67%) */
const PHASE_3_START = 0.67;
/** Phase 3: golden globe + REHOUSE brand reveal (67% → 100%) */
const PHASE_3_DURATION = 1 - PHASE_3_START;

interface HeroScrollMediaProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

function HeroScrollMedia({ contentRef }: HeroScrollMediaProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const animationTrackRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);
  const brandRevealRef = useRef<HTMLDivElement>(null);
  const logoCanvasRef = useRef<HeroEvaporatingLogoHandle>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;

    let isActive = true;
    let timeline: gsap.core.Timeline | null = null;
    let ScrollTriggerInstance: typeof ScrollTriggerPlugin | null = null;

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

    const refreshScrollTrigger = (reason: string) => {
      if (!ScrollTriggerInstance) return;
      heroDebug(`ScrollTrigger.refresh (${reason})`);
      ScrollTriggerInstance.refresh();
    };

    const initScrollTimeline = async () => {
      heroDebug("initScrollTimeline:start");

      const refs = await waitForDomRefs(
        () => ({
          animationTrack: animationTrackRef.current,
          videoWrapper: videoWrapperRef.current,
          heroVideo: heroVideoRef.current,
          logoVideo: logoVideoRef.current,
          brandReveal: brandRevealRef.current,
        }),
        (value) =>
          Boolean(
            value.animationTrack &&
              value.videoWrapper &&
              value.heroVideo &&
              value.logoVideo &&
              value.brandReveal
          )
      );

      if (!isActive) return;

      const { videoWrapper, heroVideo, logoVideo, brandReveal } = refs;

      heroDebug("refs:ready", {
        hero: describeVideo(heroVideo!, "hero"),
        logo: describeVideo(logoVideo!, "logo"),
        phase3Start: PHASE_3_START,
      });

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (!isActive) return;

      ScrollTriggerInstance = ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      gsap.config({ force3D: true, nullTargetWarn: false });

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        heroDebug("prefers-reduced-motion:skip-animation");
        heroVideo!.pause();
        logoVideo!.pause();
        heroVideo!.currentTime = 0;
        logoVideo!.currentTime = 0;
        gsap.set(brandReveal, { autoAlpha: 0 });
        if (contentRef.current) {
          contentRef.current.style.opacity = "1";
          contentRef.current.style.visibility = "visible";
        }
        return;
      }

      let staticFallback = false;

      try {
        await Promise.all([
          waitForVideoReady(heroVideo!, "hero"),
          waitForVideoReady(logoVideo!, "logo"),
        ]);
      } catch (error) {
        heroDebug("video:fallback", error);
        staticFallback = true;
        setUseStaticFallback(true);
      }

      if (!isActive) return;

      heroVideo!.pause();
      logoVideo!.pause();

      if (staticFallback) {
        heroVideo!.style.opacity = "0";
        logoVideo!.style.display = "none";
      } else {
        heroVideo!.currentTime = 0;
        logoVideo!.currentTime = 0;
        heroVideo!.style.opacity = "1";
      }

      gsap.set(brandReveal, {
        autoAlpha: 0,
        scale: 0.96,
        force3D: true,
      });

      timeline?.scrollTrigger?.kill();
      timeline?.kill();

      const agentDuration =
        heroVideo!.duration && Number.isFinite(heroVideo!.duration) && heroVideo!.duration > 0
          ? heroVideo!.duration
          : HERO_VIDEO_DURATION;

      const logoDuration =
        logoVideo!.duration && Number.isFinite(logoVideo!.duration) && logoVideo!.duration > 0
          ? logoVideo!.duration
          : HERO_VIDEO_DURATION;

      heroDebug("timeline:durations", { agentDuration, logoDuration });

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: videoWrapper,
          start: "top top",
          end: PIN_SCROLL_DISTANCE,
          pin: true,
          scrub: SCRUB_SMOOTHING,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            updateContentVisibility(self.progress);
            if (self.progress >= PHASE_3_START - 0.01) {
              logoCanvasRef.current?.scheduleRedraw();
            }
          },
        },
      });

      if (!staticFallback) {
        timeline.to(
          heroVideo,
          { currentTime: agentDuration, ease: "none", duration: PHASE_3_START },
          0
        );

        timeline.to(
          logoVideo,
          { currentTime: logoDuration, ease: "none", duration: PHASE_3_DURATION },
          PHASE_3_START
        );
      }

      timeline.to(
        brandReveal,
        {
          autoAlpha: 1,
          scale: 1,
          ease: "power2.out",
          duration: PHASE_3_DURATION,
          force3D: true,
        },
        PHASE_3_START
      );

      if (timeline.scrollTrigger) {
        heroDebug("ScrollTrigger:connected", {
          progress: timeline.scrollTrigger.progress,
          start: timeline.scrollTrigger.start,
          end: timeline.scrollTrigger.end,
          isActive: timeline.scrollTrigger.isActive,
          brandRevealHidden: timeline.scrollTrigger.progress < PHASE_3_START,
        });
        updateContentVisibility(timeline.scrollTrigger.progress);
      } else {
        heroDebug("ScrollTrigger:missing-after-timeline");
      }

      requestAnimationFrame(() => refreshScrollTrigger("post-timeline-raf"));
      window.setTimeout(() => refreshScrollTrigger("post-timeline-timeout"), 250);
    };

    const onResize = () => refreshScrollTrigger("resize");
    const onWindowLoad = () => refreshScrollTrigger("window-load");

    initScrollTimeline().catch((error) => {
      console.error("[HeroScrollMedia] initScrollTimeline failed", error);
    });

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("load", onWindowLoad);

    return () => {
      isActive = false;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onWindowLoad);
      timeline?.scrollTrigger?.kill();
      timeline?.kill();
      timeline = null;
      heroDebug("cleanup:timeline-killed");
    };
  }, [contentRef, isHydrated]);

  return (
    <div ref={animationTrackRef} className="hero-animation-track">
      <div ref={videoWrapperRef} className="video-wrapper hero-video-stage">
        <HeroBackground />

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

        {useStaticFallback ? (
          <div
            ref={brandRevealRef}
            className="brand-reveal-overlay flex items-center justify-center"
          >
            <img
              src={BRAND.heroLogoSrc}
              alt=""
              className="h-auto w-[min(72vw,420px)] max-w-full object-contain drop-shadow-2xl"
            />
          </div>
        ) : (
          <HeroEvaporatingLogo
            ref={logoCanvasRef}
            logoVideoRef={logoVideoRef}
            logoLayerRef={brandRevealRef}
          />
        )}

        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1929]/35 via-transparent to-[#0a1929]/35"
          aria-hidden
        />
        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1929]/30 via-transparent to-[#0a1929]/80"
          aria-hidden
        />
        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_85%,rgba(10,25,41,0.55)_0%,transparent_55%)]"
          aria-hidden
        />

        <div
          className="hero-cinematic-overlays pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -top-1/4 -end-1/4 h-[600px] w-[600px] rounded-full bg-[#c9952e]/[0.06] blur-3xl" />
          <div className="absolute -bottom-1/4 -start-1/4 h-[500px] w-[500px] rounded-full bg-navy-700/25 blur-3xl" />
        </div>

        <HeroBrandBadge layout="compact" className="hero-brand-badge--video-overlay" />

        <HeroScrollHint />
      </div>
    </div>
  );
}

export default memo(HeroScrollMedia);
