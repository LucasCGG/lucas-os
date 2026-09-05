import { GameObject } from "../engine/GameObject";
import { Transform } from "../engine/Tranform";
import { AssetPool } from "../sprites/AssetPool";
import { SpriteSheet } from "../sprites/SpriteSheet";
import { Animator } from "../sprites/Animator";
import { Animation } from "../sprites/Animation";
import { SpriteFrame } from "../sprites/types";

const GATE_SHEET = "dungeon/gate-anim";
const GATE_FRAME = 32;
const GATE_FRAMES = 26;
const OPEN_FRAME_TIME = 0.05;

export class ExitPad extends GameObject {
  reached = false;

  private active = false;
  private animator: Animator | null = null;

  constructor(name: string, transform: Transform) {
    super(name, transform);
  }

  static async loadSheet(url: string): Promise<void> {
    await AssetPool.loadAll([{ path: GATE_SHEET, url }]);
  }

  private ensureAnimator(): void {
    if (this.animator !== null) return;
    if (AssetPool.getImage(GATE_SHEET) === null) return;

    const sheet = new SpriteSheet(GATE_SHEET, GATE_FRAME, GATE_FRAME);
    const openFrames = Array.from({ length: GATE_FRAMES }, (_, i) => i);

    this.animator = new Animator();
    this.animator.addAnimation(new Animation("closed", sheet, [0], 0.4, true));
    this.animator.addAnimation(new Animation("opening", sheet, openFrames, OPEN_FRAME_TIME, false));
    this.animator.play("closed");
  }

  setActive(value: boolean): void {
    if (value && !this.active) {
      this.ensureAnimator();
      this.animator?.play("opening");
    }
    this.active = value;
  }

  isActive(): boolean {
    return this.active;
  }

  update(deltaTime: number): void {
    this.ensureAnimator();
    this.animator?.update(deltaTime);
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    const w = this.transform.width;
    const h = this.transform.height;

    this.ensureAnimator();
    const frame: SpriteFrame | null = this.animator?.getCurrentFrame() ?? null;

    if (frame === null) {
      ctx.fillStyle = this.active ? "rgba(90,212,106,0.45)" : "rgba(120,120,130,0.25)";
      ctx.fillRect(0, 0, w, h);
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(frame.image, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, w, h);

    if (this.active && this.animator!.isFinished() && this.reached) {
      ctx.strokeStyle = "rgba(90,212,106,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
    }
  }
}
