import { Player } from "../../entities/Player";
import { RARITY_COLORS, RARITY_LABELS } from "../../types/ItemRarity";

type TabId = "attributes" | "inventory" | "skills";

interface Tab {
    id: TabId;
    label: string;
}

export class CharacterScreen {
    private tabs: Tab[] = [
        { id: "attributes", label: "ATTRIBUTES" },
        { id: "inventory", label: "INVENTORY" },
        { id: "skills", label: "SKILLS" },
    ];
    private activeTab: TabId = "attributes";
    private tabRects: { id: TabId; x: number; y: number; w: number; h: number }[] = [];
    private inventoryRects: {
        index: number;
        x: number;
        y: number;
        w: number;
        h: number;
        discardX: number;
        upX: number;
        downX: number;
    }[] = [];
    private armorRects: { index: number; x: number; y: number; w: number; h: number; discardX: number }[] = [];
    private scrollOffset = 0;
    private maxScroll = 0;

    setActiveTab(tab: TabId): void {
        this.activeTab = tab;
        this.scrollOffset = 0;
    }

    handleScroll(delta: number): void {
        if (this.activeTab !== "inventory" || delta === 0) return;
        this.scrollOffset = Math.max(0, Math.min(this.maxScroll, this.scrollOffset + delta * 0.7));
    }

    handleClick(mx: number, my: number, player: Player): void {
        for (const r of this.tabRects) {
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                this.activeTab = r.id;
                return;
            }
        }

        const contentY = my + (this.activeTab === "inventory" ? this.scrollOffset : 0);

        for (const rect of this.inventoryRects) {
            if (mx >= rect.x && mx <= rect.x + rect.w && contentY >= rect.y && contentY <= rect.y + rect.h) {
                if (mx >= rect.discardX) {
                    player.discardWeapon(rect.index);
                } else if (mx >= rect.downX) {
                    player.moveWeapon(rect.index, 1);
                } else if (mx >= rect.upX) {
                    player.moveWeapon(rect.index, -1);
                } else {
                    player.equipWeapon(rect.index);
                }
                return;
            }
        }
        for (const rect of this.armorRects) {
            if (mx >= rect.x && mx <= rect.x + rect.w && contentY >= rect.y && contentY <= rect.y + rect.h) {
                if (mx >= rect.discardX) player.discardArmor(rect.index);
                else player.equipArmor(rect.index);
                return;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, player: Player, width: number, height: number): void {
        ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillRect(0, 0, width, height);

        const pw = Math.min(560, width - 80);
        const ph = Math.min(440, height - 80);
        const px = (width - pw) / 2;
        const py = (height - ph) / 2;

        ctx.fillStyle = "rgba(12, 14, 20, 0.97)";
        this.roundRect(ctx, px, py, pw, ph, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textBaseline = "middle";
        ctx.font = "bold 13px monospace";
        const tabH = 40;
        let tx = px + 20;
        this.tabRects = [];
        for (const tab of this.tabs) {
            const tw = ctx.measureText(tab.label).width + 28;
            const active = tab.id === this.activeTab;

            if (active) {
                ctx.fillStyle = "rgba(77, 163, 255, 0.18)";
                this.roundRect(ctx, tx, py + 12, tw, tabH - 8, 6);
                ctx.fill();
            }
            ctx.fillStyle = active ? "#f2f4f8" : "#7a828f";
            ctx.textAlign = "center";
            ctx.fillText(tab.label, tx + tw / 2, py + 12 + (tabH - 8) / 2);

            this.tabRects.push({ id: tab.id, x: tx, y: py + 12, w: tw, h: tabH - 8 });
            tx += tw + 8;
        }

        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.beginPath();
        ctx.moveTo(px + 16, py + tabH + 14);
        ctx.lineTo(px + pw - 16, py + tabH + 14);
        ctx.stroke();

        const contentX = px + 28;
        const contentY = py + tabH + 34;
        const contentW = pw - 56;

        if (this.activeTab === "attributes") {
            this.drawAttributes(ctx, player, contentX, contentY, contentW);
        } else if (this.activeTab === "inventory") {
            const viewportY = contentY;
            const viewportH = ph - tabH - 62;
            this.maxScroll = this.getInventoryHeight(player, contentW) - viewportH;
            this.maxScroll = Math.max(0, this.maxScroll);
            this.scrollOffset = Math.min(this.scrollOffset, this.maxScroll);
            ctx.save();
            ctx.beginPath();
            ctx.rect(contentX, viewportY, contentW, viewportH);
            ctx.clip();
            ctx.translate(0, -this.scrollOffset);
            this.drawInventory(ctx, player, contentX, contentY, contentW);
            ctx.restore();
            if (this.maxScroll > 0) {
                const trackX = px + pw - 12;
                const trackY = viewportY;
                const trackH = viewportH;
                const thumbH = Math.max(24, trackH * viewportH / (viewportH + this.maxScroll));
                const thumbY = trackY + (trackH - thumbH) * (this.scrollOffset / this.maxScroll);
                ctx.fillStyle = "rgba(255,255,255,0.08)";
                ctx.fillRect(trackX, trackY, 4, trackH);
                ctx.fillStyle = "rgba(120,170,230,0.75)";
                ctx.fillRect(trackX, thumbY, 4, thumbH);
            }
        } else {
            this.drawPlaceholder(ctx, "Skill tree coming soon", contentX, contentY, contentW);
        }

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("I to close", width / 2, py + ph - 16);
        ctx.textAlign = "left";
    }

    private drawInventory(
        ctx: CanvasRenderingContext2D,
        player: Player,
        x: number,
        y: number,
        w: number
    ): void {
        const weapons = player.getWeapons();
        const armor = player.getArmorInventory();
        this.inventoryRects = [];
        this.armorRects = [];

        ctx.fillStyle = "#f2f4f8";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "left";
        ctx.fillText("INVENTORY", x, y);

        const gap = 8;
        const columns = 3;
        const cellW = (w - gap * (columns - 1)) / columns;
        const cellH = 62;
        weapons.forEach((weapon, index) => {
            const column = index % columns;
            const rowIndex = Math.floor(index / columns);
            const cellX = x + column * (cellW + gap);
            const cellY = y + 30 + rowIndex * (cellH + gap);
            const active = index === player.getCurrentWeaponIndex();
            const row = {
                index, x: cellX, y: cellY, w: cellW, h: cellH,
                upX: cellX + cellW - 42, downX: cellX + cellW - 28, discardX: cellX + cellW - 14,
            };
            this.inventoryRects.push(row);

            ctx.fillStyle = active ? "rgba(77, 163, 255, 0.2)" : "rgba(255,255,255,0.04)";
            this.roundRect(ctx, row.x, row.y, row.w, row.h, 6);
            ctx.fill();
            ctx.fillStyle = RARITY_COLORS[weapon.getRarity()];
            ctx.font = active ? "bold 12px monospace" : "12px monospace";
            const weaponLabel = `${active ? "> " : ""}${weapon.getDisplayName()} (${RARITY_LABELS[weapon.getRarity()]})`;
            this.fillTruncatedText(ctx, weaponLabel, cellX + 8, cellY + 16, cellW - 28);
            ctx.fillStyle = "#7a828f";
            ctx.font = "10px monospace";
            ctx.fillText(`DMG ${Math.round(weapon.getDamageOutput())}`, cellX + 8, cellY + 48);
            ctx.fillStyle = "#e05261";
            ctx.fillText("×", row.discardX, cellY + 16);
        });

        const armorY = y + 30 + (Math.ceil(weapons.length / columns) * (cellH + gap)) + 14;
        ctx.fillStyle = "#f2f4f8";
        ctx.font = "bold 15px monospace";
        ctx.fillText("ARMOR (CLICK TO EQUIP)", x, armorY);
        armor.forEach((item, index) => {
            const column = index % columns;
            const rowIndex = Math.floor(index / columns);
            const cellX = x + column * (cellW + gap);
            const cellY = armorY + 20 + rowIndex * (cellH + gap);
            const row = { index, x: cellX, y: cellY, w: cellW, h: cellH, discardX: cellX + cellW - 14 };
            this.armorRects.push(row);
            ctx.fillStyle = "rgba(255,255,255,0.04)";
            this.roundRect(ctx, row.x, row.y, row.w, row.h, 5);
            ctx.fill();
            ctx.fillStyle = RARITY_COLORS[item.rarity];
            ctx.font = "12px monospace";
            this.fillTruncatedText(ctx, item.getDisplayName(), cellX + 8, cellY + 16, cellW - 28);
            ctx.font = "10px monospace";
            ctx.fillText(`${RARITY_LABELS[item.rarity]} • ${item.slot}`, cellX + 8, cellY + 31);
            ctx.fillStyle = "#9da5b4";
            ctx.fillText(`DEF ${item.defense} HP +${item.maxHealth} SPD ${item.speed >= 0 ? "+" : ""}${item.speed}`, cellX + 8, cellY + 48);
            ctx.fillStyle = "#e05261";
            ctx.fillText("×", row.discardX, cellY + 16);
        });

        const equippedY =
            armorY + 20 + Math.max(1, Math.ceil(armor.length / columns)) * (cellH + gap) + 12;
        ctx.fillStyle = "#f2f4f8";
        ctx.font = "bold 15px monospace";
        ctx.fillText("EQUIPPED ARMOR", x, equippedY);

        player.getArmor().forEach((item, slot) => {
            const cellX = x + slot * (cellW + gap);
            const cellY = equippedY + 20;
            ctx.fillStyle = item === null ? "rgba(255,255,255,0.025)" : "rgba(77, 163, 255, 0.14)";
            this.roundRect(ctx, cellX, cellY, cellW, cellH, 6);
            ctx.fill();
            ctx.strokeStyle = item === null ? "rgba(255,255,255,0.08)" : "rgba(77, 163, 255, 0.45)";
            ctx.stroke();

            ctx.fillStyle = item === null ? "#5a616e" : RARITY_COLORS[item.rarity];
            ctx.font = "12px monospace";
            this.fillTruncatedText(
                ctx,
                item?.getDisplayName() ?? ["HEAD", "CHEST", "LEGS"][slot],
                cellX + 8,
                cellY + 16,
                cellW - 16
            );
            ctx.fillStyle = "#9da5b4";
            ctx.font = "10px monospace";
            ctx.fillText(
                item === null
                    ? "Empty"
                    : `DEF ${item.defense} HP +${item.maxHealth} SPD ${item.speed >= 0 ? "+" : ""}${item.speed}`,
                cellX + 8,
                cellY + 39
            );
            if (item !== null) {
                ctx.fillStyle = RARITY_COLORS[item.rarity];
                ctx.fillText(RARITY_LABELS[item.rarity], cellX + 8, cellY + 52);
            }

        });
    }

    private getInventoryHeight(player: Player, w: number): number {
        const columns = 3;
        const gap = 8;
        const cellH = 62;
        const weaponRows = Math.ceil(player.getWeapons().length / columns);
        const armorRows = Math.ceil(player.getArmorInventory().length / columns);
        const cellW = (w - gap * (columns - 1)) / columns;
        void cellW;
        return 30 + weaponRows * (cellH + gap) + 14 + 20 +
            Math.max(1, armorRows) * (cellH + gap) + 12 + 20 + cellH;
    }

    private drawAttributes(
        ctx: CanvasRenderingContext2D,
        player: Player,
        x: number,
        y: number,
        w: number
    ): void {
        const s = player.getStats();

        ctx.font = "bold 18px monospace";
        ctx.fillStyle = "#f2f4f8";
        ctx.textAlign = "left";
        ctx.fillText(`LEVEL ${s.getLevel()}`, x, y);

        const xpRatio =
            s.getExperienceToNextLevel() > 0
                ? Math.min(1, s.getExperience() / s.getExperienceToNextLevel())
                : 0;
        const barY = y + 22;
        ctx.fillStyle = "#182a3b";
        ctx.fillRect(x, barY, w, 10);
        ctx.fillStyle = "#4da3ff";
        ctx.fillRect(x, barY, w * xpRatio, 10);
        ctx.fillStyle = "#9da5b4";
        ctx.font = "11px monospace";
        ctx.fillText(
            `XP ${Math.round(s.getExperience())} / ${s.getExperienceToNextLevel()}`,
            x,
            barY + 26
        );

        const stats: [string, string][] = [
            ["Health", `${Math.round(s.getCurrentHealth())} / ${Math.round(s.getMaxHealth())}`],
            ["Damage", `${s.getDamage()}`],
            ["Defense", `${s.getDefense()}`],
            ["Speed", `${Math.round(s.getSpeed())}`],
        ];

        let rowY = barY + 56;
        for (const [label, value] of stats) {
            ctx.fillStyle = "#9da5b4";
            ctx.font = "13px monospace";
            ctx.textAlign = "left";
            ctx.fillText(label.toUpperCase(), x, rowY);

            ctx.fillStyle = "#f2f4f8";
            ctx.font = "bold 15px monospace";
            ctx.textAlign = "right";
            ctx.fillText(value, x + w, rowY);

            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath();
            ctx.moveTo(x, rowY + 14);
            ctx.lineTo(x + w, rowY + 14);
            ctx.stroke();

            rowY += 34;
        }
        ctx.textAlign = "left";
    }

    private drawPlaceholder(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        w: number
    ): void {
        ctx.fillStyle = "#5a616e";
        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(text, x + w / 2, y + 40);
        ctx.textAlign = "left";
    }

    private fillTruncatedText(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number
    ): void {
        if (ctx.measureText(text).width <= maxWidth) {
            ctx.fillText(text, x, y);
            return;
        }

        let visible = text;
        while (visible.length > 1 && ctx.measureText(`${visible}…`).width > maxWidth) {
            visible = visible.slice(0, -1);
        }
        ctx.fillText(`${visible}…`, x, y);
    }

    private roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ): void {
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
