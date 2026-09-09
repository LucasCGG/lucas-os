import { TouchListener, TouchPoint } from "./input/TouchListener";

const JOYSTICK_RADIUS = 70;

const AIM_DEADZONE = 0.22;

export class MobileInput {
  private static instance: MobileInput | null = null;

  private screenWidth = 0;
  private screenHeight = 0;

  private movementTouchId: number | null = null;
  private aimTouchId: number | null = null;

  private moveBaseX = 0;
  private moveBaseY = 0;

  private moveX = 0;
  private moveY = 0;
  private moveActive = false;

  private aimBaseX = 0;
  private aimBaseY = 0;

  private aimRawX = 0;
  private aimRawY = 0;

  private aimDirX = 0;
  private aimDirY = 0;

  private aimActive = false;
  private aimHasDirection = false;

  private pausePending = false;
  private switchWeaponPending = false;
  private characterScreenPending = false;

  private readonly joystickRadius = JOYSTICK_RADIUS;

  private constructor() {}

  static get(): MobileInput {
    if (MobileInput.instance === null) {
      MobileInput.instance = new MobileInput();
    }

    return MobileInput.instance;
  }

  update(screenWidth: number, screenHeight: number): void {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    const touches = TouchListener.get().getTouches();

    this.moveX = 0;
    this.moveY = 0;
    this.moveActive = false;

    this.aimActive = false;
    this.aimHasDirection = false;

    const leftTouches = touches.filter(
      (touch) => touch.x < screenWidth / 2
    );

    const rightTouches = touches.filter(
      (touch) => touch.x >= screenWidth / 2
    );

    this.updateMovement(leftTouches);
    this.updateAim(rightTouches);
  }

  private updateMovement(touches: TouchPoint[]): void {
    if (this.movementTouchId !== null) {
      const activeTouch = touches.find(
        (touch) => touch.id === this.movementTouchId
      );

      if (activeTouch === undefined) {
        this.movementTouchId = null;
      }
    }

    if (this.movementTouchId === null && touches.length > 0) {
      const touch = touches[0];

      this.movementTouchId = touch.id;

      this.moveBaseX = this.clamp(touch.x, this.joystickRadius, this.screenWidth - this.joystickRadius);
      this.moveBaseY = this.clamp(touch.y, this.joystickRadius, this.screenHeight - this.joystickRadius);
    }

    if (this.movementTouchId === null) {
      return;
    }

    const touch = touches.find(
      (touch) => touch.id === this.movementTouchId
    );

    if (touch === undefined) {
      return;
    }

    this.moveActive = true;

    let dx = touch.x - this.moveBaseX;
    let dy = touch.y - this.moveBaseY;

    const distance = Math.hypot(dx, dy);

    if (distance > this.joystickRadius) {
      dx = (dx / distance) * this.joystickRadius;
      dy = (dy / distance) * this.joystickRadius;
    }

    this.moveX = dx / this.joystickRadius;
    this.moveY = dy / this.joystickRadius;
  }

  private updateAim(touches: TouchPoint[]): void {
    if (this.aimTouchId !== null) {
      const activeTouch = touches.find(
        (touch) => touch.id === this.aimTouchId
      );

      if (activeTouch === undefined) {
        this.aimTouchId = null;
      }
    }

    if (this.aimTouchId === null && touches.length > 0) {
      const touch = touches[0];

      this.aimTouchId = touch.id;

      this.aimBaseX = this.clamp(touch.x, this.joystickRadius, this.screenWidth - this.joystickRadius);
      this.aimBaseY = this.clamp(touch.y, this.joystickRadius, this.screenHeight - this.joystickRadius);
    }

    if (this.aimTouchId === null) {
      return;
    }

    const touch = touches.find(
      (touch) => touch.id === this.aimTouchId
    );

    if (touch === undefined) {
      return;
    }

    this.aimActive = true;

    let dx = touch.x - this.aimBaseX;
    let dy = touch.y - this.aimBaseY;

    const distance = Math.hypot(dx, dy);

    if (distance > this.joystickRadius) {
      dx = (dx / distance) * this.joystickRadius;
      dy = (dy / distance) * this.joystickRadius;
    }

    this.aimRawX = dx;
    this.aimRawY = dy;

    if (distance / this.joystickRadius >= AIM_DEADZONE) {
      this.aimDirX = dx / this.joystickRadius;
      this.aimDirY = dy / this.joystickRadius;
      this.aimHasDirection = true;
    }
  }

  private clamp(value: number, min: number, max: number): number {
    if (max < min) {
      return (min + max) / 2;
    }

    return Math.min(max, Math.max(min, value));
  }

  getMoveX(): number {
    return this.moveX;
  }

  getMoveY(): number {
    return this.moveY;
  }

  /** Normalized -1..1 aim direction, only meaningful when hasAimDirection() is true. */
  getAimDirX(): number {
    return this.aimDirX;
  }

  getAimDirY(): number {
    return this.aimDirY;
  }

  /** True once the aim stick has been dragged past its deadzone. */
  hasAimDirection(): boolean {
    return this.aimHasDirection;
  }

  /** True whenever the aim stick is being held, regardless of drag distance — this is what fires the weapon. */
  isAttacking(): boolean {
    return this.aimActive;
  }

  getMoveJoystickBase(): { x: number; y: number } | null {
    return this.moveActive ? { x: this.moveBaseX, y: this.moveBaseY } : null;
  }

  getMoveJoystickKnob(): { x: number; y: number } | null {
    if (!this.moveActive) {
      return null;
    }

    return {
      x: this.moveBaseX + this.moveX * this.joystickRadius,
      y: this.moveBaseY + this.moveY * this.joystickRadius,
    };
  }

  getAimJoystickBase(): { x: number; y: number } | null {
    return this.aimActive ? { x: this.aimBaseX, y: this.aimBaseY } : null;
  }

  getAimJoystickKnob(): { x: number; y: number } | null {
    if (!this.aimActive) {
      return null;
    }

    return {
      x: this.aimBaseX + this.aimRawX,
      y: this.aimBaseY + this.aimRawY,
    };
  }

  triggerPause(): void {
    this.pausePending = true;
  }

  consumePause(): boolean {
    const value = this.pausePending;

    this.pausePending = false;

    return value;
  }

  triggerSwitchWeapon(): void {
    this.switchWeaponPending = true;
  }

  consumeSwitchWeapon(): boolean {
    const value = this.switchWeaponPending;

    this.switchWeaponPending = false;

    return value;
  }

  triggerCharacterScreen(): void {
    this.characterScreenPending = true;
  }

  consumeCharacterScreen(): boolean {
    const value = this.characterScreenPending;

    this.characterScreenPending = false;

    return value;
  }
}
