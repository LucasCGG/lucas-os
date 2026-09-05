export class Attributes {
  private level = 1;
  private experience = 0;
  private destroyed = false;

  levelUp(): void {
    this.level++;
  }

  gainExperience(amount: number): void {
    this.experience += amount;
  }

  getLevel(): number {
    return this.level;
  }

  getExperience(): number {
    return this.experience;
  }

  setLevel(level: number): void {
    this.level = level;
  }

  setExperience(experience: number): void {
    this.experience = experience;
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  destroy(): void {
    this.destroyed = true;
  }
}
