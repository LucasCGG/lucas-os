import { Weapon } from "../../weapons/Weapon";

export const TEXT_PRIMARY = "#f2f4f8";
export const TEXT_SECONDARY = "#9da5b4";

export const PANEL_BACKGROUND = "rgba(8, 10, 16, 0.88)";
export const PANEL_BORDER = "rgba(255, 255, 255, 0.12)";

export const HP_BACKGROUND = "#35171b";
export const HP_FILL = "#e05261";

export const XP_BACKGROUND = "#182a3b";
export const XP_FILL = "#4da3ff";

export const drawPanel =(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  background: string = PANEL_BACKGROUND,
  border: string = PANEL_BORDER
): void => {
  ctx.fillStyle = background;
  ctx.fillRect(x, y, width, height);

  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
}

export const drawBar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number,
  background: string,
  fill: string
): void => {
  const safeRatio = Math.max(0, Math.min(1, ratio));

  ctx.fillStyle = background;
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width * safeRatio, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
}

export const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void => {
  const radius = Math.min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export const getWeaponName = (weapon: Weapon | null): string =>{
  if (weapon === null) {
    return "None";
  }

  return weapon.constructor.name;
}

export const getWeaponDamage =(weapon: Weapon | null): number =>{
  if (weapon === null) {
    return 0;
  }

  return Math.max(0, weapon.getDamageOutput());
}
