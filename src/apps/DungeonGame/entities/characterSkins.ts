import { CHARACTER_FRAME_SIZES } from "./characterFrameSizes";

export const ENEMY_SKINS = {
  Melee: [
    "ArmoredAxeman",
    "ArmoredOrc",
    "ArmoredSkeleton",
    "Bat",
    "EliteOrc",
    "GreatswordSkeleton",
    "Knight",
    "KnightTemplar",
    "Lancer",
    "Necromancer",
    "Orc",
    "OrcRider",
    "Priest",
    "Skeleton",
    "Slime",
    "Soldier",
    "Swordsman",
    "Werebear",
    "Werewolf",
    "Wizard",
  ],
  Projectile: [
    "Archer",
    "SkeletonArcher",
  ],
} as const;

export function randomEnemySkin(type: "Melee" | "Projectile"): string {
  return ENEMY_SKINS[type][Math.floor(Math.random() * ENEMY_SKINS[type].length)];
}

const DEFAULT_FRAME_SIZE = { width: 72, height: 72 };

export function getCharacterFrameSize(id: string): { width: number; height: number } {
  return CHARACTER_FRAME_SIZES[id] ?? DEFAULT_FRAME_SIZE;
}
