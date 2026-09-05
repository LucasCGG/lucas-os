import { Animation } from "./Animation";
import { SpriteFrame } from "./types";

export class Animator {
  private animations = new Map<string, Animation>();
  private currentAnimation: Animation | null = null;
  private currentName: string | null = null;

  addAnimation(animation: Animation): void {
    this.animations.set(animation.getName(), animation);
  }

  play(name: string): void {
    if (name === this.currentName) {
      return;
    }
    const next = this.animations.get(name);
    if (next === undefined) {
      console.error(`Animator: unknown animation '${name}'`);
      return;
    }
    next.reset();
    this.currentAnimation = next;
    this.currentName = next.getName();
  }

  update(deltaTime: number): void {
    this.currentAnimation?.update(deltaTime);
  }

  getCurrentFrame(): SpriteFrame | null {
    return this.currentAnimation?.getCurrentFrame() ?? null;
  }

  isFinished(): boolean {
    return this.currentAnimation !== null && this.currentAnimation.isFinished();
  }

  getCurrentName(): string | null {
    return this.currentName;
  }
}
