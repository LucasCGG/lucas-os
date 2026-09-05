export interface ButtonStyle {
  fill: string;
  fillHover: string;
  border: string;
  borderHover: string;
  text: string;
  textHover: string;
  font: string;
  radius: number;
}

const DEFAULT_STYLE: ButtonStyle = {
  fill: "rgba(255,255,255,0.06)",
  fillHover: "rgba(231,193,90,0.22)",
  border: "rgba(255,255,255,0.15)",
  borderHover: "#e7c15a",
  text: "#c8ccd4",
  textHover: "#ffffff",
  font: "bold 22px monospace",
  radius: 8,
};

export class Button<T = string> {
  private x = 0;
  private y = 0;
  private w = 0;
  private h = 0;
  hovered = false;

  constructor(
    readonly id: T,
    public label: string,
    private style: Partial<ButtonStyle> = {},
  ) {}

  setRect(x: number, y: number, w: number, h: number): void {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(mx: number, my: number): boolean {
    return mx >= this.x && mx <= this.x + this.w && my >= this.y && my <= this.y + this.h;
  }

  updateHover(mx: number, my: number): void {
    this.hovered = this.contains(mx, my);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const s = { ...DEFAULT_STYLE, ...this.style };
    const hov = this.hovered;

    ctx.fillStyle = hov ? s.fillHover : s.fill;
    this.roundRect(ctx, s.radius);
    ctx.fill();

    ctx.strokeStyle = hov ? s.borderHover : s.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = hov ? s.textHover : s.text;
    ctx.font = s.font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  private roundRect(ctx: CanvasRenderingContext2D, r: number): void {
    const { x, y, w, h } = this;
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}
