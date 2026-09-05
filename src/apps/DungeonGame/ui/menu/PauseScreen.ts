import { AudioManager } from "../../audio/AudioManager";
import { Button } from "../Button";

type PauseAction = "resume" | "start";

export class PauseScreen {
  private static readonly TITLE = "Paused";

  private rows: {
    label: string;
    get: () => number;
    set: (v: number) => void;
  }[];

  private barRects: {
    x: number;
    y: number;
    w: number;
    h: number;
  }[] = [];

  private draggingRow = -1;

  private buttons: Button<PauseAction>[] = [
    new Button<PauseAction>("resume", "RESUME"),
    new Button<PauseAction>("start", "START SCREEN"),
  ];

  constructor(
    private audio: AudioManager = AudioManager.get(),
  ) {
    this.rows = [
      {
        label: "Master",
        get: () => this.audio.getMasterVolume(),
        set: (v) => this.audio.setMasterVolume(v),
      },
      {
        label: "Music",
        get: () => this.audio.getMusicVolume(),
        set: (v) => this.audio.setMusicVolume(v),
      },
      {
        label: "SFX",
        get: () => this.audio.getSfxVolume(),
        set: (v) => this.audio.setSfxVolume(v),
      },
    ];
  }

  onPress(
    mx: number,
    my: number,
  ): PauseAction | null {
    const clicked = this.buttons.find((button) =>
      button.contains(mx, my),
    );

    if (clicked) {
      return clicked.id;
    }

    for (
      let i = 0;
      i < this.barRects.length;
      i++
    ) {
      if (
        this.hits(
          this.barRects[i],
          mx,
          my,
        )
      ) {
        this.draggingRow = i;
        this.applyValue(i, mx);
        return null;
      }
    }

    this.draggingRow = -1;
    return null;
  }

  onDrag(
    mx: number,
    _my: number,
  ): void {
    if (this.draggingRow !== -1) {
      this.applyValue(
        this.draggingRow,
        mx,
      );
    }
  }

  onRelease(): void {
    this.draggingRow = -1;
  }

  private hits(
    r: {
      x: number;
      y: number;
      w: number;
      h: number;
    },
    mx: number,
    my: number,
  ): boolean {
    return (
      mx >= r.x &&
      mx <= r.x + r.w &&
      my >= r.y &&
      my <= r.y + r.h
    );
  }

  private applyValue(
    rowIndex: number,
    mx: number,
  ): void {
    const r =
      this.barRects[rowIndex];

    const value = Math.max(
      0,
      Math.min(
        1,
        (mx - r.x) / r.w,
      ),
    );

    this.rows[rowIndex].set(
      value,
    );
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.fillStyle =
      "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(
      0,
      0,
      width,
      height,
    );

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font =
      "bold 44px Arial";
    ctx.fillText(
      PauseScreen.TITLE,
      width / 2,
      height * 0.22,
    );

    const barW = 320;
    const barH = 16;
    const rowGap = 46;
    const startY = height * 0.4;
    const barX =
      width / 2 - barW / 2;

    this.barRects = [];

    ctx.font = "16px Arial";

    for (
      let i = 0;
      i < this.rows.length;
      i++
    ) {
      const y =
        startY + i * rowGap;

      const value =
        this.rows[i].get();

      ctx.textAlign = "right";
      ctx.fillStyle =
        "#e8e8ff";

      ctx.fillText(
        this.rows[i].label,
        barX - 14,
        y + barH - 2,
      );

      ctx.fillStyle =
        "#2a2a33";

      ctx.fillRect(
        barX,
        y,
        barW,
        barH,
      );

      ctx.fillStyle =
        "#5ad46a";

      ctx.fillRect(
        barX,
        y,
        barW * value,
        barH,
      );

      ctx.strokeStyle =
        "rgba(255,255,255,0.4)";

      ctx.strokeRect(
        barX,
        y,
        barW,
        barH,
      );

      const knobX =
        barX + barW * value;

      ctx.fillStyle =
        this.draggingRow === i
          ? "#ffffff"
          : "#c8ffd4";

      ctx.beginPath();

      ctx.arc(
        knobX,
        y + barH / 2,
        barH * 0.6,
        0,
        Math.PI * 2,
      );

      ctx.fill();

      this.barRects.push({
        x: barX,
        y,
        w: barW,
        h: barH,
      });
    }

    const bw = 260;
    const bh = 54;
    const gap = 16;

    const totalHeight =
      this.buttons.length *
        bh +
      (this.buttons.length - 1) *
        gap;

    const buttonStartY =
      startY +
      this.rows.length *
        rowGap +
      30;

    const x =
      width / 2 - bw / 2;

    this.buttons.forEach(
      (button, i) => {
        button.setRect(
          x,
          buttonStartY +
            i * (bh + gap),
          bw,
          bh,
        );
        button.draw(ctx);
      },
    );

    ctx.fillStyle =
      "#9aa0aa";

    ctx.font =
      "16px Arial";

    ctx.textAlign = "center";

    ctx.fillText(
      "Drag a bar to set volume · Esc or Resume to continue",
      width / 2,
      height * 0.82,
    );
  }

  updateHover(
    mx: number,
    my: number,
  ): void {
    for (const button of this.buttons) {
      button.updateHover(
        mx,
        my,
      );
    }
  }
}
