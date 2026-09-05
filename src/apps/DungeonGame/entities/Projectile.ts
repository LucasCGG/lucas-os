import { Transform } from "../engine";
import { Sprite } from "../sprites/Sprite";
import { Entity } from "./Entity";
import { Team } from "./Team";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { MoveStrategy } from "../sprites/strategies/MoveStrategy";
import { GoStraightStrategy } from "../sprites/strategies/GoStraightStrategy";

export interface ProjectileOptions {
  maxRange?: number;
  falloffStart?: number;
  falloffEnd?: number;
  minDamageFactor?: number;
}

export class Projectile extends Entity {
  private readonly stats: EntityAttributes;
  private readonly moveStrategy: MoveStrategy;

  private distanceTravelled = 0;
  private readonly maxRange: number;
  private readonly falloffStart: number;
  private readonly falloffEnd: number;
  private readonly minDamageFactor: number;

  constructor(
    sprite: Sprite,
    team: Team,
    trajectory: Transform,
    projectileAttributes: EntityAttributes = new EntityAttributes(1, 10, 8, 0),
    options: ProjectileOptions = {},
  ) {
    super("projectile", trajectory, projectileAttributes, sprite, team);
    this.stats = projectileAttributes;
    this.moveStrategy = new GoStraightStrategy(trajectory);
    sprite.setTransform(trajectory);

    this.maxRange = options.maxRange ?? 0;
    this.falloffStart = options.falloffStart ?? Infinity;
    this.falloffEnd = options.falloffEnd ?? Infinity;
    this.minDamageFactor = options.minDamageFactor ?? 1;
  }

  isDead(): boolean {
    return this.stats.isDestroyed();
  }

  update(_deltaTime: number): void {
    const prev = this.transform;
    const newTransform = this.moveStrategy.move(prev, this.stats.getSpeed());

    // Accumulate real distance travelled this step.
    this.distanceTravelled += Math.hypot(newTransform.x - prev.x, newTransform.y - prev.y);

    this.transform = newTransform;
    this.getSprite()?.setTransform(newTransform);

    // Hard range limit: despawn.
    if (this.maxRange > 0 && this.distanceTravelled >= this.maxRange) {
      this.stats.destroy();
    }
  }

  /** Full damage scaled by distance-based falloff. */
  private currentDamage(): number {
    const base = this.stats.getDamage();
    if (this.distanceTravelled <= this.falloffStart) {
      return base;
    }
    if (this.distanceTravelled >= this.falloffEnd) {
      return base * this.minDamageFactor;
    }
    // Linear interpolate between full and floor across the falloff band.
    const span = this.falloffEnd - this.falloffStart;
    const t = (this.distanceTravelled - this.falloffStart) / span;
    const factor = 1 - t * (1 - this.minDamageFactor);
    return base * factor;
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    this.sprite?.paint(ctx);
  }

  collidesWith(entity: Entity): void {
    if (this.isDead()) {
      return;
    }
    super.collidesWith(entity);

    const otherTeam = entity.getTeam();
    const myTeam = this.getTeam();
    const isEnemy = otherTeam !== null && (myTeam === null || !otherTeam.equals(myTeam));

    if (isEnemy) {
      const target = entity.getAttributes();
      if (target instanceof EntityAttributes) {
        const raw = this.currentDamage() - target.getDefense();
        target.modifyHealth(-Math.max(1, Math.round(raw)));
      }
      this.stats.destroy();
    }
  }
}
