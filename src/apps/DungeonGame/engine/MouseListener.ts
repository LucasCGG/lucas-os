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
