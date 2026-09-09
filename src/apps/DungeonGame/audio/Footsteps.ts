import { AudioManager } from "./AudioManager";

const STEP_INTERVAL = 0.33;
const STEP_SOUNDS = ["step_stone_1", "step_stone_2", "step_stone_3"];

export class Footsteps {
  private timer = 0;

  update(deltaTime: number, moving: boolean): void {
    if (!moving) {
      this.timer = 0;
      return;
    }

    this.timer += deltaTime;

    if (this.timer >= STEP_INTERVAL) {
      this.timer -= STEP_INTERVAL;
      const sound = STEP_SOUNDS[Math.floor(Math.random() * STEP_SOUNDS.length)];
      AudioManager.get().playSound(sound);
    }
  }
}
