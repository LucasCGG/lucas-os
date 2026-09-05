import { GameObject, Transform } from "../engine";
import { Animator } from "./Animator";
import { AssetPool } from "./AssetPool";
import { ImageSource, SpriteFrame, imageHeight, imageWidth } from "./types";

export class Sprite extends GameObject {
  private staticImage: ImageSource | null = null;
  private animator: Animator | null = null;
  private flipCheck: boolean;
  private previewOverride: SpriteFrame | null = null;

  constructor(name: string, source: string | Animator, transform: Transform, flipCheck = false) {
    super(name, transform);
    if (typeof source === "string") {
      this.staticImage = AssetPool.getImage(source);
    } else {
      this.animator = source;
    }
    this.flipCheck = flipCheck;
  }

  update(deltaTime: number): void {
    this.animator?.update(deltaTime);
  }

  paint(ctx: CanvasRenderingContext2D): void {
    this.draw(ctx);
  }

  protected draw(ctx: CanvasRenderingContext2D): void {
    const frame = this.resolveFrame();
    if (frame === null) {
      return;
    }

    const flipped = this.flipCheck && Math.abs(this.transform.rotation) > 90;
    if (flipped) {
      ctx.save();
      ctx.translate(0, this.transform.height);
      ctx.scale(1, -1);
    }

    ctx.drawImage(
      frame.image,
      frame.sx,
      frame.sy,
      frame.sw,
      frame.sh,
      0,
      0,
      this.transform.width,
      this.transform.height,
    );

    if (flipped) {
      ctx.restore();
    }
  }

  private resolveFrame(): SpriteFrame | null {
    if (this.previewOverride !== null) {
      return this.previewOverride;
    }
    const animFrame = this.animator?.getCurrentFrame() ?? null;
    if (animFrame !== null) {
      return animFrame;
    }
    if (this.staticImage !== null) {
      return {
        image: this.staticImage,
        sx: 0,
        sy: 0,
        sw: imageWidth(this.staticImage),
        sh: imageHeight(this.staticImage),
      };
    }
    return null;
  }

  previewFrame(frame: SpriteFrame | null): void {
    this.previewOverride = frame;
  }

  getAnimator(): Animator | null {
    return this.animator;
  }

  setTransform(transform: Transform): void{
    this.transform = transform;
  }
}
