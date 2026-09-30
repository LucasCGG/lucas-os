import { GameScene } from "./GameScene";
import { KeyListener } from "./input/KeyListener";
import { Time } from "./Time";

// Cap a single frame's step so a stalled tab or slow frame can't teleport entities.
const MAX_DELTA_TIME = 0.1;

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScene: GameScene | null = null;
  private rafId: number | null = null;
  private lastTime = 0;

  clearColor = "#0e0e12";

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("2D canvas context unavailable");
    }
    this.ctx = ctx;
  }

  setScene(scene: GameScene): void{
    this.currentScene = scene;
    scene.init(this.canvas.width, this.canvas.height);
  }

  onResize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.currentScene?.onResize(width, height)
  }

  start(): void{
    if (this.rafId !== null) {
      return;
    }
    this.lastTime = Time.getTime();

    const loop = (): void => {
      const now = Time.getTime();
      const deltaTime = Math.min(now - this.lastTime, MAX_DELTA_TIME);
      this.lastTime = now;

      this.ctx.fillStyle = this.clearColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      if (this.currentScene !== null) {
        this.currentScene.update(deltaTime);
        this.currentScene.render(this.ctx);
      }

      KeyListener.get().endFrame();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void{
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
