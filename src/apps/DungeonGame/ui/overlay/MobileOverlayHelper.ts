import { Player } from "../../entities/Player";
import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { isHealthAttributes } from "../../utils/isHealthAttributes";
import {
  drawBar,
  drawPanel,
  getWeaponDamage,
  getWeaponName,
  HP_BACKGROUND,
  HP_FILL,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  XP_BACKGROUND,
  XP_FILL,
} from "./overlayPrimitives";

export class MobileOverlayHelper {
  private static readonly PADDING = 10;
  private static readonly PANEL_WIDTH = 176;
  private static readonly BAR_HEIGHT = 6;

  public static renderPlayerOverlay(ctx: CanvasRenderingContext2D, player: Player): void {
    const attributes = player.getAttributes();

    if (attributes === null) {
      return;
    }

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

    const hpRatio = maxHealth > 0 ? Math.max(0, Math.min(1, currentHealth / maxHealth)) : 0;

    const xpRatio =
      experienceToNextLevel > 0 ? Math.max(0, Math.min(1, experience / experienceToNextLevel)) : 0;

    const gun = player.getGun();

    const x = MobileOverlayHelper.PADDING;
    const y = MobileOverlayHelper.PADDING;
    const panelWidth = MobileOverlayHelper.PANEL_WIDTH;
    const contentX = x + 8;
    const barWidth = panelWidth - 16;
    const showsAmmoRow = gun instanceof ProjectileWeapon;
    const panelHeight = gun === null ? 68 : showsAmmoRow ? 104 : 90;

    drawPanel(ctx, x, y, panelWidth, panelHeight);

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.font = "bold 10px monospace";
    ctx.fillStyle = TEXT_SECONDARY;
    ctx.fillText(`LV ${level}`, contentX, y + 8);

    ctx.textAlign = "right";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(`${Math.round(currentHealth)}/${Math.round(maxHealth)}`, x + panelWidth - 8, y + 8);
    ctx.textAlign = "left";

    let barY = y + 22;

    drawBar(
      ctx,
      contentX,
      barY,
      barWidth,
      MobileOverlayHelper.BAR_HEIGHT,
      hpRatio,
      HP_BACKGROUND,
      HP_FILL
    );

    barY += MobileOverlayHelper.BAR_HEIGHT + 6;

    drawBar(
      ctx,
      contentX,
      barY,
      barWidth,
      MobileOverlayHelper.BAR_HEIGHT,
      xpRatio,
      XP_BACKGROUND,
      XP_FILL
    );

    if (gun === null) {
      return;
    }

    const weaponY = barY + MobileOverlayHelper.BAR_HEIGHT + 10;

    ctx.font = "bold 11px monospace";
    ctx.fillStyle = TEXT_PRIMARY;
    ctx.fillText(getWeaponName(gun), contentX, weaponY);

    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    ctx.fillStyle = "#e7c15a";
    ctx.fillText(`DMG ${getWeaponDamage(gun)}`, x + panelWidth - 8, weaponY + 1);
    ctx.textAlign = "left";

    if (!showsAmmoRow || !(gun instanceof ProjectileWeapon)) {
      return;
    }

    const ammoY = weaponY + 14;

    ctx.font = "10px monospace";
    ctx.textAlign = "right";

    if (gun.isReloading()) {
      ctx.fillStyle = "#e7c15a";
      ctx.fillText("RELOADING", x + panelWidth - 8, ammoY);
    } else {
      const ammo = gun.getAmmo();
      const mag = gun.getMagazineSize();
      const low = mag > 0 && ammo <= mag * 0.25;

      ctx.fillStyle = low ? "#e05261" : TEXT_SECONDARY;
      ctx.fillText(`${ammo}/${mag}`, x + panelWidth - 8, ammoY);
    }

    ctx.textAlign = "left";
  }
}
