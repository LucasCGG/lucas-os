export interface TouchPoint {
  id: number;
  x: number;
  y: number;
}

export class TouchListener {
  private static instance: TouchListener | null = null;

  private touches = new Map<number, TouchPoint>();

  private constructor() {}

  static get(): TouchListener {
    if (TouchListener.instance === null) {
      TouchListener.instance = new TouchListener();
    }

    return TouchListener.instance;
  }

  attach(target: HTMLElement): () => void {
    const getPosition = (touch: Touch): TouchPoint => {
      const rect = target.getBoundingClientRect();

      return {
        id: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    };

    const onStart = (event: TouchEvent): void => {
      event.preventDefault();

      for (const touch of Array.from(event.changedTouches)) {
        const point = getPosition(touch);

        this.touches.set(point.id, point);
      }
    };

    const onMove = (event: TouchEvent): void => {
      event.preventDefault();

      for (const touch of Array.from(event.changedTouches)) {
        const point = getPosition(touch);

        this.touches.set(point.id, point);
      }
    };

    const onEnd = (event: TouchEvent): void => {
      event.preventDefault();

      for (const touch of Array.from(event.changedTouches)) {
        this.touches.delete(touch.identifier);
      }
    };

    const onCancel = (event: TouchEvent): void => {
      for (const touch of Array.from(event.changedTouches)) {
        this.touches.delete(touch.identifier);
      }
    };

    target.addEventListener("touchstart", onStart, {
      passive: false,
    });

    target.addEventListener("touchmove", onMove, {
      passive: false,
    });

    target.addEventListener("touchend", onEnd, {
      passive: false,
    });

    target.addEventListener("touchcancel", onCancel, {
      passive: false,
    });

    return () => {
      target.removeEventListener("touchstart", onStart);
      target.removeEventListener("touchmove", onMove);
      target.removeEventListener("touchend", onEnd);
      target.removeEventListener("touchcancel", onCancel);

      this.touches.clear();
    };
  }

  getTouches(): TouchPoint[] {
    return Array.from(this.touches.values());
  }
}
