import React, { useEffect, useRef, type CSSProperties } from "react";
import { AppIcon } from "../AppIcon";

export const RetroStart = ({
    logoDelay = 0.2,
    glowDuration = 3.2,
    pulseDuration = 1.7,
    flickerDuration = 2.7,
    scanlineOpacity = 0.11,
    scanlineSizePx = 2,
    chromaticShiftPx = 0.8,
    blur = "6vmin",
    white = "#ffffff",
    background = "#000000",
    autoPlay = true,
} = {}) => {
    const rootRef = useRef<HTMLDivElement | null>(null);

    const restart = () => {
        const el = rootRef.current;
        if (!el) return;
        el.classList.remove("rcrt--play");
        void el.offsetHeight;
        el.classList.add("rcrt--play");
    };

    useEffect(() => {
        if (autoPlay) restart();

        const onKey = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                e.preventDefault();
                restart();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const styleVars: CSSProperties & Record<string, string | number> = {
        "--rcrt-bg": background,
        "--rcrt-white": white,
        "--rcrt-glow-duration": `${glowDuration}s`,
        "--rcrt-pulse-duration": `${pulseDuration}s`,
        "--rcrt-flicker-duration": `${flickerDuration}s`,
        "--rcrt-scanline-opacity": scanlineOpacity,
        "--rcrt-scanline-size": `${scanlineSizePx}px`,
        "--rcrt-chromatic-shift": `${chromaticShiftPx}px`,
        "--rcrt-blur": blur,
        "--rcrt-logo-delay": `${logoDelay}s`,
    };

    return (
        <div
            ref={rootRef}
            className="rcrt"
            style={styleVars}
            onClick={restart}
            role="img"
            aria-label="Retro CRT startup animation"
            title="Click or press Space to replay"
        >
            <div className="rcrt__stage">
                <AppIcon size="auto" icon="icn-logo-simple" className="rcrt__logo" />

                <div className="rcrt__chromatic" />
                <div className="rcrt__whiteout" />
                <div className="rcrt__flash" />
            </div>

            {/* Scoped styles */}
            <style>{`
        /* Layout */
        .rcrt{ position:fixed; inset:0; overflow:hidden; display:grid; place-items:center; background:var(--rcrt-bg, #000); cursor:pointer; }
        .rcrt__stage{ position:relative; width:100%; height:100%; background:var(--rcrt-bg, #000); }

        /* ===== Main Bloom (center glow) ===== */
        .rcrt__stage::before{
          content:""; position:absolute; left:50%; top:50%;
          width:140vmax; height:140vmax; border-radius:50%;
          transform: translate(-50%,-50%) scale(0.001);
          background:
            radial-gradient(circle at center,
              rgba(255,255,255,0.95) 0%,
              rgba(255,255,255,0.80) 8%,
              rgba(255,255,255,0.55) 18%,
              rgba(255,255,255,0.25) 32%,
              rgba(255,255,255,0.10) 48%,
              rgba(255,255,255,0.04) 64%,
              rgba(255,255,255,0.00) 78%
            );
          filter: blur(var(--rcrt-blur)) contrast(115%);
          will-change: transform, filter, opacity;
        }

        /* ===== Chromatic ghosts riding the bloom ===== */
        .rcrt__chromatic, .rcrt__chromatic::before, .rcrt__chromatic::after{ position:absolute; inset:0; pointer-events:none; content:""; }
        .rcrt__chromatic::before, .rcrt__chromatic::after{
          left:50%; top:50%; width:140vmax; height:140vmax; border-radius:50%;
          transform: translate(calc(-50% + var(--rcrt-chromatic-shift)), calc(-50% - var(--rcrt-chromatic-shift))) scale(0.001);
          filter: blur(calc(var(--rcrt-blur) + 2vmin)); mix-blend-mode: screen; will-change: transform;
        }
        .rcrt__chromatic::before{ background: radial-gradient(circle, rgba(255,0,0,0.16) 0%, rgba(255,0,0,0) 70%); }
        .rcrt__chromatic::after { background: radial-gradient(circle, rgba(0,180,255,0.18) 0%, rgba(0,180,255,0) 70%); transform: translate(calc(-50% - var(--rcrt-chromatic-shift)), calc(-50% + var(--rcrt-chromatic-shift))) scale(0.001); }

        /* White fill that gently takes over so no dark corners remain */
        .rcrt__whiteout{ position:absolute; inset:0; background:var(--rcrt-white, #fff); opacity:0; filter: blur(2vmin); pointer-events:none; }

        /* Startup flashes */
        .rcrt__flash{ position:absolute; inset:0; background:var(--rcrt-white, #fff); opacity:0; pointer-events:none; }

        /* Scanlines + vignette overlay */
        .rcrt::after{
          content:""; position:absolute; inset:0; pointer-events:none;
          background:
            /* horizontal scanlines */
            repeating-linear-gradient(to bottom,
              rgba(0,0,0,var(--rcrt-scanline-opacity)) 0px,
              rgba(0,0,0,var(--rcrt-scanline-opacity)) 1px,
              rgba(0,0,0,0) 1px,
              rgba(0,0,0,0) var(--rcrt-scanline-size)
            ),
            /* vignette */
            radial-gradient(ellipse at center,
              rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%
            );
          mix-blend-mode: multiply; opacity:0.85;
          animation: rcrt-scan 6s linear infinite;
        }

        /* ===== Animation states ===== */
        .rcrt.rcrt--play .rcrt__stage::before{
          animation:
            rcrt-expand var(--rcrt-glow-duration) cubic-bezier(.15,.75,.2,1) forwards,
            rcrt-flicker var(--rcrt-flicker-duration) steps(30,end) infinite;
        }
        .rcrt.rcrt--play .rcrt__chromatic::before{
          animation:
            rcrt-expand var(--rcrt-glow-duration) cubic-bezier(.15,.75,.2,1) forwards,
            rcrt-chroma 2.8s ease-in-out infinite;
        }
        .rcrt.rcrt--play .rcrt__chromatic::after{
          animation:
            rcrt-expand var(--rcrt-glow-duration) cubic-bezier(.15,.75,.2,1) forwards,
            rcrt-chroma 3.2s ease-in-out reverse infinite;
        }
        .rcrt.rcrt--play .rcrt__whiteout{ animation: rcrt-fill var(--rcrt-glow-duration) cubic-bezier(.2,.8,.2,1) forwards; }
        .rcrt.rcrt--play .rcrt__flash{ animation: rcrt-pulse var(--rcrt-pulse-duration) ease-out 1 0.18s; }

        /* ===== Keyframes ===== */
        @keyframes rcrt-expand{
          0%   { transform: translate(-50%,-50%) scale(0.001); opacity:1; }
          40%  { transform: translate(-50%,-50%) scale(0.9); }
          70%  { transform: translate(-50%,-50%) scale(1.9); }
          85%  { transform: translate(-50%,-50%) scale(3.2); }
          100% { transform: translate(-50%,-50%) scale(4.8); opacity:1; }
        }
        @keyframes rcrt-fill{
          0%   { opacity:0; }
          45%  { opacity:0.12; }
          70%  { opacity:0.45; }
          100% { opacity:1; }
        }
        @keyframes rcrt-flicker{
          0%,100%{ filter: blur(var(--rcrt-blur)) contrast(115%); }
          5%  { filter: blur(var(--rcrt-blur)) contrast(118%); }
          10% { filter: blur(calc(var(--rcrt-blur) + .2vmin)) contrast(112%); }
          14% { filter: blur(calc(var(--rcrt-blur) - .2vmin)) contrast(120%); }
          22% { filter: blur(var(--rcrt-blur)) contrast(111%); }
          31% { filter: blur(calc(var(--rcrt-blur) + .3vmin)) contrast(116%); }
          47% { filter: blur(var(--rcrt-blur)) contrast(114%); }
          62% { filter: blur(calc(var(--rcrt-blur) - .1vmin)) contrast(121%); }
          73% { filter: blur(calc(var(--rcrt-blur) + .1vmin)) contrast(113%); }
          88% { filter: blur(var(--rcrt-blur)) contrast(117%); }
        }
        @keyframes rcrt-scan{
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 0 2px, 0 0; }
        }
        @keyframes rcrt-chroma{
          0%,100%{ transform: translate(calc(-50% + var(--rcrt-chromatic-shift)), calc(-50% - var(--rcrt-chromatic-shift))) scale(0.001); }
          50%    { transform: translate(calc(-50% - var(--rcrt-chromatic-shift)), calc(-50% + var(--rcrt-chromatic-shift))) scale(0.001); }
        }
        @keyframes rcrt-pulse{
          0%  { opacity:0; }
          6%  { opacity:.35; }
          8%  { opacity:0; }
          11% { opacity:.18; }
          13% { opacity:0; }
          18% { opacity:.10; }
          20% { opacity:0; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce){
          .rcrt::after{ animation:none; }
          .rcrt.rcrt--play .rcrt__stage::before,
          .rcrt.rcrt--play .rcrt__chromatic::before,
          .rcrt.rcrt--play .rcrt__chromatic::after{ animation: rcrt-expand 1s ease-out forwards !important; }
          .rcrt.rcrt--play .rcrt__whiteout{ animation: rcrt-fill 1s ease-out forwards !important; }
          .rcrt__flash{ display:none; }
        }

        .rcrt__logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.6);
          max-width: 70%;
          opacity: 0;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.6));
          animation: rcrt-logo-fade var(--rcrt-glow-duration + 5) ease-out forwards;
          animation-delay: var(--rcrt-logo-delay);
          mix-blend-mode: screen;
          pointer-events: none;
          image-rendering: crisp-edges;
        }

        /* Logo fade-in synced with glow, but delayed */
        @keyframes rcrt-logo-fade {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4); filter: blur(4px) brightness(2); }
          30%  { opacity: 0.2; transform: translate(-50%, -50%) scale(0.55); }
          60%  { opacity: 0.7; transform: translate(-50%, -50%) scale(0.65); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(0.6); filter: blur(0px) brightness(1); }
        }

        /* Logo flicker starts only after it's visible */
        .rcrt--play .rcrt__logo {
          animation:
            rcrt-logo-fade var(--rcrt-glow-duration) ease-out forwards,
            rcrt-logo-flicker 2.5s steps(20, end) infinite;
          animation-delay: var(--rcrt-logo-delay), calc(var(--rcrt-logo-delay) + var(--rcrt-glow-duration));
        }

        @keyframes rcrt-logo-flicker {
          0%,100% { opacity: 1; }
          10% { opacity: 0.85; }
          15% { opacity: 1; }
          20% { opacity: 0.9; }
          30% { opacity: 1; }
          40% { opacity: 0.8; }
          50% { opacity: 1; }
          65% { opacity: 0.92; }
          75% { opacity: 1; }
          85% { opacity: 0.88; }
        }
      `}</style>
        </div>
    );
};
