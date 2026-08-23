import { useEffect, useState } from "react"

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detect = () => {

      const ua = navigator.userAgent || "";
      const uaMobile = /android|webos|iphone|blackberry|iemobile|opera mini|mobile/i.test(ua);

      const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
      return uaMobile || iPadOS;
    }

    const update = () => setIsMobile(detect())
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update)
  },[])

  return isMobile;
}
