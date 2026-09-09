export class MouseListener {
  private static instance: MouseListener | null = null;
  private x = 0;
  private y = 0;

  private down = false;
  private pressedThisFrame = false;
  private releasedThisFrame = false;

  static get(): MouseListener {
    if (MouseListener.instance === null) MouseListener.instance = new MouseListener();
    return MouseListener.instance;
  }

  attach(target: HTMLElement): () => void {
    const onMove = (e: MouseEvent): void => {
      const rect = target.getBoundingClientRect();
      this.x = e.clientX - rect.left;
      this.y = e.clientY - rect.top;
    };
    const onDown = (e: MouseEvent): void => {
      const rect = target.getBoundingClientRect();
      this.x = e.clientX - rect.left;
      this.y = e.clientY - rect.top;
      if (!this.down) this.pressedThisFrame = true;
      this.down = true;
    };
    const onUp = (): void => {
      if (this.down) this.releasedThisFrame = true;
      this.down = false;
    };

    target.addEventListener("mousemove", onMove);
    target.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      target.removeEventListener("mousemove", onMove);
      target.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }

  attachTouch(target: HTMLElement): () => void {
    let activeTouchId: number | null = null;

    const getPosition = (touch: Touch): { x: number; y: number } => {
      const rect = target.getBoundingClientRect();
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const onStart = (e: TouchEvent): void => {
      if (activeTouchId !== null) {
        return;
      }

      const touch = e.changedTouches[0];
      activeTouchId = touch.identifier;

      const pos = getPosition(touch);
      this.x = pos.x;
      this.y = pos.y;

      if (!this.down) this.pressedThisFrame = true;
      this.down = true;
    };

    const onMove = (e: TouchEvent): void => {
      const touch = Array.from(e.changedTouches).find((t) => t.identifier === activeTouchId);
      if (touch === undefined) return;

      const pos = getPosition(touch);
      this.x = pos.x;
      this.y = pos.y;
    };

    const onEnd = (e: TouchEvent): void => {
      const touch = Array.from(e.changedTouches).find((t) => t.identifier === activeTouchId);
      if (touch === undefined) return;

      activeTouchId = null;

      if (this.down) this.releasedThisFrame = true;
      this.down = false;
    };

    target.addEventListener("touchstart", onStart, { passive: true });
    target.addEventListener("touchmove", onMove, { passive: true });
    target.addEventListener("touchend", onEnd, { passive: true });
    target.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      target.removeEventListener("touchstart", onStart);
      target.removeEventListener("touchmove", onMove);
      target.removeEventListener("touchend", onEnd);
      target.removeEventListener("touchcancel", onEnd);
    };
  }

  isDown(): boolean {
    return this.down;
  }

  isClicked(): boolean {
    return this.pressedThisFrame;
  }

  isReleased(): boolean {
    return this.releasedThisFrame;
  }

  endFrame(): void {
    this.pressedThisFrame = false;
    this.releasedThisFrame = false;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}
