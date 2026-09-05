import { EntityAttributes } from "../attributes/EntityAttributes";
import { Transform } from "../engine";
import { Entity } from "../entities/Entity";
import { Team } from "../entities/Team";
import { TransformProvider } from "../weapons/TransformProvider";
import { Weapon } from "../weapons/Weapon";

export interface MeleeTargetProvider {
  getTargets(): Entity[];
}

export abstract class MeleeWeapon extends Weapon {
  protected readonly transformProvider: TransformProvider;
  protected readonly team: Team;

  protected damage = 10;
  protected cooldown = 0.5;
  protected range = 60;
  protected targetProvider: MeleeTargetProvider;

  /**
   * Attack cone in degrees.
   *
   * 180 = half-circle in front of the player.
   * 90 = narrow attack cone.
   * 360 = attack everything around the player.
   */
  protected attackAngle = 120;

  private timeSinceAttack = 0;

  protected constructor(
    transformProvider: TransformProvider,
    team: Team,
    targetProvider: MeleeTargetProvider,
  ) {
    super();

    this.transformProvider = transformProvider;
    this.team = team;
    this.targetProvider = targetProvider;
    this.timeSinceAttack = this.cooldown;
  }

  /**
   * Folds the owner's stats into the weapon once when acquired.
   */
  applyOwnerBonus(stats: EntityAttributes): void {
    this.damage += stats.getDamage();

    const speed = stats.getSpeed();

    // Faster characters attack slightly faster.
    this.cooldown = Math.max(
      0.1,
      this.cooldown / (1 + speed / 500),
    );
  }

  tick(deltaTime: number): void {
    this.timeSinceAttack += deltaTime;
  }

  canAttack(): boolean {
    return this.timeSinceAttack >= this.cooldown;
  }

  setTargetProvider(provider: MeleeTargetProvider): void {
    this.targetProvider = provider;
  }

  attack(): Entity[] {
    if (!this.canAttack()) {
      return [];
    }

    this.timeSinceAttack = 0;

    const attackerTransform = this.transformProvider.getTransform();
    const targets = this.targetProvider.getTargets();

    for (const target of targets) {
      if (!this.isValidTarget(target)) {
        continue;
      }

      if (!this.isTargetInRange(attackerTransform, target)) {
        continue;
      }

      if (!this.isTargetInsideAttackAngle(attackerTransform, target)) {
        continue;
      }

      this.damageTarget(target);
    }

    // Melee attacks do not spawn projectile entities.
    return [];
  }

  protected damageTarget(target: Entity): void {
    const attributes = target.getAttributes();

    if (!(attributes instanceof EntityAttributes)) {
      return;
    }

    const finalDamage = Math.max(
      1,
      this.damage - attributes.getDefense(),
    );

    attributes.modifyHealth(-finalDamage);
  }

  private isValidTarget(target: Entity): boolean {
    return target.getTeam() !== this.team;
  }

  private isTargetInRange(
    attacker: Transform,
    target: Entity,
  ): boolean {
    const attackerCenterX =
      attacker.x + attacker.width / 2;

    const attackerCenterY =
      attacker.y + attacker.height / 2;

    const targetTransform = target.getTransform();

    const targetCenterX =
      targetTransform.x + targetTransform.width / 2;

    const targetCenterY =
      targetTransform.y + targetTransform.height / 2;

    const dx = targetCenterX - attackerCenterX;
    const dy = targetCenterY - attackerCenterY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= this.range;
  }

  private isTargetInsideAttackAngle(
    attacker: Transform,
    target: Entity,
  ): boolean {
    // 360 degree attack hits everything around the attacker.
    if (this.attackAngle >= 360) {
      return true;
    }

    const attackerCenterX =
      attacker.x + attacker.width / 2;

    const attackerCenterY =
      attacker.y + attacker.height / 2;

    const targetTransform = target.getTransform();

    const targetCenterX =
      targetTransform.x + targetTransform.width / 2;

    const targetCenterY =
      targetTransform.y + targetTransform.height / 2;

    const targetAngle =
      Math.atan2(
        targetCenterY - attackerCenterY,
        targetCenterX - attackerCenterX,
      ) *
      (180 / Math.PI);

    const difference = this.angleDifference(
      attacker.rotation,
      targetAngle,
    );

    return Math.abs(difference) <= this.attackAngle / 2;
  }

  private angleDifference(
    from: number,
    to: number,
  ): number {
    const difference = (to - from + 540) % 360 - 180;
    return difference;
  }

  // --- accessors ---

  getDamageOutput(): number {
    return this.damage;
  }

  getRange(): number {
    return this.range;
  }

  getCooldown(): number {
    return this.cooldown;
  }

  setDamageOutput(damage: number): void {
    this.damage = Math.max(0, damage);
  }

  setRange(range: number): void {
    this.range = Math.max(0, range);
  }

  setCooldown(seconds: number): void {
    this.cooldown = Math.max(0.05, seconds);
  }

  setAttackAngle(degrees: number): void {
    this.attackAngle = Math.max(
      1,
      Math.min(360, degrees),
    );
  }
}
