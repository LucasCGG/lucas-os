import { GameScene } from "./GameScene";
import { KeyListener } from "./KeyListener";
import { Time } from "./Time";

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
      const deltaTime = now - this.lastTime;
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
