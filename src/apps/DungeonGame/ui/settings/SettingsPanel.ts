import { AudioManager } from "../../audio/AudioManager";

type TabId = "audio" | "controls" | "video";

interface Tab {
  id: TabId;
  label: string;
  enabled: boolean;
}

interface Slider {
  label: string;
  get: () => number;
  set: (v: number) => void;
}

export class SettingsPanel {
  private tabs: Tab[] = [
    { id: "audio", label: "AUDIO", enabled: true },
    { id: "controls", label: "CONTROLS", enabled: false },
    { id: "video", label: "VIDEO", enabled: false },
  ];
  private activeTab: TabId = "audio";

  private sliders: Slider[];
  private sliderRects: { x: number; y: number; w: number; h: number }[] = [];
  private tabRects: { id: TabId; x: number; y: number; w: number; h: number }[] = [];
  private dragging = -1;

  constructor(private audio: AudioManager = AudioManager.get()) {
    this.sliders = [
      { label: "Master", get: () => this.audio.getMasterVolume(), set: (v) => this.audio.setMasterVolume(v) },
      { label: "Music", get: () => this.audio.getMusicVolume(), set: (v) => this.audio.setMusicVolume(v) },
      { label: "SFX", get: () => this.audio.getSfxVolume(), set: (v) => this.audio.setSfxVolume(v) },
    ];
  }

  onPress(mx: number, my: number): void {
    for (const t of this.tabRects) {
      if (this.hit(t, mx, my)) {
        const tab = this.tabs.find((x) => x.id === t.id);
        if (tab?.enabled) this.activeTab = t.id;
        return;
      }
    }
    if (this.activeTab === "audio") {
      for (let i = 0; i < this.sliderRects.length; i++) {
        if (this.hit(this.sliderRects[i], mx, my)) {
          this.dragging = i;
          this.apply(i, mx);
          return;
        }
      }
    }
    this.dragging = -1;
  }

  onDrag(mx: number): void {
    if (this.dragging !== -1) this.apply(this.dragging, mx);
  }

  onRelease(): void {
    this.dragging = -1;
  }

  private apply(i: number, mx: number): void {
    const r = this.sliderRects[i];
    this.sliders[i].set(Math.max(0, Math.min(1, (mx - r.x) / r.w)));
  }

  private hit(r: { x: number; y: number; w: number; h: number }, mx: number, my: number): boolean {
    return mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px monospace";
    let tx = x;
    const tabH = 34;
    this.tabRects = [];
    for (const tab of this.tabs) {
      const tw = ctx.measureText(tab.label).width + 28;
      const active = tab.id === this.activeTab;
      if (active) {
        ctx.fillStyle = "rgba(77,163,255,0.18)";
        this.round(ctx, tx, y, tw, tabH, 6);
        ctx.fill();
      }
      ctx.fillStyle = !tab.enabled ? "#4a505c" : active ? "#f2f4f8" : "#8a92a0";
      ctx.textAlign = "center";
      ctx.fillText(tab.label, tx + tw / 2, y + tabH / 2);
      this.tabRects.push({ id: tab.id, x: tx, y, w: tw, h: tabH });
      tx += tw + 8;
    }

    const contentY = y + tabH + 24;

    if (this.activeTab === "audio") {
      this.drawAudio(ctx, x, contentY, w);
    } else {
      ctx.fillStyle = "#5a616e";
      ctx.font = "15px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Coming soon", x + w / 2, contentY + 40);
    }
  }

  private drawAudio(ctx: CanvasRenderingContext2D, x: number, y: number, w: number): void {
    const barW = Math.min(360, w - 90);
    const barH = 16;
    const rowGap = 52;
    const barX = x + 80;

    this.sliderRects = [];
    ctx.font = "14px monospace";
    for (let i = 0; i < this.sliders.length; i++) {
      const ry = y + i * rowGap;
      const value = this.sliders[i].get();

      ctx.textAlign = "right";
      ctx.fillStyle = "#c8ccd4";
      ctx.fillText(this.sliders[i].label, barX - 16, ry + barH / 2 + 4);

      ctx.fillStyle = "#22252e";
      ctx.fillRect(barX, ry, barW, barH);
      ctx.fillStyle = "#5ad46a";
      ctx.fillRect(barX, ry, barW * value, barH);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.strokeRect(barX, ry, barW, barH);

      const knobX = barX + barW * value;
      ctx.fillStyle = this.dragging === i ? "#ffffff" : "#c8ffd4";
      ctx.beginPath();
      ctx.arc(knobX, ry + barH / 2, barH * 0.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.textAlign = "left";
      ctx.fillStyle = "#8a92a0";
      ctx.fillText(`${Math.round(value * 100)}%`, barX + barW + 12, ry + barH / 2 + 4);

      this.sliderRects.push({ x: barX, y: ry, w: barW, h: barH });
    }
  }

  private round(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
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
