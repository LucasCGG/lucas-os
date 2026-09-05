import { EntityAttributes } from "./EntityAttributes";

export class PlayerAttributes extends EntityAttributes {
  private experienceToNextLevel = 100;

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

      const healthGain = 15 + level * 2;
      this.maxHealth += healthGain;
      this.currentHealth = this.maxHealth;

      this.damage += 2 + Math.floor(level / 3);
      this.defense += 1;
      this.movementSpeed += 8;

      if (level % 5 === 0) {
        this.maxHealth += 50;
        this.currentHealth = this.maxHealth;
        this.damage += 5;
        this.movementSpeed += 15;
      }
    }

  getExperienceToNextLevel(): number {
    return this.experienceToNextLevel;
  }
}
