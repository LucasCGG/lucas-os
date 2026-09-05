import { Player } from "../../entities/Player";
import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { isHealthAttributes } from "../../utils/isHealthAttributes";
import { Weapon } from "../../weapons/Weapon";

export class OverlayHelper {
  // Layout
  private static readonly PADDING = 18;
  private static readonly PANEL_WIDTH = 330;
  private static readonly PANEL_HEIGHT = 148;
  private static readonly PANEL_GAP = 12;

  // Appearance
  private static readonly PANEL_BACKGROUND = "rgba(8, 10, 16, 0.88)";
  private static readonly PANEL_BORDER = "rgba(255, 255, 255, 0.12)";
  private static readonly TEXT_PRIMARY = "#f2f4f8";
  private static readonly TEXT_SECONDARY = "#9da5b4";

  // HP
  private static readonly HP_BACKGROUND = "#35171b";
  private static readonly HP_FILL = "#e05261";

  // XP
  private static readonly XP_BACKGROUND = "#182a3b";
  private static readonly XP_FILL = "#4da3ff";

  // Bars
  private static readonly BAR_WIDTH = 300;
  private static readonly BAR_HEIGHT = 12;

  // Typography
  private static readonly TITLE_FONT = "bold 13px monospace";
  private static readonly VALUE_FONT = "bold 17px monospace";
  private static readonly SMALL_FONT = "12px monospace";

  public static renderPlayerOverlay(
    ctx: CanvasRenderingContext2D,
    player: Player,
    width: number,
    height: number
  ): void {
    if (player === null) {
      return;
    }

    const attributes = player.getAttributes();

    if (attributes === null) {
      return;
    }

    // Player stats

    let currentHealth = 0;
    let maxHealth = 1;

    if (isHealthAttributes(attributes)) {
      currentHealth = attributes.getCurrentHealth();
      maxHealth = attributes.getMaxHealth();
    }

    const stats = player.getStats();

    const level = stats.getLevel();
    const experience = stats.getExperience();
    const experienceToNextLevel = stats.getExperienceToNextLevel();

    const hpRatio =
      maxHealth > 0
        ? Math.max(0, Math.min(1, currentHealth / maxHealth))
        : 0;

    const xpRatio =
      experienceToNextLevel > 0
        ? Math.max(
            0,
            Math.min(1, experience / experienceToNextLevel)
          )
        : 0;

    // Weapon

    const gun = player.getGun();
    const weaponList = player.getWeapons() ?? [];
    const weaponName = OverlayHelper.getWeaponName(gun);
    const weaponDamage = OverlayHelper.getWeaponDamage(gun);

    // Layout

    const totalWidth =
      OverlayHelper.PANEL_WIDTH * 2 + OverlayHelper.PANEL_GAP;

    const startX = Math.max(
      OverlayHelper.PADDING,
      (width - totalWidth) / 2
    );

    const panelY =
      height -
      OverlayHelper.PADDING -
      OverlayHelper.PANEL_HEIGHT;

    const playerPanelX = startX;

    const weaponPanelX =
      startX +
      OverlayHelper.PANEL_WIDTH +
      OverlayHelper.PANEL_GAP;

    // Panels

    OverlayHelper.drawPanel(
      ctx,
      playerPanelX,
      panelY,
      OverlayHelper.PANEL_WIDTH,
      OverlayHelper.PANEL_HEIGHT
    );

    OverlayHelper.drawPanel(
      ctx,
      weaponPanelX,
      panelY,
      OverlayHelper.PANEL_WIDTH,
      OverlayHelper.PANEL_HEIGHT
    );

    // Player panel

    const contentX =
      playerPanelX + OverlayHelper.PADDING;

    let y = panelY + OverlayHelper.PADDING;

    ctx.font = OverlayHelper.TITLE_FONT;
    ctx.fillStyle = OverlayHelper.TEXT_SECONDARY;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText("PLAYER", contentX, y);

    ctx.font = OverlayHelper.VALUE_FONT;
    ctx.fillStyle = OverlayHelper.TEXT_PRIMARY;

    ctx.textAlign = "right";
    ctx.fillText(
      `LV ${level}`,
      playerPanelX +
        OverlayHelper.PANEL_WIDTH -
        OverlayHelper.PADDING,
      y - 1
    );

    ctx.textAlign = "left";

    y += 24;

    ctx.font = OverlayHelper.SMALL_FONT;
    ctx.fillStyle = OverlayHelper.TEXT_SECONDARY;

    ctx.fillText(
      `HP  ${Math.round(currentHealth)} / ${Math.round(maxHealth)}`,
      contentX,
      y
    );

    y += 17;

    OverlayHelper.drawBar(
      ctx,
      contentX,
      y,
      OverlayHelper.BAR_WIDTH,
      OverlayHelper.BAR_HEIGHT,
      hpRatio,
      OverlayHelper.HP_BACKGROUND,
      OverlayHelper.HP_FILL
    );

    y += 22;

    ctx.fillStyle = OverlayHelper.TEXT_SECONDARY;

    ctx.fillText(
      `XP  ${Math.round(experience)} / ${Math.round(
        experienceToNextLevel
      )}`,
      contentX,
      y
    );

    y += 17;

    OverlayHelper.drawBar(
      ctx,
      contentX,
      y,
      OverlayHelper.BAR_WIDTH,
      OverlayHelper.BAR_HEIGHT,
      xpRatio,
      OverlayHelper.XP_BACKGROUND,
      OverlayHelper.XP_FILL
    );

    // Weapon panel

     const weaponX = weaponPanelX + OverlayHelper.PADDING;
    const colGap = 20;
    const leftColW = (OverlayHelper.PANEL_WIDTH - OverlayHelper.PADDING * 2 - colGap) * 0.48;
    const listX = weaponX + leftColW + colGap;
    const listRightEdge = weaponPanelX + OverlayHelper.PANEL_WIDTH - OverlayHelper.PADDING;

    let wy = panelY + OverlayHelper.PADDING;

    ctx.font = OverlayHelper.TITLE_FONT;
    ctx.fillStyle = OverlayHelper.TEXT_SECONDARY;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("WEAPON", weaponX, wy);

    wy += 20;
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = OverlayHelper.TEXT_PRIMARY;
    ctx.fillText(weaponName, weaponX, wy);

    const statRow = (labelText: string, valueText: string, top: number, valueColor: string) => {
      ctx.font = "10px monospace";
      ctx.fillStyle = OverlayHelper.TEXT_SECONDARY;
      ctx.fillText(labelText, weaponX, top);
      ctx.font = "bold 15px monospace";
      ctx.fillStyle = valueColor;
      ctx.fillText(valueText, weaponX, top + 12);
    };

    wy += 34;
    statRow("DAMAGE", `${weaponDamage}`, wy, OverlayHelper.TEXT_PRIMARY);

    wy += 34;
    if (gun !== null && gun instanceof ProjectileWeapon && gun.isReloading()) {
      ctx.font = "10px monospace";
      ctx.fillStyle = "#e7c15a";
      ctx.fillText("RELOADING", weaponX, wy);
      OverlayHelper.drawBar(ctx, weaponX, wy + 14, leftColW, 7, gun.getReloadProgress(), "#3a2f13", "#e7c15a");
    } else if (gun !== null && gun instanceof ProjectileWeapon) {
      const ammo = gun.getAmmo();
      const mag = gun.getMagazineSize();
      const low = mag > 0 && ammo <= mag * 0.25;
      statRow("AMMO", `${ammo} / ${mag}`, wy, low ? "#e05261" : OverlayHelper.TEXT_PRIMARY);
    }

    const rowH = 22;
    const listBlockH = weaponList.length * rowH;
    const listAreaTop = panelY + OverlayHelper.PADDING + 18;
    const listAreaH = OverlayHelper.PANEL_HEIGHT - OverlayHelper.PADDING * 2 - 18;
    const visibleRows = Math.max(1, Math.floor(listAreaH / rowH));

    const activeIndex = Math.max(0, weaponList.indexOf(gun as Weapon));
    let firstVisible = 0;
    if (weaponList.length > visibleRows) {
      firstVisible = Math.min(
        Math.max(0, activeIndex - Math.floor(visibleRows / 2)),
        weaponList.length - visibleRows,
      );
    }

    const startY =
      listBlockH <= listAreaH
        ? listAreaTop + (listAreaH - listBlockH) / 2
        : listAreaTop;

    ctx.font = "13px monospace";
    for (let row = 0; row < visibleRows; row++) {
      const idx = firstVisible + row;
      if (idx >= weaponList.length) break;
      const weapon = weaponList[idx];
      const rowY = startY + row * rowH;
      const isActive = weapon === gun;

      if (isActive) {
        ctx.fillStyle = "rgba(77, 163, 255, 0.16)";
        OverlayHelper.roundRect(ctx, listX - 8, rowY - 3, listRightEdge - listX + 12, 20, 5);
        ctx.fill();
      }
      ctx.fillStyle = isActive ? OverlayHelper.TEXT_PRIMARY : OverlayHelper.TEXT_SECONDARY;
      ctx.textAlign = "left";
      ctx.fillText(OverlayHelper.getWeaponName(weapon), listX + (isActive ? 14 : 4), rowY);
      if (isActive) {
        ctx.fillStyle = OverlayHelper.XP_FILL;
        ctx.fillText("▸", listX, rowY);
      }
    }

    ctx.fillStyle = OverlayHelper.TEXT_SECONDARY;
    ctx.textAlign = "center";
    const arrowX = (listX + listRightEdge) / 2;
    if (firstVisible > 0) ctx.fillText("▲", arrowX, listAreaTop - 12);
    if (firstVisible + visibleRows < weaponList.length) ctx.fillText("▼", arrowX, listAreaTop + listAreaH - 2);
    ctx.textAlign = "left";

    // Controls

    ctx.font = "11px monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";

    ctx.textAlign = "center";

    ctx.fillText(
      "LMB  FIRE     C  CAMERA     L  +200 XP",
      width / 2,
      height - 5
    );

    ctx.textAlign = "left";
  }

  private static drawPanel(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = OverlayHelper.PANEL_BACKGROUND;
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = OverlayHelper.PANEL_BORDER;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  }

  private static drawBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    ratio: number,
    background: string,
    fill: string
  ): void {
    const safeRatio = Math.max(0, Math.min(1, ratio));

    ctx.fillStyle = background;
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = fill;
    ctx.fillRect(
      x,
      y,
      width * safeRatio,
      height
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.strokeRect(
      x + 0.5,
      y + 0.5,
      width - 1,
      height - 1
    );
  }

  private static roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  private static getWeaponName(
    weapon: Weapon | null
  ): string {
    if (weapon === null) {
      return "None";
    }

    return weapon.constructor.name;
  }

  private static getWeaponDamage(
    weapon: Weapon | null
  ): number {
    if (weapon === null) {
      return 0;
    }

    return Math.max(0, weapon.getDamageOutput());
  }
}
