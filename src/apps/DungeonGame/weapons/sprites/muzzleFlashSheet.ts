import { AssetPool } from "../../sprites/AssetPool";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";
import { SpriteSheet } from "../../sprites/SpriteSheet";

import muzzleFlashUrl from "../../assets/Gun Shooting Kit 1.2/Export/Muzzle Flash 1.png";

const SHEET_KEY = "weapon/muzzle-flash";
const FRAME = 64;

let sheet: SpriteSheet | null = null;

export async function ensureMuzzleFlashSheet(): Promise<SpriteSheet> {
  if (sheet !== null) {
    return sheet;
  }

  await AssetPool.loadAll([{ path: SHEET_KEY, url: muzzleFlashUrl }]);

  sheet = new SpriteSheet(SHEET_KEY, FRAME, FRAME);
  InspectorRegistry.register("muzzle flash", sheet);
  return sheet;
}
