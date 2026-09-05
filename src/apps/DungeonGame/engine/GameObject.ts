import { Camera } from "./Camera";
import { Transform } from "./Tranform";

export abstract class GameObject {
  private static idCounter = 0;

  readonly id: number;
  name: string;
  transform: Transform;
  private alive = true;

  constructor(name: string, transform: Transform) {
    this.id = GameObject.idCounter++;
    this.name = name;
    this.transform = transform;
  }

  abstract update(deltaTime: number): void;

  render(ctx: CanvasRenderingContext2D, camera: Camera): void{
    if (!this.alive) {
      return;
    }

    ctx.save();
    const screenX = this.transform.x - camera.x;
    const screenY = this.transform.y - camera.y;

    const cx = screenX + this.transform.width / 2;
    const cy = screenY + this.transform.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((this.transform.rotation * Math.PI) / 180);
    ctx.translate(-this.transform.width / 2, -this.transform.height / 2);

    this.draw(ctx);
    ctx.restore();
  }

  protected abstract draw(ctx: CanvasRenderingContext2D): void;

  destroy(): void{
    this.alive = false;
  }

  isAlive(): boolean{
    return this.alive;
  }
}
