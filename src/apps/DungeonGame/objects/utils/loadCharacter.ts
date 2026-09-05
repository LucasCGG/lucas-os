import { AssetPool } from "../../sprites/AssetPool";
import { SpriteSheet } from "../../sprites/SpriteSheet";
import { InspectorRegistry } from "../../sprites/InspectorRegistry";

export interface CharacterSheets {
  walk: SpriteSheet;
  idle: SpriteSheet;
}

const walkUrls = import.meta.glob("../..//assets/char/*_Walk.png", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;
const idleUrls = import.meta.glob("../../assets/char/*_Idle.png", {
  eager: true, query: "?url", import: "default",
}) as Record<string, string>;

function findUrl(map: Record<string, string>, suffix: string): string {
  const key = Object.keys(map).find((k) => k.endsWith(suffix));
  if (key === undefined) throw new Error(`loadCharacter: no asset '${suffix}'`);
  return map[key];
}

export async function loadCharacter(
  id: string,
  frameW: number,
  frameH: number,
): Promise<CharacterSheets> {
  const walkPath = `char/${id}/walk`;
  const idlePath = `char/${id}/idle`;

  await AssetPool.loadAll([
    { path: walkPath, url: findUrl(walkUrls, `${id}_Walk.png`) },
    { path: idlePath, url: findUrl(idleUrls, `${id}_Idle.png`) },
  ]);

  const walk = new SpriteSheet(walkPath, frameW, frameH);
  const idle = new SpriteSheet(idlePath, frameW, frameH);

  InspectorRegistry.register(`char ${id} — walk`, walk);
  InspectorRegistry.register(`char ${id} — idle`, idle);

  return { walk, idle };
}
