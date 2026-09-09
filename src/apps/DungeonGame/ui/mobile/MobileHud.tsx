import { MobileInput } from "../../engine/MobileInput";

const buttonClass =
  "pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white shadow-lg backdrop-blur-sm active:scale-90 active:bg-black/60";

const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const SwapWeaponIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h13l-3-3" />
    <path d="M20 17H7l3 3" />
  </svg>
);

const InventoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <rect x="13" y="13" width="7" height="7" rx="1.5" />
  </svg>
);

export const MobileHud = () => {
  const input = MobileInput.get();

  return (
    <div
      className="pointer-events-none absolute right-0 top-0 z-20 flex flex-col items-end gap-3 p-3"
      style={{
        paddingTop: "max(12px, env(safe-area-inset-top))",
        paddingRight: "max(12px, env(safe-area-inset-right))",
      }}
    >
      <button
        className={buttonClass}
        aria-label="Pause"
        onClick={() => input.triggerPause()}
      >
        <PauseIcon />
      </button>

      <button
        className={buttonClass}
        aria-label="Switch weapon"
        onClick={() => input.triggerSwitchWeapon()}
      >
        <SwapWeaponIcon />
      </button>

      <button
        className={buttonClass}
        aria-label="Attributes, inventory & skills"
        onClick={() => input.triggerCharacterScreen()}
      >
        <InventoryIcon />
      </button>
    </div>
  );
}
