import { EntityAttributes } from "../attributes/EntityAttributes";
import { Entity } from "../entities/Entity";
import { ItemRarity } from "../types/ItemRarity";

export abstract class Weapon {
    private displayName = "Unknown weapon";
    private rarity: ItemRarity = "common";

    setDisplayName(name: string): void {
        this.displayName = name;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    setRarity(rarity: ItemRarity): void {
        this.rarity = rarity;
    }

    getRarity(): ItemRarity {
        return this.rarity;
    }

    applyOwnerBonus(stats: EntityAttributes): void { void stats; }

    abstract attack(): Entity[];

    abstract tick(deltaTime: number): void;

    getDamageOutput(): number {
        return 0;
    }

    setDamageOutput(damage: number): void { void damage; }
}
