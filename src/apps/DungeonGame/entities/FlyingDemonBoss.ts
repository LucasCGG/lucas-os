import idleUrl from "../assets/char/Flying Demon 2D Pixel Art/Sprites/with_outline/IDLE.png";
import flyingUrl from "../assets/char/Flying Demon 2D Pixel Art/Sprites/with_outline/FLYING.png";
import attackUrl from "../assets/char/Flying Demon 2D Pixel Art/Sprites/with_outline/ATTACK.png";
import hurtUrl from "../assets/char/Flying Demon 2D Pixel Art/Sprites/with_outline/HURT.png";
import deathUrl from "../assets/char/Flying Demon 2D Pixel Art/Sprites/with_outline/DEATH.png";
import { AssetPool } from "../sprites/AssetPool";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { InspectorRegistry } from "../sprites/InspectorRegistry";
import { Transform } from "../engine";
import { Enemy } from "./Enemy";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { Team } from "./Team";
import { Sword } from "../weapons/melee/Sword";
import { MeleeTargetProvider } from "./MeleeWeapon";
import { attachEnemyVoice } from "../audio/EnemyVoice";
import { CharacterSheets } from "../objects/utils/loadCharacter";
import { PlayerAttributes } from "../attributes/PlayerAttributes";

// Every Flying Demon sheet is a single front-facing row of 81x71 frames.
const DEMON_FRAME_WIDTH = 81;
const DEMON_FRAME_HEIGHT = 71;
// Drawn at the sheet's aspect ratio so the demon isn't squashed.
const BOSS_SCALE = 1.4;
// Killing the boss is worth this many player levels of XP, whatever level the player is at.
const BOSS_XP_LEVELS = 3;
// Used when no player is known yet (shouldn't happen in practice).
const BOSS_FALLBACK_XP = 1000;

const SHEETS = {
    idle: idleUrl,
    flying: flyingUrl,
    attack: attackUrl,
    hurt: hurtUrl,
    death: deathUrl,
};

export class FlyingDemonBoss extends Enemy {
    protected stopDistance = 70;
    private weapon: Sword | null = null;

    private constructor(transform: Transform, team: Team, stats: EntityAttributes, sheets: CharacterSheets) {
        super("The Flying Demon", transform, sheets, team, stats, "strip");
    }

    /** The boss's standard stats; a fresh instance per spawn since stats track health. */
    static createStats(player: PlayerAttributes | null): EntityAttributes {
        const stats = new EntityAttributes(1800, 115, 52, 12);
        stats.setXpReward(player?.getExperienceForLevels(BOSS_XP_LEVELS) ?? BOSS_FALLBACK_XP);
        return stats;
    }

    /** A correctly sized transform with the boss centred on (centerX, centerY). */
    static spawnTransform(centerX: number, centerY: number): Transform {
        const width = DEMON_FRAME_WIDTH * BOSS_SCALE;
        const height = DEMON_FRAME_HEIGHT * BOSS_SCALE;
        return new Transform(centerX - width / 2, centerY - height / 2, width, height, 0);
    }

    static async create(transform: Transform, team: Team, stats: EntityAttributes): Promise<FlyingDemonBoss> {
        const path = (name: string) => `boss/flying-demon/${name}`;
        await AssetPool.loadAll(Object.entries(SHEETS).map(([name, url]) => ({ path: path(name), url })));

        const sheet = (name: keyof typeof SHEETS) => {
            const s = new SpriteSheet(path(name), DEMON_FRAME_WIDTH, DEMON_FRAME_HEIGHT);
            InspectorRegistry.register(`boss flying demon ${name}`, s);
            return s;
        };
        const clip = (name: keyof typeof SHEETS) => {
            const s = sheet(name);
            return { sheet: s, framesPerRow: s.getTotalFrames() };
        };

        const sheets: CharacterSheets = {
            idle: sheet("idle"),
            walk: sheet("flying"),
            attack: clip("attack"),
            hurt: clip("hurt"),
            death: clip("death"),
        };

        const boss = new FlyingDemonBoss(transform, team, stats, sheets);
        // Without this the boss never enters its dying state, so it lingers (and keeps fighting) at 0 HP.
        attachEnemyVoice(stats, "blood", () => boss.playHurt(), () => boss.playDeath());

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
        if (this.targetEntity !== null && distance <= this.weapon.getRange() && this.weapon.canAttack()) {
            this.aimAtTarget();
            this.weapon.attack();
            this.playAttack();
        }
    }
}
