import { SpriteSheet } from "./SpriteSheet";
import { SpriteFrame } from "./types";

export class Animation {
  readonly name: string;
  private frames: (SpriteFrame | null)[];
  private frameDuration: number;
  private loop: boolean;

  private currentFrameIndex = 0;
  private timer = 0;
  private finished = false;

  constructor(
    name: string,
    sheet: SpriteSheet,
    frameIndices: number[],
    frameDuration: number,
    loop: boolean,
  ) {
    this.name = name;
    this.frameDuration = frameDuration;
    this.loop = loop;
    this.frames = frameIndices.map((i) => sheet.getFrame(i));
  }

  update(deltaTime: number): void {
    if (this.finished) {
      return;
    }
    this.timer += deltaTime;
    if (this.timer >= this.frameDuration) {
      this.timer -= this.frameDuration;
      this.currentFrameIndex++;
      if (this.currentFrameIndex >= this.frames.length) {
        if (this.loop) {
          this.currentFrameIndex = 0;
        } else {
          this.currentFrameIndex = this.frames.length - 1;
          this.finished = true;
        }
      }
    }
  }

  getCurrentFrame(): SpriteFrame | null {
    return this.frames[this.currentFrameIndex] ?? null;
  }

  reset(): void {
    this.currentFrameIndex = 0;
    this.timer = 0;
    this.finished = false;
  }

  isFinished(): boolean {
    return this.finished;
  }

  getName(): string {
    return this.name;
  }
}
