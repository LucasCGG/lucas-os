import { EntityAttributes } from "../attributes/EntityAttributes";
import { Entity } from "../entities/Entity";

export abstract class Weapon {
  applyOwnerBonus(_stats: EntityAttributes): void {}

  /** Fires the weapon, producing any entities it spawns (e.g. projectiles). */
  abstract attack(): Entity[];

  /** Advance internal timers (cooldown). Call every frame from the owner. */
  abstract tick(deltaTime: number): void;

  /** Damage this weapon deals per hit. Default 0; subclasses override. */
  getDamageOutput(): number {
    return 0;
  }
}
