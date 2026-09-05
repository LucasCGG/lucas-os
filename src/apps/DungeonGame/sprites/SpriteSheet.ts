import { AssetPool } from "./AssetPool";
import { ImageSource, SpriteFrame, imageHeight, imageWidth } from "./types";

export class SpriteSheet {
  private image: ImageSource | null;
  private frameW: number;
  private frameH: number;
  private readonly sourcePath: string;

  constructor(path: string, frameWidth: number, frameHeight: number) {
    this.sourcePath = path;
    this.image = AssetPool.getImage(path);
    this.frameW = frameWidth;
    this.frameH = frameHeight;
  }

  getFrame(index: number): SpriteFrame | null {
    if (this.image === null) {
      return null;
    }
    const cols = Math.floor(imageWidth(this.image) / this.frameW);
    const rows = Math.floor(imageHeight(this.image) / this.frameH);
    const total = cols * rows;
    if (index < 0 || index >= total) {
      return null;
    }
    const col = index % cols;
    const row = Math.floor(index / cols);
    const sx = col * this.frameW;
    const sy = row * this.frameH;
    const sw = Math.min(this.frameW, imageWidth(this.image) - sx);
    const sh = Math.min(this.frameH, imageHeight(this.image) - sy);
    if (sw <= 0 || sh <= 0) {
      return null;
    }
    return { image: this.image, sx, sy, sw, sh };
  }

  getTotalFrames(): number {
    if (this.image === null) {
      return 0;
    }
    const cols = Math.floor(imageWidth(this.image) / this.frameW);
    const rows = Math.floor(imageHeight(this.image) / this.frameH);
    return cols * rows;
  }

  refresh(): void {
    this.image = AssetPool.getImage(this.sourcePath);
  }

  setFrameSize(frameWidth: number, frameHeight: number): void {
    this.frameW = frameWidth;
    this.frameH = frameHeight;
  }

  getSourcePath(): string {
    return this.sourcePath;
  }

  getFrameWidth(): number {
    return this.frameW;
  }

  getFrameHeight(): number {
    return this.frameH;
  }

  getImage(): ImageSource | null {
    return this.image;
  }
}
