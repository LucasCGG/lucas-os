import { useEffect } from "react";

export const useDynamicTabTitle = () => {
  useEffect(() => {
    const defaultTitle = "LucasOS — The Retro Dev Playground";

    const awayMessages = [
      "👀 Lucas.exe is still running…",
      "💾 Saving to floppy disk…",
      "🪐 BRB, optimizing your pixels…",
      "🧠 Compiling thoughts…",
      "📟 Retro-mode activated...",
    ];

    let marqueeInterval: number | undefined;
    let marqueeIndex = 0;
    let currentMessage = "";

    const startMarquee = (message: string) => {
      currentMessage = message + " ";
      marqueeIndex = 0;

      marqueeInterval = window.setInterval(() => {
        const rotated = currentMessage.slice(marqueeIndex) + currentMessage.slice(0, marqueeIndex);
        document.title = rotated;
        marqueeIndex = (marqueeIndex + 1) % currentMessage.length;
      }, 150);
    };

    const stopMarquee = () => {
      if (marqueeInterval !== undefined) {
        clearInterval(marqueeInterval);
        marqueeInterval = undefined;
      }
      document.title = defaultTitle;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const random = Math.floor(Math.random() * awayMessages.length);
        startMarquee(awayMessages[random]);
      } else {
        stopMarquee();
      }
    };

    // Init
    document.title = defaultTitle;
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopMarquee();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
