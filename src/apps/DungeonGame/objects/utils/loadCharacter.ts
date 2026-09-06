import { AssetPool } from "../../sprites/AssetPool";
import { SpriteSheet } from "../../sprites/SpriteSheet";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";

export interface DirectionalClip {
  sheet: SpriteSheet;
  framesPerRow: number;
}

export interface CharacterSheets {
  walk: SpriteSheet;
  idle: SpriteSheet;
  hurt?: DirectionalClip;
  death?: DirectionalClip;
}

const walkUrls = import.meta.glob("../../assets/char/*_Walk.png", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;
const idleUrls = import.meta.glob("../../assets/char/*_Idle.png", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;
const hurtUrls = import.meta.glob("../../assets/char/*_Hurt.png", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;
const deathUrls = import.meta.glob("../../assets/char/*_Death.png", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;

function findUrl(map: Record<string, string>, filename: string): string | null {
  const key = Object.keys(map).find((k) => k.split("/").pop() === filename);
  return key === undefined ? null : map[key];
}

export async function loadCharacter(
  id: string,
  frameW: number,
  frameH: number,
): Promise<CharacterSheets> {
  const walkPath = `char/${id}/walk`;
  const idlePath = `char/${id}/idle`;
  const hurtPath = `char/${id}/hurt`;
  const deathPath = `char/${id}/death`;

  const walkUrl = findUrl(walkUrls, `${id}_Walk.png`);
  const idleUrl = findUrl(idleUrls, `${id}_Idle.png`);
  if (walkUrl === null) throw new Error(`loadCharacter: no asset '${id}_Walk.png'`);
  if (idleUrl === null) throw new Error(`loadCharacter: no asset '${id}_Idle.png'`);

  const hurtUrl = findUrl(hurtUrls, `${id}_Hurt.png`);
  const deathUrl = findUrl(deathUrls, `${id}_Death.png`);

  const toLoad = [
    { path: walkPath, url: walkUrl },
    { path: idlePath, url: idleUrl },
  ];
  if (hurtUrl !== null) toLoad.push({ path: hurtPath, url: hurtUrl });
  if (deathUrl !== null) toLoad.push({ path: deathPath, url: deathUrl });

  await AssetPool.loadAll(toLoad);

  const walk = new SpriteSheet(walkPath, frameW, frameH);
  const idle = new SpriteSheet(idlePath, frameW, frameH);

  InspectorRegistry.register(`char ${id} — walk`, walk);
  InspectorRegistry.register(`char ${id} — idle`, idle);

  const sheets: CharacterSheets = { walk, idle };

  if (hurtUrl !== null) {
    const sheet = new SpriteSheet(hurtPath, frameW, frameH);
    sheets.hurt = { sheet, framesPerRow: sheet.getTotalFrames() / 2 };
    InspectorRegistry.register(`char ${id} — hurt`, sheet);
  }

  if (deathUrl !== null) {
    const sheet = new SpriteSheet(deathPath, frameW, frameH);
    sheets.death = { sheet, framesPerRow: sheet.getTotalFrames() / 2 };
    InspectorRegistry.register(`char ${id} — death`, sheet);
  }

  return sheets;
}
