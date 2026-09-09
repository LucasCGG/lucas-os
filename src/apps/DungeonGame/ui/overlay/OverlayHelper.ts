import { Player } from "../../entities/Player";
import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { isHealthAttributes } from "../../utils/isHealthAttributes";
import { Weapon } from "../../weapons/Weapon";
import {
  drawBar,
  drawPanel,
  getWeaponDamage,
  getWeaponName,
  HP_BACKGROUND,
  HP_FILL,
  roundRect,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  XP_BACKGROUND,
  XP_FILL,
} from "./overlayPrimitives";

export class OverlayHelper {
  // Layout
  private static readonly PADDING = 18;
  private static readonly PANEL_WIDTH = 330;
  private static readonly PANEL_HEIGHT = 148;
  private static readonly PANEL_GAP = 12;

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
    const weaponName = getWeaponName(gun);
    const weaponDamage = getWeaponDamage(gun);

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

    drawPanel(
      ctx,
      playerPanelX,
      panelY,
      OverlayHelper.PANEL_WIDTH,
      OverlayHelper.PANEL_HEIGHT
    );

    drawPanel(
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
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText("PLAYER", contentX, y);

    ctx.font = OverlayHelper.VALUE_FONT;
    ctx.fillStyle = TEXT_PRIMARY;

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
    ctx.fillStyle = TEXT_SECONDARY;

    ctx.fillText(
      `HP  ${Math.round(currentHealth)} / ${Math.round(maxHealth)}`,
      contentX,
      y
    );

    y += 17;

    drawBar(
      ctx,
      contentX,
      y,
      OverlayHelper.BAR_WIDTH,
      OverlayHelper.BAR_HEIGHT,
      hpRatio,
      HP_BACKGROUND,
      HP_FILL
    );

    y += 22;

    ctx.fillStyle = TEXT_SECONDARY;

    ctx.fillText(
      `XP  ${Math.round(experience)} / ${Math.round(
        experienceToNextLevel
      )}`,
      contentX,
      y
    );

    y += 17;

    drawBar(
      ctx,
      contentX,
      y,
      OverlayHelper.BAR_WIDTH,
      OverlayHelper.BAR_HEIGHT,
      xpRatio,
      XP_BACKGROUND,
      XP_FILL
    );

    // Weapon panel

     const weaponX = weaponPanelX + OverlayHelper.PADDING;
    const colGap = 20;
    const leftColW = (OverlayHelper.PANEL_WIDTH - OverlayHelper.PADDING * 2 - colGap) * 0.48;
    const listX = weaponX + leftColW + colGap;
    const listRightEdge = weaponPanelX + OverlayHelper.PANEL_WIDTH - OverlayHelper.PADDING;

    let wy = panelY + OverlayHelper.PADDING;

    ctx.font = OverlayHelper.TITLE_FONT;
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("WEAPON", weaponX, wy);

    wy += 20;
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(weaponName, weaponX, wy);

    const statRow = (labelText: string, valueText: string, top: number, valueColor: string) => {
      ctx.font = "10px monospace";
      ctx.fillStyle = TEXT_SECONDARY;
      ctx.fillText(labelText, weaponX, top);
      ctx.font = "bold 15px monospace";
      ctx.fillStyle = valueColor;
      ctx.fillText(valueText, weaponX, top + 12);
    };

    wy += 34;
    statRow("DAMAGE", `${weaponDamage}`, wy, TEXT_PRIMARY);

    wy += 34;
    if (gun !== null && gun instanceof ProjectileWeapon && gun.isReloading()) {
      ctx.font = "10px monospace";
      ctx.fillStyle = "#e7c15a";
      ctx.fillText("RELOADING", weaponX, wy);
      drawBar(ctx, weaponX, wy + 14, leftColW, 7, gun.getReloadProgress(), "#3a2f13", "#e7c15a");
    } else if (gun !== null && gun instanceof ProjectileWeapon) {
      const ammo = gun.getAmmo();
      const mag = gun.getMagazineSize();
      const low = mag > 0 && ammo <= mag * 0.25;
      statRow("AMMO", `${ammo} / ${mag}`, wy, low ? "#e05261" : TEXT_PRIMARY);
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
        roundRect(ctx, listX - 8, rowY - 3, listRightEdge - listX + 12, 20, 5);
        ctx.fill();
      }
      ctx.fillStyle = isActive ? TEXT_PRIMARY : TEXT_SECONDARY;
      ctx.textAlign = "left";
      ctx.fillText(getWeaponName(weapon), listX + (isActive ? 14 : 4), rowY);
      if (isActive) {
        ctx.fillStyle = XP_FILL;
        ctx.fillText("▸", listX, rowY);
      }
    }

    ctx.fillStyle = TEXT_SECONDARY;
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
}
