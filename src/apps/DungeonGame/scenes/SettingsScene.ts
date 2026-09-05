import { GameScene } from "../engine/GameScene";
import { KeyListener } from "../engine/KeyListener";
import { MouseListener } from "../engine/MouseListener";
import { SettingsPanel } from "../ui/settings/SettingsPanel";
import { Button } from "../ui/Button";

export class SettingsScene extends GameScene {
  private keys = KeyListener.get();
  private mouse = MouseListener.get();
  private panel = new SettingsPanel();

  private backBtn = new Button("back", "BACK", { font: "bold 18px monospace" });

  onBack: (() => void) | null = null;

  init(width: number, height: number): void {
    super.init(width, height);
  }

  update(_deltaTime: number): void {
    const mx = this.mouse.getX();
    const my = this.mouse.getY();

    this.backBtn.updateHover(mx, my);

    if (this.mouse.isClicked()) {
      if (this.backBtn.contains(mx, my)) this.onBack?.();
      else this.panel.onPress(mx, my);
    } else if (this.mouse.isDown()) {
      this.panel.onDrag(mx);
    } else if (this.mouse.isReleased()) {
      this.panel.onRelease();
    }

    if (this.keys.isKeyJustPressed("Escape")) this.onBack?.();

    this.keys.endFrame();
    this.mouse.endFrame();
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this;

    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e7c15a";
    ctx.font = "bold 40px monospace";
    ctx.fillText("SETTINGS", width / 2, height * 0.16);

    const pw = Math.min(620, width - 80);
    const ph = Math.min(380, height - 220);
    const px = (width - pw) / 2;
    const py = height * 0.24;

    ctx.fillStyle = "rgba(18,20,28,0.9)";
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

    this.panel.draw(ctx, px + 24, py + 20, pw - 48, ph - 40);

    // Back button
    const bw = 160;
    const bh = 46;
    this.backBtn.setRect(width / 2 - bw / 2, py + ph + 24, bw, bh);
    this.backBtn.draw(ctx);

    ctx.textBaseline = "alphabetic";
  }

  onResize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}
