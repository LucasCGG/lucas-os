import { WorldScene } from "../engine/WorldScene";
import { Player } from "../entities/Player";
import { Wall } from "../objects/Wall";
import { ExitPad } from "../objects/ExitPad";
import { Spawner } from "../utils/spawner";
import { DEFAULT_LOOT } from "../loot/LootTable";
import { FlyingDemonBoss } from "../entities/FlyingDemonBoss";

import wallSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1.png";
import pillarSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1_Pillars.png";
import gateAnimUrl from "../assets/environment/Dungeon_1/Dungeon_1_Gate_anim.png";
import waterSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1_Sewer_Tileset.png";
import { DungeonGenerator } from "./rooms/DungeonGenerator";
import { ROOM_TEMPLATES } from "./rooms/RoomCollection";
import { Decoration } from "../objects/Decoration";
import { AssetPool } from "../sprites/AssetPool";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { Transform } from "../engine";

export class Level1 extends WorldScene {
    private readonly scenePlayer: Player;

    private generatedWidth = 1600;
    private generatedHeight = 1200;
    protected readonly difficulty: number;
    protected readonly hasBoss: boolean;

    protected get worldWidth(): number {
        return this.generatedWidth;
    }

    protected get worldHeight(): number {
        return this.generatedHeight;
    }

    protected enemySpawner = new Spawner({
        totalToSpawn: 25,
        minDelay: 3,
        maxDelay: 8,
        minBatch: 1,
        maxBatch: 3,
        maxActive: 12,
    });

    protected meleeScaling = {
        health: {
            base: 250,
            perLevel: 18,
        },

        speed: {
            base: 105,
            perLevel: 2,
        },

        damage: {
            base: 25,
            perLevel: 2,
        },

        defense: {
            base: 3,
            perLevel: 0.5,
            step: 2,
        },

        xp: {
            base: 50,
            perLevel: 15,
        },
    };

    protected archerScaling = {
        health: {
            base: 150,
            perLevel: 14,
        },

        speed: {
            base: 95,
            perLevel: 2,
        },

        damage: {
            base: 18,
            perLevel: 1.5,
        },

        defense: {
            base: 2,
            perLevel: 1,
            step: 3,
        },

        xp: {
            base: 40,
            perLevel: 12,
        },
    };

    protected archerChance = 0.45;

    constructor(player: Player, options: { difficulty?: number; boss?: boolean } = {}) {
        super();

        this.scenePlayer = player;
        this.difficulty = options.difficulty ?? 0;
        this.hasBoss = options.boss ?? false;
    }

    protected override getEnemyLevel(): number {
        return (this.player?.getStats().getLevel() ?? 1) + this.difficulty;
    }

    protected override getStageLabel(): string {
        return this.hasBoss ? "LEVEL 2 • WARDEN'S KEEP" : "LEVEL 1 • THE SUNKEN HALLS";
    }

    override init(width: number, height: number): void {
        super.init(width, height);

        this.setPlayer(this.scenePlayer);

        const layout = DungeonGenerator.generate({
            cols: 4,
            rows: 3,
            templates: ROOM_TEMPLATES,
        });

        this.dungeonLayout = layout;

        if (layout.rooms.length > 0) {
            const room = layout.rooms[0];

            this.generatedWidth = layout.cols * (layout.cellWidth ?? room.template.width);
            this.generatedHeight = layout.rows * (layout.cellHeight ?? room.template.height);
        }

        for (const room of layout.rooms) {
            this.buildRoom(room, layout);
        }

        const startRoom =
            layout.rooms.find((room) => room.template.tags?.includes("start")) ?? layout.rooms[0];

        if (startRoom !== undefined) {
            const origin = this.getRoomOrigin(startRoom, layout);

            const spawnX = origin.x + this.roomWidth(startRoom) / 2 - 26;

            const spawnY = origin.y + this.roomHeight(startRoom) / 2 - 26;

            const spawn = this.findClearPlayerSpawn(spawnX, spawnY);

            this.setPlayerSpawn(spawn.x, spawn.y);
        }

        const exitRoom =
            layout.rooms.find((room) => room.template.tags?.includes("boss")) ??
            layout.rooms[layout.rooms.length - 1];

        if (exitRoom !== undefined) {
            const origin = this.getRoomOrigin(exitRoom, layout);

            const exitX = origin.x + this.roomWidth(exitRoom) - 180;

            const exitY = origin.y + this.roomHeight(exitRoom) - 180;

            this.placeExit(exitX, exitY);
        }

        this.camera.setSmoothSpeed(6);

        this.camera.toggleMode();
    }

    async load(): Promise<void> {
        this.musicKey = this.hasBoss ? "boss" : "dungeon";

        this.startMusic();

        await Wall.loadSheets(wallSheetUrl, pillarSheetUrl);

        await ExitPad.loadSheet(gateAnimUrl);

        await Decoration.preload();

        await AssetPool.loadAll([{ path: "dungeon/water", url: waterSheetUrl }]);

        await this.spawnRoomChests(DEFAULT_LOOT);

        if (this.hasBoss && this.dungeonLayout !== null) {
            const bossRoom = this.dungeonLayout.rooms.find((room) =>
                room.template.tags?.includes("boss")
            );
            if (bossRoom !== undefined) {
                const origin = this.getRoomOrigin(bossRoom, this.dungeonLayout);
                const stats = new EntityAttributes(1800, 115, 52, 12);
                stats.setXpReward(1000);
                const boss = await FlyingDemonBoss.create(
                    new Transform(
                        origin.x + this.roomWidth(bossRoom) / 2 - 42,
                        origin.y + this.roomHeight(bossRoom) / 2 - 42,
                        84,
                        84,
                        0
                    ),
                    this.enemyTeam,
                    stats
                );
                this.registerEnemy(boss);
            }
        }
    }

    override update(deltaTime: number): void {
        if (this.player === null) {
            return;
        }

        if (this.handlePause()) {
            return;
        }

        if (this.handleDeath()) {
            return;
        }

        this.handleDebugKeys();

        if (this.handleCharacterScreen()) {
            return;
        }

        this.updateChests(deltaTime);

        this.updateWorld(deltaTime);
    }

    protected override onExitReached(): void {
        this.onExit?.();
    }

    override render(ctx: CanvasRenderingContext2D): void {
        if (this.paused) {
            this.pause.draw(ctx, this.width, this.height);

            return;
        }

        this.renderWorld(ctx);

        this.renderChests(ctx);

        this.renderExit(ctx);
        this.renderDungeonStatus(ctx);
        this.renderBossBar(ctx);

        this.renderPlayerOverlay(ctx);

        if (this.characterOpen && this.player !== null) {
            this.characterScreen.draw(ctx, this.player, this.width, this.height);
        }

        if (this.dead && this.player !== null) {
            this.deathScreen.draw(ctx, this.width, this.height, this.player);
        }
    }
}
