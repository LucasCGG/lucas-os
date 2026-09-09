/**
 * One-shot device-type check, shared by useIsMobile() and by code outside
 * React (e.g. the dungeon game's engine) that needs the same answer without
 * a hook.
 */
export const isMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  const uaMobile = /android|webos|iphone|blackberry|iemobile|opera mini|mobile/i.test(ua);

  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return uaMobile || iPadOS;
};
