import demonSpriteUrl from "../assets/char/Flying Demon 2D Pixel Art/Sprites/projectile.png";
import { AssetPool } from "../sprites/AssetPool";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { InspectorRegistry } from "../sprites/InspectorRegistry";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { Sprite } from "../sprites/Sprite";
import { Transform } from "../engine";
import { Enemy } from "./Enemy";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { Team } from "./Team";
import { Sword } from "../weapons/melee/Sword";
import { MeleeTargetProvider } from "./MeleeWeapon";

export class FlyingDemonBoss extends Enemy {
    protected stopDistance = 70;
    private weapon: Sword | null = null;

    private constructor(transform: Transform, team: Team, stats: EntityAttributes, sheet: SpriteSheet) {
        const animator = new Animator();
        animator.addAnimation(new Animation("idle", sheet, [0], 0.1, true));
        animator.play("idle");
        const sprite = new Sprite("flyingDemonBoss", animator, transform, false);
        const sheets = { walk: sheet, idle: sheet };
        super("The Flying Demon", transform, sheets, team, stats, true);
        this.sprite = sprite;
    }

    static async create(transform: Transform, team: Team, stats: EntityAttributes): Promise<FlyingDemonBoss> {
        const path = "boss/flying-demon";
        await AssetPool.loadAll([{ path, url: demonSpriteUrl }]);
        const sheet = new SpriteSheet(path, 48, 32);
        InspectorRegistry.register("boss flying demon", sheet);
        const boss = new FlyingDemonBoss(transform, team, stats, sheet);
        const provider = { getTransform: () => boss.getAimingTransform() };
        const targets: MeleeTargetProvider = { getTargets: () => boss.targetEntity ? [boss.targetEntity] : [] };
        boss.weapon = await Sword.create(provider, team, targets);
        boss.weapon.setDamageOutput(stats.getDamage());
        boss.weapon.setRange(84);
        return boss;
    }

    protected behave(deltaTime: number, distance: number): void {
        if (this.weapon === null) return;
        this.weapon.tick(deltaTime);
        if (this.targetEntity !== null && distance <= this.weapon.getRange()) {
            this.aimAtTarget();
            this.weapon.attack();
        }
    }
}
