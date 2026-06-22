"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  type RefObject,
} from "react";
import { IMAGES } from "@/lib/images";

const GRAY_MIN = 80;
const GRAY_MAX = 160;
const BLACK_MAX = 45;
const NEUTRAL_SPREAD = 22;
const NAVY_KEY_R = 10;
const NAVY_KEY_G = 25;
const NAVY_KEY_B = 41;
const NAVY_THRESHOLD = 50;
const CHROMA_SOFTNESS = 20;
const MAX_DPR = 2;

interface HeroEvaporatingLogoProps {
  logoVideoRef: RefObject<HTMLVideoElement | null>;
  logoLayerRef: RefObject<HTMLDivElement | null>;
}

export interface HeroEvaporatingLogoHandle {
  scheduleRedraw: () => void;
}

function applyChromaKey(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const spread = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);

    let keyMix = 0;

    const isGold =
      spread >= 28 &&
      maxC >= 95 &&
      r >= 105 &&
      g >= 65 &&
      r >= g &&
      g >= b &&
      r - b >= 35;

    const isGlobe =
      !isGold &&
      spread >= 24 &&
      maxC >= 70 &&
      b >= 80 &&
      g >= 55 &&
      b >= r &&
      b - r >= 18;

    if (!isGold && !isGlobe) {
      const isNeutral = spread <= NEUTRAL_SPREAD;

      if (r <= BLACK_MAX && g <= BLACK_MAX && b <= BLACK_MAX) {
        keyMix = 1;
      } else if (isNeutral && minC >= GRAY_MIN && maxC <= GRAY_MAX) {
        keyMix = 1;
      } else if (isNeutral && maxC > BLACK_MAX && maxC < GRAY_MIN) {
        keyMix = 1;
      } else if (isNeutral && minC > GRAY_MAX && maxC <= 235) {
        keyMix = 1;
      } else {
        const dr = r - NAVY_KEY_R;
        const dg = g - NAVY_KEY_G;
        const db = b - NAVY_KEY_B;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < NAVY_THRESHOLD) {
          keyMix = 1;
        } else if (dist < NAVY_THRESHOLD + CHROMA_SOFTNESS) {
          keyMix = (dist - NAVY_THRESHOLD) / CHROMA_SOFTNESS;
        }
      }
    }

    if (keyMix >= 1) {
      data[i + 3] = 0;
    } else if (keyMix > 0) {
      data[i + 3] = Math.round(data[i + 3] * keyMix);
    }
  }
}

const HeroEvaporatingLogo = forwardRef<HeroEvaporatingLogoHandle, HeroEvaporatingLogoProps>(
  function HeroEvaporatingLogo({ logoVideoRef, logoLayerRef }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const keyCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef(0);
    const drawPendingRef = useRef(false);
    const dprRef = useRef(1);
    const drawFrameRef = useRef<(() => void) | null>(null);

    const scheduleRedraw = () => {
      if (drawPendingRef.current) return;
      drawPendingRef.current = true;

      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        drawPendingRef.current = false;
        drawFrameRef.current?.();
      });
    };

    useImperativeHandle(ref, () => ({
      scheduleRedraw,
    }));

    useEffect(() => {
      if (typeof window === "undefined") return;

      const video = logoVideoRef.current;
      const canvas = canvasRef.current;
      const layer = logoLayerRef.current;
      const wrapper = layer?.parentElement;
      if (!video || !canvas || !wrapper) return;

      const displayCtx = canvas.getContext("2d", { alpha: true });
      if (!displayCtx) return;

      if (!keyCanvasRef.current) {
        keyCanvasRef.current = document.createElement("canvas");
      }

      const keyCanvas = keyCanvasRef.current;
      const keyCtx = keyCanvas.getContext("2d", { alpha: true, willReadFrequently: true });
      if (!keyCtx) return;

      let active = true;

      displayCtx.imageSmoothingEnabled = true;
      displayCtx.imageSmoothingQuality = "high";
      keyCtx.imageSmoothingEnabled = true;
      keyCtx.imageSmoothingQuality = "high";

      const resizeCanvas = () => {
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        if (!w || !h) return;

        dprRef.current = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        canvas.width = Math.round(w * dprRef.current);
        canvas.height = Math.round(h * dprRef.current);
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        displayCtx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
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

        const keyWidth = Math.max(1, Math.round(dw * dprRef.current));
        const keyHeight = Math.max(1, Math.round(dh * dprRef.current));

        if (keyCanvas.width !== keyWidth || keyCanvas.height !== keyHeight) {
          keyCanvas.width = keyWidth;
          keyCanvas.height = keyHeight;
        }

        keyCtx.clearRect(0, 0, keyWidth, keyHeight);
        keyCtx.drawImage(video, 0, 0, keyWidth, keyHeight);

        const imageData = keyCtx.getImageData(0, 0, keyWidth, keyHeight);
        applyChromaKey(imageData.data);
        keyCtx.putImageData(imageData, 0, 0);

        displayCtx.clearRect(0, 0, w, h);
        displayCtx.drawImage(keyCanvas, dx, dy, dw, dh);
      };

      drawFrameRef.current = drawKeyedFrame;

      const onResize = () => {
        resizeCanvas();
        scheduleRedraw();
      };

      const onVideoFrame = () => scheduleRedraw();

      resizeCanvas();
      window.addEventListener("resize", onResize, { passive: true });
      video.addEventListener("seeked", onVideoFrame);
      video.addEventListener("loadeddata", onVideoFrame);

      if (video.readyState >= 2) {
        scheduleRedraw();
      } else {
        video.addEventListener("canplay", onVideoFrame, { once: true });
      }

      return () => {
        active = false;
        drawFrameRef.current = null;
        window.removeEventListener("resize", onResize);
        video.removeEventListener("seeked", onVideoFrame);
        video.removeEventListener("loadeddata", onVideoFrame);
        video.removeEventListener("canplay", onVideoFrame);
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
);

export default memo(HeroEvaporatingLogo);
