import { AudioManager } from "../audio/AudioManager";
import { Camera } from "./Camera";
import { CollisionWorld } from "./physics/CollisionWorld";

export abstract class GameScene {
  protected isRunning = false;

  protected width = 0;
  protected height = 0;

  protected camera!: Camera;
  protected collisionWorld!: CollisionWorld;

  protected musicKey: string | null = null;

  init(
    width: number,
    height: number,
  ): void {
    this.width = width;
    this.height = height;

    this.camera = new Camera(
      0,
      0,
    );

    this.collisionWorld =
      new CollisionWorld();

    this.isRunning = true;
  }

  abstract update(
    deltaTime: number,
  ): void;

  abstract render(
    ctx: CanvasRenderingContext2D,
  ): void;

  abstract onResize(
    width: number,
    height: number,
  ): void;

  protected startMusic(): void {
    if (this.musicKey !== null) {
      AudioManager.get().playMusic(
        this.musicKey,
      );
    }
  }
}
