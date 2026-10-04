import { EntityAttributes } from "./EntityAttributes";
import { Time } from "../engine/Time";

const INVINCIBILITY_DURATION = 0.5;

export class PlayerAttributes extends EntityAttributes {
  private invincibleUntil = 0;
  private experienceToNextLevel = 100;
  private equipmentDefense = 0;
  private equipmentHealth = 0;
  private equipmentSpeed = 0;

  setEquipmentBonuses(defense: number, health: number, speed: number): void {
    const oldMax = this.getMaxHealth();
    const oldEquipmentHealth = this.equipmentHealth;
    this.equipmentDefense = defense;
    this.equipmentHealth = health;
    this.equipmentSpeed = speed;
    this.maxHealth = Math.max(1, oldMax - oldEquipmentHealth + health);
    this.currentHealth = Math.min(this.currentHealth, this.maxHealth);
  }

  override modifyHealth(delta: number): void {
    if (delta < 0) {
      if (this.isInvincible()) {
        return;
      }
      this.invincibleUntil = Time.getTime() + INVINCIBILITY_DURATION;
    }
    super.modifyHealth(delta);
  }

  isInvincible(): boolean {
    return Time.getTime() < this.invincibleUntil;
  }

  override revive(): void {
    super.revive();
    this.invincibleUntil = 0;
  }

  override getMaxHealth(): number { return this.maxHealth; }
  override getDefense(): number { return this.defense + this.equipmentDefense; }
  override getSpeed(): number { return this.movementSpeed + this.equipmentSpeed; }

  gainExperience(amount: number): void {
    this.setExperience(this.getExperience() + amount);
    while (this.getExperience() >= this.experienceToNextLevel) {
      this.setExperience(this.getExperience() - this.experienceToNextLevel);
      this.levelUp();
    }
  }

  levelUp(): void {
      super.levelUp();
      const level = this.getLevel();

      this.experienceToNextLevel = Math.round(this.experienceToNextLevel * 1.15);

      const healthGain = 10 + level * 0.2;
      this.maxHealth += healthGain;
      this.currentHealth = this.maxHealth;

      this.damage += 1 + Math.floor(level / 4);
      this.defense += level <= 8 ? 1 : 0.5;
      this.movementSpeed += 3;

      if (level % 5 === 0) {
        this.maxHealth += 20;
        this.currentHealth = this.maxHealth;
        this.damage += 3;
        this.movementSpeed += 5;
      }
    }

  /** XP needed to gain `levels` more levels from the current one (ignoring XP already banked). */
  getExperienceForLevels(levels: number): number {
    let total = 0;
    let next = this.experienceToNextLevel;
    for (let i = 0; i < levels; i++) {
      total += next;
      next = Math.round(next * 1.15);
    }
    return total;
  }

  getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }
}
