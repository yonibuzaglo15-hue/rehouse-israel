const HERO_DEBUG = process.env.NODE_ENV === "development";

export function heroDebug(label: string, payload?: unknown): void {
  if (!HERO_DEBUG) return;
  if (payload !== undefined) {
    console.log(`[HeroScrollMedia] ${label}`, payload);
  } else {
    console.log(`[HeroScrollMedia] ${label}`);
  }
}

export function describeVideo(video: HTMLVideoElement, label: string) {
  return {
    label,
    readyState: video.readyState,
    duration: video.duration,
    currentTime: video.currentTime,
    paused: video.paused,
    networkState: video.networkState,
    videoWidth: video.videoWidth,
    videoHeight: video.videoHeight,
    src: video.currentSrc || video.getAttribute("src") || "inline-source",
  };
}

export function waitForVideoReady(
  video: HTMLVideoElement,
  label: string,
  timeoutMs = 15000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const finish = (reason: string) => {
      cleanup();
      heroDebug(`video ready: ${label}`, { reason, ...describeVideo(video, label) });
      resolve();
    };

    const fail = (reason: string) => {
      cleanup();
      heroDebug(`video failed: ${label}`, { reason, ...describeVideo(video, label) });
      reject(new Error(`[HeroScrollMedia] ${label}: ${reason}`));
    };

    let settled = false;
    const safeFinish = (reason: string) => {
      if (settled) return;
      settled = true;
      finish(reason);
    };
    const safeFail = (reason: string) => {
      if (settled) return;
      settled = true;
      fail(reason);
    };

    const onReady = () => {
      if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
        safeFinish("metadata+duration");
      }
    };

    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
    };

    const onError = () => {
      safeFail("media-error");
    };

    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      safeFinish("already-ready");
      return;
    }

    const timer = setTimeout(() => {
      if (video.readyState >= 1) {
        safeFinish("timeout-with-metadata");
        return;
      }
      safeFail(`timeout after ${timeoutMs}ms`);
    }, timeoutMs);

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onError);

    if (video.readyState === 0) {
      try {
        video.load();
      } catch {
        // ignore — browser may already be loading
      }
    }
  });
}

export async function waitForDomRefs<T extends Record<string, unknown>>(
  getRefs: () => T,
  isReady: (refs: T) => boolean,
  maxFrames = 90
): Promise<T> {
  for (let frame = 0; frame < maxFrames; frame += 1) {
    const refs = getRefs();
    if (isReady(refs)) {
      return refs;
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  throw new Error("[HeroScrollMedia] DOM refs not ready before timeout");
}
