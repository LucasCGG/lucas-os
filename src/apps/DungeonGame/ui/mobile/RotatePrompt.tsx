export const RotatePrompt =()=> {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-[#0e0e12] text-center text-white">
      <svg
        width="52"
        height="52"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
      >
        <rect x="7" y="2" width="10" height="16" rx="2" />
        <path d="M19 8a7 7 0 0 1 0 8" />
        <path d="M19 6.5V9h-2.5" />
      </svg>

      <p className="max-w-[220px] text-sm font-medium text-white/80">
        Rotate your device to landscape to play
      </p>
    </div>
  );
}
