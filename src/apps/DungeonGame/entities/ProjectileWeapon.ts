import { Transform } from "../engine";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { Sprite } from "../sprites/Sprite";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { Entity } from "./Entity";
import { Projectile } from "./Projectile";
import { Team } from "./Team";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { Weapon } from "../weapons/Weapon";
import { TransformProvider } from "../weapons/TransformProvider";

const PROJECTILE_SIZE = 28;
const PROJECTILE_ANIM_SPEED = 0.08;

export abstract class ProjectileWeapon extends Weapon {
  protected readonly transformProvider: TransformProvider;
  protected readonly team: Team;
  protected readonly sheet: SpriteSheet;
  protected readonly projectileAnimation: Animation;

  protected damage = 8;
  protected projectileSpeed = 10;
  protected cooldown = 0.75;
  protected maxRange = 0;
  protected falloffStart = Infinity;
  protected falloffEnd = Infinity;
  protected minDamageFactor = 1;
  protected pellets = 1;
  protected spreadDegrees = 0;

  magazineSize = 29;
  reloadTime = 2.0;

  private ammo = this.magazineSize;
  private timeSinceShot = 0;
  private reloading = false;
  private reloadTimer = 0;

  protected constructor(transformProvider: TransformProvider, team: Team, sheet: SpriteSheet) {
    super();
    this.transformProvider = transformProvider;
    this.team = team;
    this.sheet = sheet;
    this.projectileAnimation = new Animation(
      "fly",
      this.sheet,
      [0, 1, 2, 3, 4, 5, 6, 7],
      PROJECTILE_ANIM_SPEED,
      true,
    );
    this.timeSinceShot = this.cooldown;
    this.ammo = this.magazineSize;
  }

  /**
   * Folds the owner's stats into this weapon's base stats ONCE, at acquisition.
   * These become permanent — later level-ups do NOT re-buff this weapon.
   */
  applyOwnerBonus(stats: EntityAttributes): void {
    this.damage += stats.getDamage();
    const speed = stats.getSpeed();
    this.reloadTime = Math.max(0.2, this.reloadTime / (1 + speed / 500));
  }

  tick(deltaTime: number): void {
    this.timeSinceShot += deltaTime;

    if (this.reloading) {
      this.reloadTimer += deltaTime;
      if (this.reloadTimer >= this.reloadTime) {
        this.ammo = this.magazineSize;
        this.reloading = false;
        this.reloadTimer = 0;
      }
    }
  }

  reload(): void {
    if (this.reloading || this.ammo >= this.magazineSize) {
      return;
    }
    this.reloading = true;
    this.reloadTimer = 0;
  }

  canFire(): boolean {
    return !this.reloading && this.ammo > 0 && this.timeSinceShot >= this.cooldown;
  }

  attack(): Entity[] {
    if (!this.canFire()) {
      if (this.ammo <= 0 && !this.reloading) {
        this.reload();
      }
      return [];
    }

    this.timeSinceShot = 0;
    this.ammo--;

    const startPoint = this.transformProvider.getTransform();
    const shots: Entity[] = [];

    for (let i = 0; i < this.pellets; i++) {
      const jitter = this.spreadDegrees === 0 ? 0 : (Math.random() - 0.5) * this.spreadDegrees;
      const rotation = startPoint.rotation + jitter;
      const spawnTransform = new Transform(
        startPoint.x,
        startPoint.y,
        PROJECTILE_SIZE,
        PROJECTILE_SIZE,
        rotation,
      );
      const attributes = new EntityAttributes(1, this.projectileSpeed, this.damage, 0);
      shots.push(
        new Projectile(this.createProjectileSprite(spawnTransform), this.team, spawnTransform, attributes, {
          maxRange: this.maxRange,
          falloffStart: this.falloffStart,
          falloffEnd: this.falloffEnd,
          minDamageFactor: this.minDamageFactor,
        }),
      );
    }

    if (this.ammo <= 0) {
      this.reload();
    }

    return shots;
  }

  // --- accessors for the HUD ---
  getAmmo(): number {
    return this.ammo;
  }
  getMagazineSize(): number {
    return this.magazineSize;
  }
  isReloading(): boolean {
    return this.reloading;
  }
  getReloadProgress(): number {
    return this.reloading ? this.reloadTimer / this.reloadTime : 1;
  }
  setFireCooldown(seconds: number): void {
    this.cooldown = Math.max(0, seconds);
  }
  setDamageOutput(damage: number): void {
    this.damage = Math.max(0, damage);
  }
  getDamageOutput(): number {
    return this.damage;
  }

  private createProjectileSprite(transform: Transform): Sprite {
    const animator = new Animator();
    animator.addAnimation(this.projectileAnimation);
    animator.play("fly");
    return new Sprite("Projectile", animator, transform, true);
  }
}
