import { WeaponFactory } from "../types/WeaponFactory";
import {
  SimpleBow,
  Rifle,
  Shotgun,
  SMG,
  Sniper,
  HandCannon,
  Pistol,
  CrossBow,
} from "../weapons/projectiles";

interface LootEntry {
  weight: number;
  weapon: WeaponFactory | null;
}

export interface LootResult {
  weaponFactories: WeaponFactory[];
  xp: number;
}

export class LootTable {
  constructor(
    private entries: LootEntry[],
    private xpRange: [number, number] = [50, 150],
  ) {}

  roll(): LootResult {
    const factory = this.pickWeighted();
    const [min, max] = this.xpRange;
    const xp = min + Math.floor(Math.random() * (max - min + 1));

    return {
      weaponFactories: factory ? [factory] : [],
      xp,
    };
  }

  private pickWeighted(): WeaponFactory | null {
    const total = this.entries.reduce((sum, e) => sum + e.weight, 0);
    let r = Math.random() * total;

    for (const e of this.entries) {
      r -= e.weight;
      if (r <= 0) return e.weapon;
    }

    return null;
  }
}

export const DEFAULT_LOOT = new LootTable([
  { weight: 70, weapon: null },

  // Common 20%
  { weight: 8, weapon: Pistol.create },
  { weight: 5, weapon: SimpleBow.create },
  { weight: 4, weapon: Rifle.create },
  { weight: 3, weapon: SMG.create },

  // Uncommon 7%
  { weight: 3, weapon: Shotgun.create },
  { weight: 2, weapon: HandCannon.create },
  { weight: 2, weapon: CrossBow.create },

  // Rare 3%
  { weight: 3, weapon: Sniper.create },
], [50, 150]);
