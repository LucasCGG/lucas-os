import { ItemRarity } from "../types/ItemRarity";

export type ArmorSlot = "head" | "chest" | "legs";

export class Armor {
    private displayName: string;

    constructor(
        displayName: string,
        readonly slot: ArmorSlot,
        readonly defense: number,
        readonly maxHealth: number,
        readonly speed: number,
        readonly rarity: ItemRarity = "common",
    ) {
        this.displayName = displayName;
    }

    getDisplayName(): string {
        return this.displayName;
    }
}

export type ArmorFactory = () => Armor;

export const ARMOR_FACTORIES: ArmorFactory[] = [
    () => new Armor("Worn Hood", "head", 1, 4, 0),
    () => new Armor("Guard's Cuirass", "chest", 3, 12, -4),
    () => new Armor("Swift Greaves", "legs", 1, 4, 12),
];
