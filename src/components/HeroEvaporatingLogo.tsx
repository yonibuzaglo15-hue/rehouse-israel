"use client";

import { useEffect, useRef, type RefObject } from "react";
import { IMAGES } from "@/lib/images";

const GRAY_MIN = 80;
const GRAY_MAX = 160;
const BLACK_MAX = 45;
const NEUTRAL_SPREAD = 22;
const CHROMA_SOFTNESS = 20;

/** Navy site background from hero palette */
const NAVY_KEY = { r: 10, g: 25, b: 41 };
const NAVY_THRESHOLD = 50;

interface HeroEvaporatingLogoProps {
  logoVideoRef: RefObject<HTMLVideoElement | null>;
  logoLayerRef: RefObject<HTMLDivElement | null>;
}

/** Warm gold/brass pixels — keep visible, do not key */
function isGoldPixel(r: number, g: number, b: number): boolean {
  const spread = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (spread < 28) return false;

  const max = Math.max(r, g, b);
  if (max < 95) return false;

  return r >= 105 && g >= 65 && r >= g && g >= b && r - b >= 35;
}

/** Globe / teal-blue accents — keep visible */
function isGlobePixel(r: number, g: number, b: number): boolean {
  const spread = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  if (spread < 24) return false;

  const max = Math.max(r, g, b);
  if (max < 70) return false;

  return b >= 80 && g >= 55 && b >= r && b - r >= 18;
}

function isForegroundPixel(r: number, g: number, b: number): boolean {
  return isGoldPixel(r, g, b) || isGlobePixel(r, g, b);
}

/**
 * Returns 0 = keep pixel, 1 = fully transparent, (0,1) = soft edge
 */
function getKeyMix(r: number, g: number, b: number): number {
  if (isForegroundPixel(r, g, b)) return 0;

  const spread = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const isNeutral = spread <= NEUTRAL_SPREAD;

  // Black grid squares
  if (r <= BLACK_MAX && g <= BLACK_MAX && b <= BLACK_MAX) return 1;

  // Checkerboard grays: R, G, B very close in the 80–160 band
  if (isNeutral && minC >= GRAY_MIN && maxC <= GRAY_MAX) return 1;

  // Dark neutral grays below the mid band
  if (isNeutral && maxC > BLACK_MAX && maxC < GRAY_MIN) return 1;

  // Light neutral grays / off-white grid cells above the band
  if (isNeutral && minC > GRAY_MAX && maxC <= 235) return 1;

  // Navy hero background with soft edge
  const dr = r - NAVY_KEY.r;
  const dg = g - NAVY_KEY.g;
  const db = b - NAVY_KEY.b;
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  if (dist < NAVY_THRESHOLD) return 1;
  if (dist < NAVY_THRESHOLD + CHROMA_SOFTNESS) {
    return (dist - NAVY_THRESHOLD) / CHROMA_SOFTNESS;
  }

  return 0;
}

export default function HeroEvaporatingLogo({
  logoVideoRef,
  logoLayerRef,
}: HeroEvaporatingLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const video = logoVideoRef.current;
    const canvas = canvasRef.current;
    const layer = logoLayerRef.current;
    const wrapper = layer?.parentElement;
    if (!video || !canvas || !wrapper) return;

    const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
    if (!ctx) return;

    let active = true;
    let dpr = 1;

    const resizeCanvas = () => {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      if (!w || !h) return;

      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawKeyedFrame = () => {
      if (!active) return;

      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      if (!w || !h || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
        return;
      }

      const scale = Math.max(w / video.videoWidth, h / video.videoHeight);
      const dw = video.videoWidth * scale;
      const dh = video.videoHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(video, dx, dy, dw, dh);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const keyMix = getKeyMix(data[i], data[i + 1], data[i + 2]);
        if (keyMix >= 1) {
          data[i + 3] = 0;
        } else if (keyMix > 0) {
          data[i + 3] = Math.round(data[i + 3] * keyMix);
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    const renderLoop = () => {
      if (!active) return;
      drawKeyedFrame();
      rafRef.current = requestAnimationFrame(renderLoop);
    };

    const onResize = () => resizeCanvas();
    const onCanPlay = () => {
      resizeCanvas();
      if (!rafRef.current) renderLoop();
    };

    resizeCanvas();
    window.addEventListener("resize", onResize);

    if (video.readyState >= 2) {
      onCanPlay();
    } else {
      video.addEventListener("canplay", onCanPlay, { once: true });
    }

    return () => {
      active = false;
      window.removeEventListener("resize", onResize);
      video.removeEventListener("canplay", onCanPlay);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [logoVideoRef, logoLayerRef]);

  return (
    <div ref={logoLayerRef} className="hero-evaporating-logo" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-evaporating-logo__canvas" />
      <video
        ref={logoVideoRef}
        className="hero-evaporating-logo__source"
        src={IMAGES.hero.logoOverlay}
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}
