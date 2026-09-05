import { Transform } from "../engine";
import { Entity } from "./Entity";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { Sprite } from "../sprites/Sprite";
import { CharacterSheets } from "../objects/utils/loadCharacter";
import { Team } from "./Team";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { EntityDelegator } from "../weapons/EntityDelegator";

const ENEMY_ANIMATION_SPEED = 0.1;

type Facing = "front" | "left" | "right" | "back";

export abstract class Enemy extends Entity {
  vx = 0;
  vy = 0;

  protected animator: Animator;
  protected readonly stats: EntityAttributes;
  protected facing: Facing = "front";
  protected targetEntity: Entity | null = null;
  protected aimRotation = 0;

  private detourDir = 0;        // -1, 0, +1
  private detourTimer = 0;


  protected stopDistance = 0;

  private blockedCheck: ((t: Transform) => boolean) | null = null;
  protected delegator: EntityDelegator | null = null;

  protected constructor(
    name: string,
    transform: Transform,
    sheets: CharacterSheets,
    team: Team,
    stats: EntityAttributes,
  ) {
    const animator = new Animator();
    animator.addAnimation(new Animation("idle_front", sheets.idle, [0, 1, 2, 3], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("idle_left", sheets.idle, [4, 5, 6, 7], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("idle_right", sheets.idle, [8, 9, 10, 11], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("idle_back", sheets.idle, [12, 13, 14, 15], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("walk_front", sheets.walk, [0, 1, 2, 3], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("walk_left", sheets.walk, [4, 5, 6, 7], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("walk_right", sheets.walk, [8, 9, 10, 11], ENEMY_ANIMATION_SPEED, true));
    animator.addAnimation(new Animation("walk_back", sheets.walk, [12, 13, 14, 15], ENEMY_ANIMATION_SPEED, true));
    animator.play("idle_front");

    const sprite = new Sprite("enemySprite", animator, transform, false);
    super(name, transform, stats, sprite, team);

    this.stats = stats;
    this.animator = animator;
  }

  setTarget(entity: Entity): void {
    this.targetEntity = entity;
  }

  setBlockedCheck(fn: (t: Transform) => boolean): void {
    this.blockedCheck = fn;
  }

  setDelegator(delegator: EntityDelegator): void {
    this.delegator = delegator;
  }

  update(deltaTime: number): void {
    if (!this.active) {
      return;
    }

    let dx = 0;
    let dy = 0;
    let dist = Infinity;

    if (this.targetEntity !== null) {
      const cx = this.transform.x + this.transform.width / 2;
      const cy = this.transform.y + this.transform.height / 2;
      const tx = this.targetEntity.transform.x + this.targetEntity.transform.width / 2;
      const ty = this.targetEntity.transform.y + this.targetEntity.transform.height / 2;
      dx = tx - cx;
      dy = ty - cy;
      dist = Math.hypot(dx, dy);
      if (dist > 1) {
        dx /= dist;
        dy /= dist;
      } else {
        dx = 0;
        dy = 0;
      }
    }

    const shouldMove = dist > this.stopDistance;
    this.vx = shouldMove ? dx * this.stats.getSpeed() : 0;
    this.vy = shouldMove ? dy * this.stats.getSpeed() : 0;

    this.applyMovement(deltaTime);

    const moving = this.vx !== 0 || this.vy !== 0;
    if (dx !== 0 || dy !== 0) {
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      this.facing = this.facingFromRotation(angleDeg);
    }

    this.behave(deltaTime, dist);


    this.animator.play(`${moving ? "walk" : "idle"}_${this.facing}`);
    this.sprite?.update(deltaTime);
  }

  private applyMovement(deltaTime: number): void {
    if (this.vx === 0 && this.vy === 0) return;
    const blocked = this.blockedCheck;
    const t = this.transform;
    const speed = Math.hypot(this.vx, this.vy);
    const desired = Math.atan2(this.vy, this.vx);

    if (this.tryMove(t, desired, speed, deltaTime, blocked)) {
      this.detourTimer -= deltaTime;
      if (this.detourTimer <= 0) this.detourDir = 0;
      return;
    }

    if (this.detourDir === 0) {
      this.detourDir = this.pickDetourSide(t, desired, speed, deltaTime, blocked);
      this.detourTimer = 0.5;
    }

    for (const mag of [0.6, 1.0, 1.4, Math.PI / 2, 2.0, 2.6]) {
      if (this.tryMove(t, desired + this.detourDir * mag, speed, deltaTime, blocked)) {
        return;
      }
    }
    this.detourDir = 0;
  }

  private tryMove(
    t: Transform, angle: number, speed: number, dt: number,
    blocked: ((tt: Transform) => boolean) | null,
  ): boolean {
    const stepX = Math.cos(angle) * speed * dt;
    const stepY = Math.sin(angle) * speed * dt;
    const probe = t.copy();
    probe.x = t.x + stepX;
    probe.y = t.y + stepY;
    if (blocked === null || !blocked(probe)) {
      t.x += stepX;
      t.y += stepY;
      return true;
    }
    return false;
  }

  private pickDetourSide(
    t: Transform, desired: number, speed: number, dt: number,
    blocked: ((tt: Transform) => boolean) | null,
  ): number {
    const probe = t.copy();
    const left = desired + Math.PI / 2;
    probe.x = t.x + Math.cos(left) * speed * dt;
    probe.y = t.y + Math.sin(left) * speed * dt;
    if (blocked === null || !blocked(probe)) return 1;
    return -1;
  }

  protected behave(_deltaTime: number, _distanceToTarget: number): void {}

  protected getAimingTransform(): Transform {
    const t = this.transform;
    return new Transform(t.x, t.y, t.width, t.height, this.aimRotation);
  }

  protected aimAtTarget(): void {
    if (this.targetEntity === null) return;
    const cx = this.transform.x + this.transform.width / 2;
    const cy = this.transform.y + this.transform.height / 2;
    const tx = this.targetEntity.transform.x + this.targetEntity.transform.width / 2;
    const ty = this.targetEntity.transform.y + this.targetEntity.transform.height / 2;
    this.aimRotation = (Math.atan2(ty - cy, tx - cx) * 180) / Math.PI;
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) {
      return;
    }
    this.sprite?.paint(ctx);
    this.drawHealthBar(ctx);
  }

  private drawHealthBar(ctx: CanvasRenderingContext2D): void {
    const ratio = this.stats.getCurrentHealth() / this.stats.getMaxHealth();
    if (ratio >= 1) return;

    const w = this.transform.width;
    const barH = 5;
    const y = -barH - 4;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, y, w, barH);
    ctx.fillStyle = ratio > 0.5 ? "#5ad46a" : ratio > 0.25 ? "#e7c15a" : "#d6485a";
    ctx.fillRect(0, y, w * Math.max(0, ratio), barH);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, y, w, barH);
  }

  protected facingFromRotation(rotationDeg: number): "front" | "left" | "right" | "back" {
    const radians = (rotationDeg * Math.PI) / 180;
    const dx = Math.cos(radians);
    const dy = Math.sin(radians);
    if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? "left" : "right";
    return dy < 0 ? "back" : "front";
  }

  getStats(): EntityAttributes {
    return this.stats;
  }

  setActive(value: boolean): void {
    if (this.active && !value) {
      this.vx = 0;
      this.vy = 0;
      this.animator.play("idle_front");
    }
    super.setActive(value);
  }
}
