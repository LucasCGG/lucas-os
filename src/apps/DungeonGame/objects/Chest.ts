import { GameObject, Transform } from "../engine";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { AssetPool } from "../sprites/AssetPool";
import { Sprite } from "../sprites/Sprite";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { Weapon } from "../weapons/Weapon";
import chestUrl from "../assets/objects/chests.png";
import { Player } from "../entities/Player";
import { AudioManager } from "../audio/AudioManager";
import { InspectorRegistry } from "../sprites/InspectorRegistry";
import { WeaponFactory } from "../types/WeaponFactory";
import { Armor } from "../items/Armor";
import { ArmorFactory } from "../items/Armor";
import { ItemRarity } from "../types/ItemRarity";

export interface ChestSheets {
    idle: SpriteSheet;
    opening: SpriteSheet;
}

export interface ChestReward {
    guns: Weapon[];
    armor: Armor[];
    xp: number;
}

interface RewardPopup {
    text: string;
    age: number;
    duration: number;
}

export class Chest extends GameObject {
    private animator: Animator;
    private sprite: Sprite;
    private opened = false;
    private rewardClaimed = false;
    private readonly rewardGuns: Weapon[];
    private readonly rewardArmor: Armor[];
    private readonly rewardXp: number;

    private popups: RewardPopup[] = [];

    constructor(
        name: string,
        transform: Transform,
        sheets: ChestSheets,
        rewardGuns: Weapon[] = [],
        rewardXp = 0,
        rewardArmor: Armor[] = [],
        rarity: ItemRarity = "common"
    ) {
        super(name, transform);
        this.animator = new Animator();
        const spriteIndex = Chest.getRaritySpriteIndex(rarity);
        this.animator.addAnimation(new Animation("idle", sheets.idle, [spriteIndex], 0.1, true));
        this.animator.addAnimation(
            new Animation("opening", sheets.opening, [spriteIndex, spriteIndex + 9, spriteIndex + 18, spriteIndex + 27], 0.12, false)
        );
        this.animator.play("idle");
        this.sprite = new Sprite("chestSprite", this.animator, transform, false);
        InspectorRegistry.register(`chest ${this.id} - idle`, sheets.idle);
        this.rewardGuns = rewardGuns;
        this.rewardArmor = rewardArmor;
        this.rewardXp = rewardXp;
    }

    static async create(
        name: string,
        transform: Transform,
        weaponFactories: WeaponFactory[] = [],
        rewardXp = 0,
        armorFactories: ArmorFactory[] = [],
        rarity: ItemRarity = "common",
        opener?: Player
    ): Promise<Chest> {
        await AssetPool.loadAll([{ path: "objects/chest", url: chestUrl }]);
        const sheet = new SpriteSheet("objects/chest", 32, 32);
        const sheets: ChestSheets = { idle: sheet, opening: sheet };

        let guns: Weapon[] = [];
        if (opener && weaponFactories.length > 0) {
            const provider = { getTransform: () => opener.getAimingTransform() };
            const team = opener.getTeam()!;
            guns = await Promise.all(weaponFactories.map((make) => make(provider, team)));
        }

        const armor = armorFactories.map((make) => make());
        return new Chest(name, transform, sheets, guns, rewardXp, armor, rarity);
    }

    private static getRaritySpriteIndex(rarity: ItemRarity): number {
        return {
            common: 0,
            uncommon: 1,
            rare: 2,
            epic: 3,
            legendary: 4,
        }[rarity];
    }

    tick(deltaTime: number, opener: Player): void {
        this.advancePopups(deltaTime);

        if (this.rewardClaimed) {
            return;
        }
        if (opener.transform.intersects(this.transform)) {
            this.open();
        }
        this.sprite.update(deltaTime);
        const reward = this.claimReward();
        if (reward !== null) {
            this.grantReward(opener, reward);
            this.spawnRewardPopups(reward);
        }
    }

    open(): void {
        if (this.opened) return;
        this.opened = true;
        this.animator.play("opening");
    }

    isOpened(): boolean {
        return this.opened;
    }

    private isFullyOpen(): boolean {
        return this.opened && this.animator.isFinished();
    }

    private claimReward(): ChestReward | null {
        if (!this.isFullyOpen() || this.rewardClaimed) {
            return null;
        }
        this.rewardClaimed = true;
        return { guns: this.rewardGuns, armor: this.rewardArmor, xp: this.rewardXp };
    }

    private grantReward(player: Player, reward: ChestReward): void {
        if (reward.xp) player.getStats().gainExperience(reward.xp);
        for (const gun of reward.guns) player.addWeapon(gun);
        for (const item of reward.armor) player.addArmor(item);
        AudioManager.get().playSound("ding");
    }

    private spawnRewardPopups(reward: ChestReward): void {
        const labels: string[] = [];
        if (reward.xp) {
            labels.push(`+${reward.xp} XP`);
        }
        for (const gun of reward.guns) {
            labels.push(gun.getDisplayName());
        }
        for (const item of this.rewardArmor) labels.push(item.getDisplayName());
        labels.forEach((text, i) => {
            this.popups.push({ text, age: -i * 0.45, duration: 1.4 });
        });
    }

    private advancePopups(deltaTime: number): void {
        for (const p of this.popups) {
            p.age += deltaTime;
        }
        this.popups = this.popups.filter((p) => p.age < p.duration);
    }

    update(deltaTime: number): void { void deltaTime; }

    protected draw(ctx: CanvasRenderingContext2D): void {
        this.sprite.paint(ctx);
        this.drawPopups(ctx);
    }

    private drawPopups(ctx: CanvasRenderingContext2D): void {
        if (this.popups.length === 0) return;

        const w = this.transform.width;
        ctx.save();
        ctx.textAlign = "center";
        ctx.font = "bold 13px monospace";

        for (const p of this.popups) {
            if (p.age < 0) continue;

            const t = p.age / p.duration;
            const rise = 34 * t;
            const alpha = 1 - t;
            const x = w / 2;
            const y = -8 - rise;

            ctx.globalAlpha = Math.max(0, alpha);

            ctx.lineWidth = 3;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
            ctx.strokeText(p.text, x, y);

            ctx.fillStyle = "#ffe38a";
            ctx.fillText(p.text, x, y);
        }

        ctx.restore();
    }
}
