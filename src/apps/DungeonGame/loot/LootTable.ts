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
import {
  Dagger,
  Sword,
  Rapier,
  Spear,
  GreatSword,
} from "../weapons/melee";
import { Armor, ArmorFactory, ARMOR_FACTORIES } from "../items/Armor";
import { ItemRarity } from "../types/ItemRarity";

const RARITY_DAMAGE_MULTIPLIER: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 1.15,
  rare: 1.3,
  epic: 1.5,
  legendary: 1.8,
};

interface LootEntry {
  weight: number;
  weapon: WeaponFactory | null;
  rarity?: ItemRarity;
  armor?: ArmorFactory;
}

export interface LootResult {
  weaponFactories: WeaponFactory[];
  armorFactories: ArmorFactory[];
  rarity: ItemRarity;
  xp: number;
}

export class LootTable {
  constructor(
    private entries: LootEntry[],
    private xpRange: [number, number] = [50, 150],
  ) {}

  roll(): LootResult {
    const entry = this.pickWeighted();
    const [min, max] = this.xpRange;
    const xp = min + Math.floor(Math.random() * (max - min + 1));
    const rarity = entry?.rarity ?? this.pickRarity();

    return {
      weaponFactories: entry?.weapon
        ? [async (provider, team) => {
            const weapon = await entry.weapon!(provider, team);
            const rarity = entry.rarity ?? "common";
            weapon.setRarity(rarity);
            weapon.setDamageOutput(weapon.getDamageOutput() * RARITY_DAMAGE_MULTIPLIER[rarity]);
            return weapon;
          }]
        : [],
      armorFactories: this.pickArmor(rarity),
      rarity,
      xp,
    };
  }

  private pickArmor(rarity: ItemRarity): ArmorFactory[] {
    if (Math.random() > 0.12) return [];

    const factory = ARMOR_FACTORIES[Math.floor(Math.random() * ARMOR_FACTORIES.length)];
    return [() => {
      const base = factory();
      const multiplier = RARITY_DAMAGE_MULTIPLIER[rarity];
      return new Armor(
        `${base.getDisplayName()} (${rarity[0].toUpperCase()}${rarity.slice(1)})`,
        base.slot,
        Math.max(1, Math.round(base.defense * multiplier)),
        Math.max(0, Math.round(base.maxHealth * multiplier)),
        Math.round(base.speed * (rarity === "common" ? 1 : 1 + (multiplier - 1) * 0.5)),
        rarity
      );
    }];
  }

  private pickRarity(): ItemRarity {
    const roll = Math.random();
    if (roll < 0.55) return "common";
    if (roll < 0.82) return "uncommon";
    if (roll < 0.95) return "rare";
    if (roll < 0.99) return "epic";
    return "legendary";
  }

  private pickWeighted(): LootEntry | null {
    const total = this.entries.reduce((sum, e) => sum + e.weight, 0);
    let r = Math.random() * total;

    for (const e of this.entries) {
      r -= e.weight;
      if (r <= 0) return e;
    }

    return null;
  }
}

export const DEFAULT_LOOT = new LootTable([
  { weight: 70, weapon: null },

  // Common 20%
  { weight: 8, weapon: Pistol.create, rarity: "common" },
  { weight: 5, weapon: SimpleBow.create, rarity: "common" },
  { weight: 4, weapon: Rifle.create, rarity: "uncommon" },
  { weight: 3, weapon: SMG.create, rarity: "uncommon" },

  // Uncommon 7%
  { weight: 3, weapon: Shotgun.create, rarity: "rare" },
  { weight: 2, weapon: HandCannon.create, rarity: "rare" },
  { weight: 2, weapon: CrossBow.create, rarity: "rare" },

  // Rare 3%
  { weight: 3, weapon: Sniper.create, rarity: "epic" },

  // Melee - Common 10%
  { weight: 5, weapon: Dagger.create, rarity: "common" },
  { weight: 5, weapon: Sword.create, rarity: "common" },

  // Melee - Uncommon 6%
  { weight: 3, weapon: Rapier.create, rarity: "uncommon" },
  { weight: 3, weapon: Spear.create, rarity: "rare" },

  // Melee - Rare 2%
  { weight: 2, weapon: GreatSword.create, rarity: "legendary" },
], [50, 150]);
