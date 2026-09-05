import { GameScene } from "../engine/GameScene";
import { KeyListener } from "../engine/KeyListener";
import { MouseListener } from "../engine/MouseListener";
import { Button } from "../ui/Button";

const GAME_TITLE = "UNTITLED DUNGEON";
const SUBTITLE = "A roguelite dungeon crawler";

type StartAction = "start" | "roomEditor" | "settings" | "quit";

export class StartScene extends GameScene {
  private keys = KeyListener.get();
  private mouse = MouseListener.get();

  private buttons: Button<StartAction>[] = [
    new Button<StartAction>("start", "START"),
    new Button<StartAction>("roomEditor", "ROOM EDITOR"),
    new Button<StartAction>("settings", "SETTINGS"),
    new Button<StartAction>("quit", "QUIT"),
  ];

  private time = 0;

  onStart: (() => void) | null = null;
  onRoomEditor: (() => void) | null = null;
  onSettings: (() => void) | null = null;

  init(width: number, height: number): void {
    super.init(width, height);
    this.layoutButtons(width, height);
    this.musicKey = "menu";
    this.startMusic();
  }

  private layoutButtons(width: number, height: number): void {
    const bw = 260;
    const bh = 54;
    const gap = 16;

    const totalHeight = this.buttons.length * bh + (this.buttons.length - 1) * gap;
    const startY = height * 0.5 - totalHeight / 6;

    const x = width / 2 - bw / 2;

    this.buttons.forEach((b, i) => {
      b.setRect(
        x,
        startY + i * (bh + gap),
        bw,
        bh,
      );
    });
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    const mx = this.mouse.getX();
    const my = this.mouse.getY();

    for (const b of this.buttons) {
      b.updateHover(mx, my);
    }

    if (this.mouse.isClicked()) {
      const clicked = this.buttons.find((b) => b.contains(mx, my));

      if (clicked) {
        this.activate(clicked.id);
      }
    }

    if (
      this.keys.isKeyJustPressed("Enter") ||
      this.keys.isKeyJustPressed("Space")
    ) {
      this.activate("start");
    }

    this.keys.endFrame();
    this.mouse.endFrame();
  }

  private activate(id: StartAction): void {
    if (id === "start") {
      this.onStart?.();
    } else if (id === "roomEditor") {
      this.onRoomEditor?.();
    } else if (id === "settings") {
      this.onSettings?.();
    }

    // "quit" — no-op in browser
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this;

    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.2,
      width / 2,
      height / 2,
      height * 0.8,
    );

    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.6)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    const bob = Math.sin(this.time * 1.5) * 4;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#e7c15a";
    ctx.font = "bold 56px monospace";
    ctx.fillText(
      GAME_TITLE,
      width / 2,
      height * 0.26 + bob,
    );

    ctx.fillStyle = "#9aa0aa";
    ctx.font = "18px monospace";
    ctx.fillText(
      SUBTITLE,
      width / 2,
      height * 0.26 + 46 + bob,
    );

    for (const b of this.buttons) {
      b.draw(ctx);
    }

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "13px monospace";
    ctx.fillText(
      "Enter to start",
      width / 2,
      height - 24,
    );

    ctx.textBaseline = "alphabetic";
  }

  onResize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.layoutButtons(width, height);
  }
}
