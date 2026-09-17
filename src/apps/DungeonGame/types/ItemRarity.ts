export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_COLORS: Record<ItemRarity, string> = {
    common: "#b8c0cc",
    uncommon: "#62d47e",
    rare: "#55a8ff",
    epic: "#c477ff",
    legendary: "#ffb84d",
};

export const RARITY_LABELS: Record<ItemRarity, string> = {
    common: "Common",
    uncommon: "Uncommon",
    rare: "Rare",
    epic: "Epic",
    legendary: "Legendary",
};
