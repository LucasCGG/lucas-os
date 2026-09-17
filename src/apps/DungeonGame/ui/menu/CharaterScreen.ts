import { Player } from "../../entities/Player";

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

    setActiveTab(tab: TabId): void {
        this.activeTab = tab;
    }

    handleClick(mx: number, my: number, player: Player): void {
        for (const r of this.tabRects) {
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                this.activeTab = r.id;
                return;
            }
        }

        for (const rect of this.inventoryRects) {
            if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
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
            this.drawInventory(ctx, player, contentX, contentY, contentW);
        } else {
            this.drawPlaceholder(ctx, "Skill tree coming soon", contentX, contentY, contentW);
        }

        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Tab to close", width / 2, py + ph - 16);
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
        this.inventoryRects = [];

        ctx.fillStyle = "#f2f4f8";
        ctx.font = "bold 15px monospace";
        ctx.textAlign = "left";
        ctx.fillText("YOUR WEAPONS", x, y);

        const rowH = 42;
        const listW = Math.min(270, w * 0.58);
        let rowY = y + 30;
        for (let index = 0; index < weapons.length; index++) {
            const weapon = weapons[index];
            const active = index === player.getCurrentWeaponIndex();
            const row = {
                index,
                x,
                y: rowY - 18,
                w: listW,
                h: rowH,
                upX: x + listW - 84,
                downX: x + listW - 56,
                discardX: x + listW - 28,
            };
            this.inventoryRects.push(row);

            ctx.fillStyle = active ? "rgba(77, 163, 255, 0.2)" : "rgba(255,255,255,0.04)";
            this.roundRect(ctx, row.x, row.y, row.w, row.h, 6);
            ctx.fill();
            ctx.fillStyle = active ? "#f2f4f8" : "#9da5b4";
            ctx.font = active ? "bold 13px monospace" : "13px monospace";
            ctx.fillText(`${active ? ">" : " "} ${weapon.getDisplayName()}`, x + 10, rowY);
            ctx.fillStyle = "#7a828f";
            ctx.font = "11px monospace";
            ctx.fillText(`DMG ${Math.round(weapon.getDamageOutput())}`, x + 10, rowY + 16);
            ctx.fillStyle = "#7a828f";
            ctx.font = "12px monospace";
            ctx.fillText("↑", row.upX, rowY);
            ctx.fillText("↓", row.downX, rowY);
            ctx.fillStyle = "#e05261";
            ctx.fillText("×", row.discardX, rowY);
            rowY += rowH + 6;
        }

        const current = player.getGun();
        const detailX = x + listW + 28;
        ctx.fillStyle = "#9da5b4";
        ctx.font = "11px monospace";
        ctx.fillText("EQUIPPED", detailX, y + 30);
        ctx.fillStyle = "#f2f4f8";
        ctx.font = "bold 17px monospace";
        ctx.fillText(current?.getDisplayName() ?? "None", detailX, y + 56);
        ctx.fillStyle = "#9da5b4";
        ctx.font = "12px monospace";
        ctx.fillText(`Damage: ${Math.round(current?.getDamageOutput() ?? 0)}`, detailX, y + 82);
        ctx.fillText("Click name: equip", detailX, y + 120);
        ctx.fillText("↑↓ reorder  × discard", detailX, y + 136);
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
