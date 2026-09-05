import { AssetPool } from "../../sprites/AssetPool";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";
import { SpriteSheet } from "../../sprites/SpriteSheet";

const SHEET_KEY = "weapon/projectile-proc";
const FRAME = 32;
const FRAMES = 8;

let sheet: SpriteSheet | null = null;

/** Builds an 8-frame glowing-orb projectile sheet at runtime (no asset file). */
export function ensureProjectileSheet(): SpriteSheet {
  if (sheet !== null) {
    return sheet;
  }

  const canvas = document.createElement("canvas");
  canvas.width = FRAME * FRAMES;
  canvas.height = FRAME;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("projectileSheet: no 2D context");
  }

  for (let i = 0; i < FRAMES; i++) {
    drawOrb(ctx, i * FRAME, FRAME, i, FRAMES);
  }

  AssetPool.putImage(SHEET_KEY, canvas);
  sheet = new SpriteSheet(SHEET_KEY, FRAME, FRAME);
  InspectorRegistry.register("projectile (procedural)", sheet);
  return sheet;
}

function drawOrb(
  ctx: CanvasRenderingContext2D,
  fx: number,
  size: number,
  index: number,
  total: number,
): void {
  const cx = fx + size / 2;
  const cy = size / 2;
  const phase = (index / total) * Math.PI * 2;
  const pulse = 0.85 + Math.sin(phase) * 0.15; // 0.70–1.00
  const rCore = size * 0.18 * pulse;
  const rGlow = size * 0.42 * pulse;

  // Outer glow (radial gradient).
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, rGlow);
  glow.addColorStop(0, "rgba(120, 220, 255, 0.9)");
  glow.addColorStop(0.5, "rgba(80, 160, 255, 0.45)");
  glow.addColorStop(1, "rgba(80, 160, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, rGlow, 0, Math.PI * 2);
  ctx.fill();

  // Bright core.
  ctx.fillStyle = "#eaf6ff";
  ctx.beginPath();
  ctx.arc(cx, cy, rCore, 0, Math.PI * 2);
  ctx.fill();

  // Core rim.
  ctx.strokeStyle = "rgba(150, 210, 255, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, rCore + 1.5, 0, Math.PI * 2);
  ctx.stroke();
}
