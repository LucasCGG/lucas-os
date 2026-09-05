import { Transform } from "./Tranform";


export enum CameraMode {
  FIXED,
  FOLLOW,
}

export class Camera {
  x: number;
  y: number;
  smoothSpeed = 5.0;
  private mode: CameraMode = CameraMode.FIXED;
  private viewWidth = 0;
  private viewHeight = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(deltaTime: number, target: Transform, screenWidth: number, screenHeight: number):void {
    this.viewWidth = screenWidth;
    this.viewHeight = screenHeight;

    if (this.mode === CameraMode.FIXED) {
      return;
    }

    const targetX = target.x + target.width / 2 - screenWidth / 2;
    const targetY = target.y + target.height / 2 - screenHeight / 2;

    this.x += (targetX - this.x) * this.smoothSpeed * deltaTime;
    this.y += (targetY - this.y) * this.smoothSpeed * deltaTime;
  }

  toggleMode(): void{
    this.mode = this.mode === CameraMode.FIXED ? CameraMode.FOLLOW : CameraMode.FIXED;
  }

  getMode(): CameraMode{
    return this.mode;
  }

  setSmoothSpeed(speed: number):void {
    this.smoothSpeed = speed;
  }

  screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return { x: sx + this.x, y: sy + this.y };
  }

  worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: wx - this.x, y: wy - this.y };
  }

  getViewBounds(): { x: number; y: number; w: number; h: number } {
    return { x: this.x, y: this.y, w: this.viewWidth, h: this.viewHeight };
  }
}
