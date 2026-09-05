import { Attributes } from "./Attributes";
import { DamageAttributes } from "./DamageAttributes";
import { DefenseAttributes } from "./DefenseAttributes";
import { HealthAttributes } from "./HealthAttributes";
import { MovementsAttributes } from "./MovementAttributes";

export class EntityAttributes
  extends Attributes
  implements HealthAttributes, DamageAttributes, DefenseAttributes, MovementsAttributes
{
  protected maxHealth: number;
  protected currentHealth: number;
  protected movementSpeed: number;
  protected damage: number;
  protected defense: number;
  protected xpReward = 0;

  constructor(maxHealth: number, movementSpeed: number, damage: number, defense: number) {
    super();
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.movementSpeed = movementSpeed;
    this.damage = damage;
    this.defense = defense;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  setCurrentHealth(value: number): void {
    this.currentHealth = Math.max(0, Math.min(value, this.maxHealth));
    if (this.currentHealth <= 0) {
      this.destroy();
    }
  }

  modifyHealth(delta: number): void {
    this.setCurrentHealth(this.currentHealth + delta);
  }

  getDamage(): number {
    return this.damage;
  }

  getDefense(): number {
    return this.defense;
  }

  getSpeed(): number {
    return this.movementSpeed;
  }

  getXpReward(): number { return this.xpReward; }

  setXpReward(v: number): void { this.xpReward = v; }
}
