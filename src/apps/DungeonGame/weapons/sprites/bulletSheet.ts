import { AssetPool } from "../../sprites/AssetPool";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";
import { SpriteSheet } from "../../sprites/SpriteSheet";

import bulletUrl from "../../assets/Gun Shooting Kit 1.2/Export/Projectile 11.png";

const SHEET_KEY = "weapon/bullet";
const SOURCE_FRAME = 64;
const SOURCE_FRAMES = 4;
const TOTAL_FRAMES = 8; 

let sheet: SpriteSheet | null = null;

export async function ensureBulletSheet(): Promise<SpriteSheet> {
  if (sheet !== null) {
    return sheet;
  }

  const [source] = await AssetPool.loadAll([{ path: "weapon/bullet-source", url: bulletUrl }]);

  const canvas = document.createElement("canvas");
  canvas.width = SOURCE_FRAME * TOTAL_FRAMES;
  canvas.height = SOURCE_FRAME;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("bulletSheet: no 2D context");
  }

  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const srcIndex = i % SOURCE_FRAMES;
    ctx.drawImage(
      source,
      srcIndex * SOURCE_FRAME, 0, SOURCE_FRAME, SOURCE_FRAME,
      i * SOURCE_FRAME, 0, SOURCE_FRAME, SOURCE_FRAME,
    );
  }

  AssetPool.putImage(SHEET_KEY, canvas);
  sheet = new SpriteSheet(SHEET_KEY, SOURCE_FRAME, SOURCE_FRAME);
  InspectorRegistry.register("bullet", sheet);
  return sheet;
}
