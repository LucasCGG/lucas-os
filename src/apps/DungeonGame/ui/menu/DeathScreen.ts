import { Player } from "../../entities/Player";
import { Button } from "../Button";

type DeathAction = "restart" | "menu" | null;

const RED_STYLE = {
  fillHover: "rgba(214,72,90,0.25)",
  borderHover: "#d6485a",
  font: "bold 20px monospace",
};

export class DeathScreen {
  private buttons = [
    new Button<"restart" | "menu">("restart", "TRY AGAIN", RED_STYLE),
    new Button<"restart" | "menu">("menu", "MAIN MENU", RED_STYLE),
  ];

  onPress(mx: number, my: number): DeathAction {
    const b = this.buttons.find((btn) => btn.contains(mx, my));
    return b ? b.id : null;
  }

  updateHover(mx: number, my: number): void {
    for (const b of this.buttons) b.updateHover(mx, my);
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number, player: Player): void {
    ctx.fillStyle = "rgba(20, 0, 0, 0.72)";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#d6485a";
    ctx.font = "bold 64px monospace";
    ctx.fillText("YOU DIED", width / 2, height * 0.32);

    const s = player.getStats();
    ctx.fillStyle = "#c8ccd4";
    ctx.font = "18px monospace";
    ctx.fillText(`Reached Level ${s.getLevel()}`, width / 2, height * 0.44);

    const bw = 240;
    const bh = 52;
    const gap = 16;
    const bx = width / 2 - bw / 2;
    const by = height * 0.54;

    this.buttons.forEach((b, i) => {
      b.setRect(bx, by + i * (bh + gap), bw, bh);
      b.draw(ctx);
    });

    ctx.textBaseline = "alphabetic";
  }
}
