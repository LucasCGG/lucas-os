import { AssetPool } from "../../sprites/AssetPool";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";
import { SpriteSheet } from "../../sprites/SpriteSheet";

/**
 * Builds an 8-frame walk-cycle sprite sheet at runtime by drawing to an
 * offscreen canvas, so the animation demo needs zero asset files. Swap this for
 * `AssetPool.loadAll([{ path, url }])` + a real PNG when you have art — nothing
 * else changes.
 */
const SHEET_PATH = "proc/hero";
const FRAME = 64;
const FRAMES = 8;

let sheet: SpriteSheet | null = null;

export function ensureHeroSheet(): SpriteSheet {
  if (sheet !== null) {
    return sheet;
  }

  const canvas = document.createElement("canvas");
  canvas.width = FRAME * FRAMES;
  canvas.height = FRAME;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("heroSheet: could not get a 2D context");
  }

  for (let i = 0; i < FRAMES; i++) {
    drawHeroFrame(ctx, i * FRAME, FRAME, i, FRAMES);
  }

  AssetPool.putImage(SHEET_PATH, canvas);
  sheet = new SpriteSheet(SHEET_PATH, FRAME, FRAME);
  InspectorRegistry.register("hero (procedural)", sheet);
  return sheet;
}

function drawHeroFrame(
  ctx: CanvasRenderingContext2D,
  fx: number,
  size: number,
  index: number,
  total: number,
): void {
  const cx = fx + size / 2;
  const phase = (index / total) * Math.PI * 2;
  const bob = Math.sin(phase) * 3;
  const legSwing = Math.sin(phase) * 6;

  const bodyW = size * 0.5;
  const bodyH = size * 0.42;
  const bodyTop = size * 0.3 + bob;
  const bodyBottom = bodyTop + bodyH;

  // Legs (alternating swing).
  ctx.fillStyle = "#8a5a2b";
  ctx.fillRect(cx - 10 + legSwing, bodyBottom - 2, 7, 12);
  ctx.fillRect(cx + 3 - legSwing, bodyBottom - 2, 7, 12);

  // Body.
  ctx.fillStyle = "#e7c15a";
  roundRect(ctx, cx - bodyW / 2, bodyTop, bodyW, bodyH, 8);
  ctx.fill();

  // Eye (facing right).
  ctx.fillStyle = "#1b1b26";
  ctx.beginPath();
  ctx.arc(cx + bodyW * 0.18, bodyTop + bodyH * 0.4, 4, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
