import { GameObject } from "../engine/GameObject";
import { Transform } from "../engine/Tranform";
import { AssetPool } from "../sprites/AssetPool";

import dungeonObjectsUrl from "../assets/objects/Dungeon_Objects.png";
import goldPilesUrl from "../assets/objects/Gold_Piles.png";
import metalGrillsUrl from "../assets/objects/Metal_Grills.png";
import sewerWaterDecorUrl from "../assets/objects/Sewer_Water_Decor.png";
import smallWoodenBridgeUrl from "../assets/objects/Small_Wooden_Bridge.png";

const TILE = 16;

interface DecorAsset {
  path: string;
  url: string;
  /** Source rect, in pixels, within the asset's own image. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

/**
 * Catalog of purely-cosmetic props that can be scattered around a room.
 * Every entry is non-colliding — placement only has to avoid looking silly,
 * not avoid the player.
 */
export const DECOR_ASSETS: Record<string, DecorAsset> = {
  crate: { path: "dungeon/decor-objects", url: dungeonObjectsUrl, sx: 0, sy: 0, sw: TILE, sh: TILE * 2 },
  urnSmall: { path: "dungeon/decor-objects", url: dungeonObjectsUrl, sx: TILE * 4, sy: TILE, sw: TILE, sh: TILE },
  urnLarge: { path: "dungeon/decor-objects", url: dungeonObjectsUrl, sx: TILE * 5, sy: TILE, sw: TILE, sh: TILE * 2 },
  candelabra: { path: "dungeon/decor-objects", url: dungeonObjectsUrl, sx: TILE * 2, sy: TILE, sw: TILE, sh: TILE * 2 },
  rubble: { path: "dungeon/decor-objects", url: dungeonObjectsUrl, sx: TILE * 3, sy: TILE * 2, sw: TILE * 2, sh: TILE },
  potRound: { path: "dungeon/decor-objects", url: dungeonObjectsUrl, sx: TILE * 6, sy: TILE * 3, sw: TILE, sh: TILE * 2 },

  goldPile: { path: "dungeon/decor-gold", url: goldPilesUrl, sx: 0, sy: 0, sw: TILE * 2, sh: TILE * 2 },
  goldCoins: { path: "dungeon/decor-gold", url: goldPilesUrl, sx: TILE * 2, sy: TILE * 2, sw: TILE, sh: TILE },

  grillWindow: { path: "dungeon/decor-grills", url: metalGrillsUrl, sx: TILE * 3, sy: 0, sw: TILE * 3, sh: TILE * 3 },
  floorDrain: { path: "dungeon/decor-grills", url: metalGrillsUrl, sx: TILE, sy: TILE * 3, sw: TILE, sh: TILE },

  waterMoss: { path: "dungeon/decor-water", url: sewerWaterDecorUrl, sx: 0, sy: 0, sw: TILE * 3, sh: TILE },

  woodBridge: { path: "dungeon/decor-bridge", url: smallWoodenBridgeUrl, sx: 0, sy: 0, sw: TILE * 5, sh: TILE },
};

export type DecorKind = keyof typeof DECOR_ASSETS;

/** Default on-screen size for a decoration, scaled up from its pixel-art source. */
export const decorationSize = (kind: string, scale = 2): { width: number; height: number } => {
  const asset = DECOR_ASSETS[kind];

  if (asset === undefined) {
    return { width: TILE * scale, height: TILE * scale };
  }

  return { width: asset.sw * scale, height: asset.sh * scale };
};

export class Decoration extends GameObject {
  private readonly kind: string;

  constructor(name: string, transform: Transform, kind: string) {
    super(name, transform);

    this.kind = kind;
  }

  static async preload(): Promise<void> {
    const seen = new Set<string>();

    const entries = Object.values(DECOR_ASSETS).filter((asset) => {
      if (seen.has(asset.path)) {
        return false;
      }

      seen.add(asset.path);

      return true;
    });

    await AssetPool.loadAll(entries);
  }

  update(_deltaTime: number): void {}

  protected draw(ctx: CanvasRenderingContext2D): void {
    const asset = DECOR_ASSETS[this.kind];

    if (asset === undefined) {
      return;
    }

    const image = AssetPool.getImage(asset.path);

    if (image === null) {
      return;
    }

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      image,
      asset.sx,
      asset.sy,
      asset.sw,
      asset.sh,
      0,
      0,
      this.transform.width,
      this.transform.height
    );
  }
}
