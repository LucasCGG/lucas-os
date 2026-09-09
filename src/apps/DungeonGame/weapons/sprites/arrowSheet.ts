import { AssetPool } from "../../sprites/AssetPool";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";
import { SpriteSheet } from "../../sprites/SpriteSheet";
import { imageHeight, imageWidth } from "../../sprites/types";

import arrowUrl from "../../assets/objects/Crossbow_Bolt.png";

const SHEET_KEY = "weapon/arrow";
const FRAMES = 8;

let sheet: SpriteSheet | null = null;

export async function ensureArrowSheet(): Promise<SpriteSheet> {
  if (sheet !== null) {
    return sheet;
  }

  const [bolt] = await AssetPool.loadAll([{ path: "objects/crossbow-bolt", url: arrowUrl }]);

  const frameW = imageWidth(bolt);
  const frameH = imageHeight(bolt);

  const canvas = document.createElement("canvas");
  canvas.width = frameW * FRAMES;
  canvas.height = frameH;
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("arrowSheet: no 2D context");
  }

  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < FRAMES; i++) {
    ctx.drawImage(bolt, i * frameW, 0);
  }

  AssetPool.putImage(SHEET_KEY, canvas);
  sheet = new SpriteSheet(SHEET_KEY, frameW, frameH);
  InspectorRegistry.register("arrow", sheet);
  return sheet;
}
