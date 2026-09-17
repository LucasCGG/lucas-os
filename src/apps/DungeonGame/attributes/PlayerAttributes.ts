import { EntityAttributes } from "./EntityAttributes";

export class PlayerAttributes extends EntityAttributes {
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

  getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }
}
