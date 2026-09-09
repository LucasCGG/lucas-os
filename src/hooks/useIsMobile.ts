import { useEffect, useState } from "react"
import { useIsMobileDevice } from "./useIsMobileDevice"

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(useIsMobileDevice);

  useEffect(() => {
    const update = () => setIsMobile(useIsMobileDevice())
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update)
  },[])

  return isMobile;
}
