export type StatScaling = Record<"health" | "speed" | "damage" | "defense" | "xp", LevelScaling>;

export type LevelScaling = {
  base: number;
  perLevel?: number;
  step?: number;
};

export const scaleByLevel = (
  level: number,
  scaling: LevelScaling,
): number => {
  const tier = Math.max(0, level - 1);
  const step = scaling.step ?? 1;
  const perLevel = scaling.perLevel ?? 0;

  return scaling.base + Math.floor(tier / step) * perLevel;
};

export const scaleObject = <T extends Record<string, LevelScaling>>(
  level: number,
  definition: T,
): { [K in keyof T]: number } =>
  Object.fromEntries(
    Object.entries(definition).map(([key, scaling]) => [
      key,
      scaleByLevel(level, scaling),
    ]),
  ) as { [K in keyof T]: number };
