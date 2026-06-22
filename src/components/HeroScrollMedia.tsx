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

const SCRUB_SMOOTHING = 0.35;
const HERO_VIDEO_DURATION = 10;
const PIN_SCROLL_DISTANCE = "+=300%";
const LOGO_PHASE_RATIO = 0.5;
const CONTENT_FADE_START = 0.82;
const LOGO_FADE_START = 0.4;

interface HeroScrollMediaProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

function HeroScrollMedia({ contentRef }: HeroScrollMediaProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const animationTrackRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const logoVideoRef = useRef<HTMLVideoElement>(null);
  const logoLayerRef = useRef<HTMLDivElement>(null);
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
          logoLayer: logoLayerRef.current,
        }),
        (value) =>
          Boolean(
            value.animationTrack &&
              value.videoWrapper &&
              value.heroVideo &&
              value.logoVideo &&
              value.logoLayer
          )
      );

      if (!isActive) return;

      const { videoWrapper, heroVideo, logoVideo, logoLayer } = refs;

      heroDebug("refs:ready", {
        hero: describeVideo(heroVideo!, "hero"),
        logo: describeVideo(logoVideo!, "logo"),
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
        logoLayer!.style.opacity = "0";
        logoLayer!.style.visibility = "hidden";
        if (contentRef.current) {
          contentRef.current.style.opacity = "1";
          contentRef.current.style.visibility = "visible";
        }
        return;
      }

      await Promise.all([
        waitForVideoReady(heroVideo!, "hero"),
        waitForVideoReady(logoVideo!, "logo"),
      ]);

      if (!isActive) return;

      heroVideo!.pause();
      logoVideo!.pause();
      heroVideo!.currentTime = 0;
      logoVideo!.currentTime = 0;

      gsap.set(logoLayer, {
        opacity: 1,
        scale: 1,
        visibility: "visible",
        force3D: true,
      });
      logoLayer!.style.pointerEvents = "none";

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
            logoCanvasRef.current?.scheduleRedraw();
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
        { opacity: 1, scale: 1, force3D: true },
        {
          opacity: 0,
          scale: 1.04,
          ease: "power3.out",
          duration: LOGO_PHASE_RATIO - LOGO_FADE_START,
          force3D: true,
        },
        LOGO_FADE_START
      );

      if (timeline.scrollTrigger) {
        heroDebug("ScrollTrigger:connected", {
          progress: timeline.scrollTrigger.progress,
          start: timeline.scrollTrigger.start,
          end: timeline.scrollTrigger.end,
          isActive: timeline.scrollTrigger.isActive,
        });
        updateContentVisibility(timeline.scrollTrigger.progress);
        logoCanvasRef.current?.scheduleRedraw();
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
          ref={logoCanvasRef}
          logoVideoRef={logoVideoRef}
          logoLayerRef={logoLayerRef}
        />

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

        <HeroScrollHint />
      </div>
    </div>
  );
}

export default memo(HeroScrollMedia);
