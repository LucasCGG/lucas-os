const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight","Space"])

export class KeyListener {
  private static instance: KeyListener | null = null;

  private pressed = new Set<string>();
  private wasPressed = new Set<string>();
  private justReleased = new Set<string>();

  private constructor() { }

  static get(): KeyListener {
    if (KeyListener.instance === null) {
      KeyListener.instance = new KeyListener();
    }
    return KeyListener.instance
  }

  attach(target: HTMLElement | Window): () => void{
    const onDown = (e: Event) => {
      const code = (e as KeyboardEvent).code;
      if (SCROLL_KEYS.has(code)) {
        e.preventDefault();
      }
      this.pressed.add(code)
    }
    const onUp = (e: Event) => {
      this.pressed.delete((e as KeyboardEvent).code);
    }

    target.addEventListener("keydown", onDown);
    target.addEventListener("keyup", onUp);

    return () => {
      target.removeEventListener("keydown", onDown);
      target.removeEventListener("keyup", onUp);
      this.pressed.clear();
      this.justReleased.clear();
      this.wasPressed.clear();
    }
  }

  endFrame(): void{
    this.justReleased.clear();
    for (const code of this.wasPressed) {
      if (!this.pressed.has(code)) {
        this.justReleased.add(code);
      }
    }
    this.wasPressed = new Set(this.pressed);
  }

  isKeyDown(code: string): boolean{
    return this.pressed.has(code);
  }

  isKeyUp(code: string): boolean{
    return !this.pressed.has(code);
  }

  /** True for exactly one frame on the rising edge. */
  isKeyJustPressed(code: string): boolean{
    return this.pressed.has(code) && !this.wasPressed.has(code);
  }

  /** True for exactly one frame on the falling edge. */
  isKeyJustRelease(code: string): boolean{
    return this.justReleased.has(code);
  }
}
