export const useIsMobileDevice = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  const uaMobile = /android|webos|iphone|blackberry|iemobile|opera mini|mobile/i.test(ua);

  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return uaMobile || iPadOS;
};
