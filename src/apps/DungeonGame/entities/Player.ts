import { Transform } from "../engine";
import { Entity } from "./Entity";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { Sprite } from "../sprites/Sprite";
import { CharacterSheets, loadCharacter } from "../objects/utils/loadCharacter";
import { Team } from "./Team";
import { getCharacterFrameSize } from "./characterSkins";
import { PlayerAttributes } from "../attributes/PlayerAttributes";
import { Weapon } from "../weapons/Weapon";
import { Pistol } from "../weapons/projectiles/Pistol";
import { Sword } from "../weapons";
import { MeleeTargetProvider, MeleeWeapon } from "./MeleeWeapon";
import { Footsteps } from "../audio/Footsteps";
import { Armor } from "../items/Armor";

const PLAYER_ANIMATION_SPEED = 0.1;
const REGEN_INTERVAL = 30;
const REGEN_PER_INTERVAL = 1;
const PLAYER_BASE_DAMAGE = 40;
const PLAYER_MELEE_ATTACK_SOUNDS = ["ninja_attack_1", "ninja_attack_2"];

type Facing = "front" | "left" | "right" | "back";

export class Player extends Entity {
    vx = 0;
    vy = 0;

    private readonly animator: Animator;
    private readonly stats: PlayerAttributes;

    private moveInputX = 0;
    private moveInputY = 0;

    private inputRotation = 0;
    private updateCounter = 0;

    private aimTarget: {
        x: number;
        y: number;
    } | null = null;

    /**
     * The player's weapons persist with the player between scenes.
     */
    private weapons: Weapon[] = [];
    private armor: (Armor | null)[] = [null, null, null];
    private armorInventory: Armor[] = [];
    private weaponIndex = 0;

    private meleeTargetProvider: MeleeTargetProvider = {
        getTargets: () => [],
    };

    private readonly footsteps = new Footsteps();

    private constructor(name: string, transform: Transform, sheets: CharacterSheets, team: Team) {
        const stats = new PlayerAttributes(
            100,
            260,
            10,
            3
        );

        const animator = new Animator();

        animator.addAnimation(
            new Animation("idle_front", sheets.idle, [0, 1, 2, 3], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("idle_left", sheets.idle, [4, 5, 6, 7], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("idle_right", sheets.idle, [8, 9, 10, 11], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("idle_back", sheets.idle, [12, 13, 14, 15], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("walk_front", sheets.walk, [0, 1, 2, 3], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("walk_left", sheets.walk, [4, 5, 6, 7], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("walk_right", sheets.walk, [8, 9, 10, 11], PLAYER_ANIMATION_SPEED, true)
        );

        animator.addAnimation(
            new Animation("walk_back", sheets.walk, [12, 13, 14, 15], PLAYER_ANIMATION_SPEED, true)
        );

        animator.play("idle_back");

        const sprite = new Sprite("playerSprite", animator, transform, false);

        super(name, transform, stats, sprite, team);

        this.stats = stats;
        this.animator = animator;
    }


    static async create(name: string, transform: Transform, team: Team): Promise<Player> {
        const playerSkin = "1";
        const frameSize = getCharacterFrameSize(playerSkin);

        const sheets = await loadCharacter(playerSkin, frameSize.width, frameSize.height);

        const player = new Player(name, transform, sheets, team);

        const transformProvider = {
            getTransform: () => player.getAimingTransform(),
        };

        const baseGun = await Pistol.create(transformProvider, team);

        baseGun.setDamageOutput(PLAYER_BASE_DAMAGE);

        const sword = await Sword.create(transformProvider, team, player.meleeTargetProvider);

        sword.setAttackSounds(PLAYER_MELEE_ATTACK_SOUNDS);

        player.weapons = [baseGun, sword];

        for (const weapon of player.weapons) {
            weapon.applyOwnerBonus(player.getStats());
        }

        player.weaponIndex = 0;

        return player;
    }

    private get currentWeapon(): Weapon | null {
        return this.weapons[this.weaponIndex] ?? null;
    }

    switchWeapon(): void {
        if (this.weapons.length === 0) {
            return;
        }

        this.weaponIndex = (this.weaponIndex + 1) % this.weapons.length;
    }

    equipWeapon(index: number): void {
        if (index >= 0 && index < this.weapons.length) {
            this.weaponIndex = index;
        }
    }

    getCurrentWeaponIndex(): number {
        return this.weaponIndex;
    }

    moveWeapon(index: number, direction: -1 | 1): void {
        const targetIndex = index + direction;
        if (index < 0 || targetIndex < 0 || targetIndex >= this.weapons.length) return;
        const [weapon] = this.weapons.splice(index, 1);
        this.weapons.splice(targetIndex, 0, weapon);
        if (this.weaponIndex === index) this.weaponIndex = targetIndex;
        else if (this.weaponIndex === targetIndex) this.weaponIndex = index;
    }

    discardWeapon(index: number): boolean {
        if (this.weapons.length <= 1 || index < 0 || index >= this.weapons.length) return false;
        const wasEquipped = index === this.weaponIndex;
        this.weapons.splice(index, 1);
        if (wasEquipped) this.weaponIndex = Math.min(index, this.weapons.length - 1);
        else if (this.weaponIndex > index) this.weaponIndex--;
        return true;
    }

    setMovementInput(x: number, y: number): void {
        this.moveInputX = x;
        this.moveInputY = y;
    }

    setMeleeTargetProvider(provider: MeleeTargetProvider): void {
        this.meleeTargetProvider = provider;

        for (const weapon of this.weapons) {
            if (weapon instanceof MeleeWeapon) {
                weapon.setTargetProvider(provider);
            }
        }
    }

    fire(): Entity[] {
        if (this.currentWeapon === null) {
            return [];
        }

        return this.currentWeapon.attack();
    }

    getCurrentWeaponName(): string {
        return this.currentWeapon?.getDisplayName() ?? "None";
    }

    getAimingTransform(): Transform {
        const t = this.transform;

        return new Transform(t.x, t.y, t.width, t.height, this.inputRotation);
    }

    getFacingRotation(): number {
        return this.inputRotation;
    }

    update(deltaTime: number): void {
        let dx = this.moveInputX;
        let dy = this.moveInputY;

        for (const weapon of this.weapons) {
            weapon.tick(deltaTime);
        }

        const moving = dx !== 0 || dy !== 0;

        /*
         * Normalize diagonal movement.
         */
        if (dx !== 0 && dy !== 0) {
            dx *= Math.SQRT1_2;
            dy *= Math.SQRT1_2;
        }

        this.vx = dx * this.stats.getSpeed();

        this.vy = dy * this.stats.getSpeed();

        if (this.aimTarget !== null) {
            const centerX = this.transform.x + this.transform.width / 2;

            const centerY = this.transform.y + this.transform.height / 2;

            const angle = Math.atan2(this.aimTarget.y - centerY, this.aimTarget.x - centerX);

            this.inputRotation = (angle * 180) / Math.PI;
        } else if (moving) {
            this.inputRotation = (Math.atan2(dy, dx) * 180) / Math.PI;
        }

        this.animator.play(`${moving ? "walk" : "idle"}_${this.facingFromRotation()}`);

        this.footsteps.update(deltaTime, moving);

        this.updateCounter++;

        if (this.updateCounter >= REGEN_INTERVAL) {
            this.stats.setCurrentHealth(this.stats.getCurrentHealth() + REGEN_PER_INTERVAL);

            this.updateCounter = 0;
        }

        this.sprite?.update(deltaTime);
    }

    private facingFromRotation(): Facing {
        const radians = (this.inputRotation * Math.PI) / 180;

        const deltaX = Math.cos(radians);

        const deltaY = Math.sin(radians);

        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            return deltaX < 0 ? "left" : "right";
        }

        return deltaY < 0 ? "back" : "front";
    }

    setAimTarget(x: number, y: number): void {
        this.aimTarget = {
            x,
            y,
        };
    }

    protected draw(ctx: CanvasRenderingContext2D): void {
        this.sprite?.paint(ctx);
    }

    getStats(): PlayerAttributes {
        return this.stats;
    }

    getGun(): Weapon | null {
        return this.currentWeapon;
    }

    getWeapons(): Weapon[] {
        return this.weapons;
    }

    addWeapon(weapon: Weapon): void {
        weapon.applyOwnerBonus(this.stats);

        if (weapon instanceof MeleeWeapon) {
            weapon.setTargetProvider(this.meleeTargetProvider);
            weapon.setAttackSounds(PLAYER_MELEE_ATTACK_SOUNDS);
        }

        this.weapons.push(weapon);
    }

    getArmor(): (Armor | null)[] { return [...this.armor]; }

    getArmorInventory(): Armor[] { return [...this.armorInventory]; }

    addArmor(item: Armor): void {
        this.armorInventory.push(item);
    }

    equipArmor(index: number): boolean {
        if (index < 0 || index >= this.armorInventory.length) return false;
        const item = this.armorInventory[index];
        const slot = item.slot === "head" ? 0 : item.slot === "chest" ? 1 : 2;
        const previous = this.armor[slot];
        this.armor[slot] = item;
        this.armorInventory.splice(index, 1);
        if (previous !== null) this.armorInventory.push(previous);
        this.refreshArmorBonuses();
        return true;
    }

    discardArmor(index: number): boolean {
        if (index < 0 || index >= this.armorInventory.length) return false;
        this.armorInventory.splice(index, 1);
        return true;
    }

    private refreshArmorBonuses(): void {
        const equipped = this.armor.filter((item): item is Armor => item !== null);
        this.stats.setEquipmentBonuses(
            equipped.reduce((sum, item) => sum + item.defense, 0),
            equipped.reduce((sum, item) => sum + item.maxHealth, 0),
            equipped.reduce((sum, item) => sum + item.speed, 0),
        );
    }
}
