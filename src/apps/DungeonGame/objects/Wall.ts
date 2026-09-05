import { GameObject, Transform } from "../engine";
import { Camera } from "../engine/Camera";
import { AssetPool } from "../sprites/AssetPool";
import { ImageSource } from "../sprites/types";

const TILE = 16;
const WALL_SHEET = "dungeon/tileset";
const PILLAR_SHEET = "dungeon/pillars";
const SHADOW = 6;


const PILLAR_W = 16;
const PILLAR_H = 48;

type WallKind = "pillar" | "horizontal" | "vertical" | "block";

export class Wall extends GameObject {
  private static wallSheet: ImageSource | null = null;
  private static pillarSheet: ImageSource | null = null;
  private pillarVariant = 0;

  private color: string;
  private kind: WallKind;

  constructor(name: string, transform: Transform, color = "#3a3a52") {
    super(name, transform);
    this.color = color;
    this.kind = Wall.classify(transform.width, transform.height);
  }

  private static classify(w: number, h: number): WallKind {
    const isNarrow = w <= 40;
    if (isNarrow && h <= 48) return "pillar";
    if (isNarrow && h > w) return "vertical";
    if (w > h && h <= 40) return "horizontal";
    return "block";
  }

  static async loadSheets(wallUrl: string, pillarUrl: string): Promise<void> {
    await AssetPool.loadAll([
      { path: WALL_SHEET, url: wallUrl },
      { path: PILLAR_SHEET, url: pillarUrl },
    ]);
    Wall.wallSheet = AssetPool.getImage(WALL_SHEET);
    Wall.pillarSheet = AssetPool.getImage(PILLAR_SHEET);
  }

  setPillarVariant(v: number): void {
    this.pillarVariant = Math.max(0, Math.min(2, v));
  }

  update(_deltaTime: number): void {}

  /** Shadow pass — drawn on the floor, before any wall body. */
  renderShadow(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.kind === "pillar") {
      return;
    }
    const s = camera.worldToScreen(this.transform.x, this.transform.y);
    const w = this.transform.width;
    const h = this.transform.height;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, h, w + SHADOW, SHADOW);
    ctx.fillRect(w, 0, SHADOW, h);
    ctx.restore();
  }

  /** Body pass — the wall tiles. Drawn after all shadows so it covers any that fell on it. */
  renderBody(ctx: CanvasRenderingContext2D, camera: Camera): void {
    this.render(ctx, camera);
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    const w = this.transform.width;
    const h = this.transform.height;

    if (Wall.wallSheet === null) {
      ctx.fillStyle = this.color;
      ctx.fillRect(0, 0, w, h);
      return;
    }

    ctx.imageSmoothingEnabled = false;
    switch (this.kind) {
      case "pillar":
        this.drawPillar(ctx, w, h);
        break;
      case "horizontal":
      case "vertical":
        this.drawTiled(ctx, w, h);
        break;
      default:
        this.drawTiled(ctx, w, h);
    }
  }

  private drawPillar(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const sheet = Wall.pillarSheet ?? Wall.wallSheet!;
    const sx = this.pillarVariant * 16; // 0, 16, or 32
    ctx.drawImage(sheet, sx, 0, PILLAR_W, PILLAR_H, 0, 0, w, h);
  }

  private drawTiled(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const sheet = Wall.wallSheet!;
    const sx = 10 * TILE;
    const sy = 1 * TILE;
    for (let y = 0; y < h; y += TILE) {
      for (let x = 0; x < w; x += TILE) {
        const dw = Math.min(TILE, w - x);
        const dh = Math.min(TILE, h - y);
        ctx.drawImage(sheet, sx, sy, dw, dh, x, y, dw, dh);
      }
    }
  }
}
