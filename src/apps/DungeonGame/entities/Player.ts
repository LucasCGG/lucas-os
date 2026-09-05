import { KeyListener, Transform } from "../engine";
import { Entity } from "./Entity";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { Sprite } from "../sprites/Sprite";
import {
  CharacterSheets,
  loadCharacter,
} from "../objects/utils/loadCharacter";
import { Team } from "./Team";
import { PlayerAttributes } from "../attributes/PlayerAttributes";
import { Weapon } from "../weapons/Weapon";
import { Pistol } from "../weapons/projectiles/Pistol";
import { Sword } from "../weapons";
import { MeleeTargetProvider, MeleeWeapon } from "./MeleeWeapon";

const PLAYER_ANIMATION_SPEED = 0.1;
const REGEN_INTERVAL = 8;
const REGEN_PER_INTERVAL = 1;
const PLAYER_BASE_DAMAGE = 40;

type Facing = "front" | "left" | "right" | "back";

export class Player extends Entity {
  vx = 0;
  vy = 0;

  private readonly keys = KeyListener.get();
  private readonly animator: Animator;
  private readonly stats: PlayerAttributes;

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
  private weaponIndex = 0;

  /**
   * This provider changes when the player enters a new scene.
   *
   * It starts empty because the Player can be created before a
   * particular WorldScene exists.
   */
  private meleeTargetProvider: MeleeTargetProvider = {
    getTargets: () => [],
  };

  private constructor(
    name: string,
    transform: Transform,
    sheets: CharacterSheets,
    team: Team,
  ) {
    const stats = new PlayerAttributes(
      100, // health
      260, // speed
      10,  // damage
      3,   // defense
    );

    const animator = new Animator();

    animator.addAnimation(
      new Animation(
        "idle_front",
        sheets.idle,
        [0, 1, 2, 3],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "idle_left",
        sheets.idle,
        [4, 5, 6, 7],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "idle_right",
        sheets.idle,
        [8, 9, 10, 11],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "idle_back",
        sheets.idle,
        [12, 13, 14, 15],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "walk_front",
        sheets.walk,
        [0, 1, 2, 3],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "walk_left",
        sheets.walk,
        [4, 5, 6, 7],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "walk_right",
        sheets.walk,
        [8, 9, 10, 11],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.addAnimation(
      new Animation(
        "walk_back",
        sheets.walk,
        [12, 13, 14, 15],
        PLAYER_ANIMATION_SPEED,
        true,
      ),
    );

    animator.play("idle_back");

    const sprite = new Sprite(
      "playerSprite",
      animator,
      transform,
      false,
    );

    super(
      name,
      transform,
      stats,
      sprite,
      team,
    );

    this.stats = stats;
    this.animator = animator;
  }

  /**
   * Creates the player and its starting weapons.
   *
   * The player itself is intended to be created ONCE by DungeonGame
   * and then reused by every WorldScene.
   */
  static async create(
    name: string,
    transform: Transform,
    team: Team,
  ): Promise<Player> {
    const sheets = await loadCharacter(
      "1",
      72,
      72,
    );

    const player = new Player(
      name,
      transform,
      sheets,
      team,
    );

    /**
     * Weapons use this provider to know where the player is aiming.
     *
     * This provider is safe to create here because it points back
     * to the persistent Player object.
     */
    const transformProvider = {
      getTransform: () => player.getAimingTransform(),
    };

    /*
     * Starting pistol.
     */
    const baseGun = await Pistol.create(
      transformProvider,
      team,
    );

    baseGun.setDamageOutput(
      PLAYER_BASE_DAMAGE,
    );

    /*
     * Starting sword.
     *
     * The sword initially gets the player's empty melee provider.
     * The current WorldScene will replace it using
     * setMeleeTargetProvider().
     */
    const sword = await Sword.create(
      transformProvider,
      team,
      player.meleeTargetProvider,
    );

    player.weapons = [
      baseGun,
      sword,
    ];

    /*
     * Apply the player's initial stats once.
     *
     * These bonuses stay with the weapon when the player changes
     * scenes.
     */
    for (const weapon of player.weapons) {
      weapon.applyOwnerBonus(
        player.getStats(),
      );
    }

    player.weaponIndex = 0;

    return player;
  }

  private get currentWeapon(): Weapon | null {
    return (
      this.weapons[this.weaponIndex] ?? null
    );
  }

  switchWeapon(): void {
    if (this.weapons.length === 0) {
      return;
    }

    this.weaponIndex =
      (this.weaponIndex + 1) %
      this.weapons.length;
  }

  /**
   * Change the entities that the player's melee weapons can attack.
   *
   * WorldScene calls this whenever the player enters a new scene.
   */
  setMeleeTargetProvider(
    provider: MeleeTargetProvider,
  ): void {
    this.meleeTargetProvider = provider;

    /*
     * Update every melee weapon that already belongs to
     * the persistent player.
     */
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
    return (
      this.currentWeapon?.constructor.name ??
      "None"
    );
  }

  getAimingTransform(): Transform {
    const t = this.transform;

    return new Transform(
      t.x,
      t.y,
      t.width,
      t.height,
      this.inputRotation,
    );
  }

  update(deltaTime: number): void {
    let dx = 0;
    let dy = 0;

    if (
      this.keys.isKeyDown("KeyW") ||
      this.keys.isKeyDown("ArrowUp")
    ) {
      dy -= 1;
    }

    if (
      this.keys.isKeyDown("KeyS") ||
      this.keys.isKeyDown("ArrowDown")
    ) {
      dy += 1;
    }

    if (
      this.keys.isKeyDown("KeyA") ||
      this.keys.isKeyDown("ArrowLeft")
    ) {
      dx -= 1;
    }

    if (
      this.keys.isKeyDown("KeyD") ||
      this.keys.isKeyDown("ArrowRight")
    ) {
      dx += 1;
    }

    /*
     * Tick every weapon regardless of which one is currently
     * selected so cooldowns/reloads continue correctly.
     */
    for (const weapon of this.weapons) {
      weapon.tick(deltaTime);
    }

    if (this.keys.isKeyJustPressed("KeyQ")) {
      this.switchWeapon();
    }

    const moving =
      dx !== 0 || dy !== 0;

    /*
     * Normalize diagonal movement.
     */
    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    this.vx =
      dx * this.stats.getSpeed();

    this.vy =
      dy * this.stats.getSpeed();

    /*
     * Mouse aim takes priority over movement direction.
     */
    if (this.aimTarget !== null) {
      const centerX =
        this.transform.x +
        this.transform.width / 2;

      const centerY =
        this.transform.y +
        this.transform.height / 2;

      const angle = Math.atan2(
        this.aimTarget.y - centerY,
        this.aimTarget.x - centerX,
      );

      this.inputRotation =
        (angle * 180) / Math.PI;
    } else if (moving) {
      this.inputRotation =
        (Math.atan2(dy, dx) * 180) /
        Math.PI;
    }

    this.animator.play(
      `${moving ? "walk" : "idle"}_${this.facingFromRotation()}`,
    );

    /*
     * Debug XP.
     */
    if (
      this.keys.isKeyJustPressed("KeyL")
    ) {
      this.stats.gainExperience(200);
    }

    /*
     * Passive regeneration.
     */
    this.updateCounter++;

    if (
      this.updateCounter >=
      REGEN_INTERVAL
    ) {
      this.stats.setCurrentHealth(
        this.stats.getCurrentHealth() +
          REGEN_PER_INTERVAL,
      );

      this.updateCounter = 0;
    }

    this.sprite?.update(deltaTime);
  }

  private facingFromRotation(): Facing {
    const radians =
      (this.inputRotation * Math.PI) /
      180;

    const deltaX =
      Math.cos(radians);

    const deltaY =
      Math.sin(radians);

    if (
      Math.abs(deltaX) >=
      Math.abs(deltaY)
    ) {
      return deltaX < 0
        ? "left"
        : "right";
    }

    return deltaY < 0
      ? "back"
      : "front";
  }

  setAimTarget(
    x: number,
    y: number,
  ): void {
    this.aimTarget = {
      x,
      y,
    };
  }

  protected draw(
    ctx: CanvasRenderingContext2D,
  ): void {
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

  addWeapon(
    weapon: Weapon,
  ): void {
    /*
     * Apply owner bonuses only once, when the weapon is acquired.
     */
    weapon.applyOwnerBonus(
      this.stats,
    );

    /*
     * If this is a melee weapon, make sure it uses the
     * current scene's target provider.
     */
    if (weapon instanceof MeleeWeapon) {
      weapon.setTargetProvider(
        this.meleeTargetProvider,
      );
    }

    this.weapons.push(weapon);
  }
}
