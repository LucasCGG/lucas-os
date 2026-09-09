import { useEffect, useState } from "react";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
  unlock?: () => void;
};

export const useLandscapeLock = (active: boolean, target: HTMLElement | null): boolean => {
  const [isPortrait, setIsPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    const mql = window.matchMedia("(orientation: portrait)");

    const update = (): void => setIsPortrait(mql.matches);

    update();
    mql.addEventListener("change", update);

    return () => mql.removeEventListener("change", update);
  }, [active]);

  useEffect(() => {
    if (!active || target === null) {
      return;
    }

    let cancelled = false;

    const lock = async (): Promise<void> => {
      try {
        if (document.fullscreenElement === null) {
          await target.requestFullscreen?.();
        }
      } catch {
        console.error("[useLandscapeLock] fullscreenRequest not supported or accepted")
      }

      if (cancelled) {
        return;
      }

      try {
        await (screen.orientation as LockableOrientation | undefined)?.lock?.("landscape");
      } catch {
        console.error("[useLandscapeLock] orientationLock not supported or accepted")
      }
    };

    void lock();

    return () => {
      cancelled = true;

      try {
        (screen.orientation as LockableOrientation | undefined)?.unlock?.();
      } catch {
        console.error("[useLandscapeLock] failed to unmount")
      }

      if (document.fullscreenElement === target) {
        void document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [active, target]);

  return isPortrait;
}
