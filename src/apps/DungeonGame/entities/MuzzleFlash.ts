import { Transform } from "../engine";
import { Animation } from "../sprites/Animation";
import { Animator } from "../sprites/Animator";
import { Sprite } from "../sprites/Sprite";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { Entity } from "./Entity";
import { Projectile } from "./Projectile";
import { Team } from "./Team";



const MUZZLE_OFFSET_X = 24;
const MUZZLE_OFFSET_Y = 0;
const FLASH_SIZE = 32;
const FLASH_ANIM_SPEED = 0.03;
const LIFETIME = 0.15;

export class MuzzleFlash extends Projectile {
  private age = 0;

  private constructor(sheet: SpriteSheet, team: Team, transform: Transform) {
    const animator = new Animator();
    animator.addAnimation(
      new Animation("flash", sheet, [0, 1, 2, 3], FLASH_ANIM_SPEED, false),
    );
    animator.play("flash");

    const sprite = new Sprite("MuzzleFlash", animator, transform, false);

    super(sprite, team, transform, new EntityAttributes(1, 0, 0, 0));
  }

  static create(sheet: SpriteSheet, team: Team, origin: Transform): MuzzleFlash {
    const centerX = origin.x + origin.width / 2;
    const centerY = origin.y + origin.height / 2;

    const rad = (origin.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const muzzleX = centerX + MUZZLE_OFFSET_X * cos - MUZZLE_OFFSET_Y * sin;
    const muzzleY = centerY + MUZZLE_OFFSET_X * sin + MUZZLE_OFFSET_Y * cos;

    const transform = new Transform(
      muzzleX - FLASH_SIZE / 2,
      muzzleY - FLASH_SIZE / 2,
      FLASH_SIZE,
      FLASH_SIZE,
      origin.rotation,
    );
    return new MuzzleFlash(sheet, team, transform);
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
    this.sprite?.update(deltaTime);

    this.age += deltaTime;
    if (this.age >= LIFETIME) {
      this.getAttributes().destroy();
    }
  }

  collidesWith(_other: Entity): void {
  }
}
