import { AssetPool } from "../sprites/AssetPool";
import { ImageSource } from "../sprites/types";
import { Camera } from "../engine/Camera";

const TILE = 16;
const SHEET_KEY = "dungeon/tileset";

/**
 * Fills the world with a repeating floor tile. Drawn first, in world space,
 * so walls and entities render on top. Shares the tileset the Wall loads.
 */
export class TileFloor {
  private sheet: ImageSource | null = null;
  private readonly tileCol: number;
  private readonly tileRow: number;

  constructor(
    private readonly worldWidth: number,
    private readonly worldHeight: number,
    tileCol = 4,
    tileRow = 7,
  ) {
    this.tileCol = tileCol;
    this.tileRow = tileRow;
    this.sheet = AssetPool.getImage(SHEET_KEY);
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.sheet === null) {
      this.sheet = AssetPool.getImage(SHEET_KEY);
      if (this.sheet === null) return;
    }
    const sheet = this.sheet;

    const sx = this.tileCol * TILE;
    const sy = this.tileRow * TILE;

    const view = camera.getViewBounds();
    const startX = Math.max(0, Math.floor(view.x / TILE) * TILE);
    const startY = Math.max(0, Math.floor(view.y / TILE) * TILE);
    const endX = Math.min(this.worldWidth, view.x + view.w);
    const endY = Math.min(this.worldHeight, view.y + view.h);

    ctx.imageSmoothingEnabled = false;
    for (let wy = startY; wy < endY; wy += TILE) {
      for (let wx = startX; wx < endX; wx += TILE) {
        const screen = camera.worldToScreen(wx, wy);
        const dw = Math.min(TILE, this.worldWidth - wx);
        const dh = Math.min(TILE, this.worldHeight - wy);
        ctx.drawImage(sheet, sx, sy, dw, dh, screen.x, screen.y, dw, dh);
      }
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
