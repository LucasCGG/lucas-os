import { WorldScene } from "../engine/WorldScene";
import { Player } from "../entities/Player";
import { Wall } from "../objects/Wall";
import { ExitPad } from "../objects/ExitPad";
import { Spawner } from "../utils/spawner";
import { OverlayHelper } from "../ui/overlay/OverlayHelper";
import { DEFAULT_LOOT } from "../loot/LootTable";

import wallSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1.png";
import pillarSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1_Pillars.png";
import gateAnimUrl from "../assets/environment/Dungeon_1/Dungeon_1_Gate_anim.png";
import { DungeonGenerator } from "./rooms/DungeonGenerator";
import { ROOM_TEMPLATES } from "./rooms/RoomCollection";

export class Dungeon_1
  extends WorldScene
{
  private readonly scenePlayer: Player;

  private readonly dungeonCols = 2;
  private readonly dungeonRows = 2;

  private generatedWidth = 1600;
  private generatedHeight = 1200;

  protected get worldWidth(): number {
    return this.generatedWidth;
  }

  protected get worldHeight(): number {
    return this.generatedHeight;
  }

  protected enemySpawner =
    new Spawner({
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
      perLevel: 30,
    },

    speed: {
      base: 105,
      perLevel: 4,
    },

    damage: {
      base: 25,
      perLevel: 4,
    },

    defense: {
      base: 3,
      perLevel: 1,
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
      perLevel: 22,
    },

    speed: {
      base: 95,
      perLevel: 3,
    },

    damage: {
      base: 18,
      perLevel: 3,
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

  constructor(
    player: Player,
  ) {
    super();

    this.scenePlayer =
      player;
  }

  override init(
    width: number,
    height: number,
  ): void {
    super.init(
      width,
      height,
    );

    this.setPlayer(
      this.scenePlayer,
    );

    const layout =
      DungeonGenerator.generate({
        cols: this.dungeonCols,
        rows: this.dungeonRows,
        templates:
          ROOM_TEMPLATES,
      });

    this.dungeonLayout =
      layout;

    if (
      layout.rooms.length > 0
    ) {
      const room =
        layout.rooms[0];

      this.generatedWidth =
        layout.cols *
        room.template.width;

      this.generatedHeight =
        layout.rows *
        room.template.height;
    }

    for (
      const room of layout.rooms
    ) {
      this.buildRoom(
        room,
        layout,
      );
    }

    const startRoom =
      layout.rooms.find(
        (room) =>
          room.template.tags?.includes(
            "start",
          ),
      ) ??
      layout.rooms[0];

    if (
      startRoom !== undefined
    ) {
      const spawnX =
        startRoom.gridX *
          startRoom.template.width +
        startRoom.template.width / 2 -
        26;

      const spawnY =
        startRoom.gridY *
          startRoom.template.height +
        startRoom.template.height / 2 -
        26;

      const spawn =
        this.findClearPlayerSpawn(
          spawnX,
          spawnY,
        );

      this.setPlayerSpawn(
        spawn.x,
        spawn.y,
      );
    }

    const exitRoom =
      layout.rooms.find(
        (room) =>
          room.template.tags?.includes(
            "boss",
          ),
      ) ??
      layout.rooms[
        layout.rooms.length - 1
      ];

    if (
      exitRoom !== undefined
    ) {
      const exitX =
        exitRoom.gridX *
          exitRoom.template.width +
        exitRoom.template.width -
        180;

      const exitY =
        exitRoom.gridY *
          exitRoom.template.height +
        exitRoom.template.height -
        180;

      this.placeExit(
        exitX,
        exitY,
      );
    }

    this.camera.setSmoothSpeed(
      6,
    );

    this.camera.toggleMode();
  }

  async load(): Promise<void> {
    this.musicKey =
      "dungeon";

    this.startMusic();

    await Wall.loadSheets(
      wallSheetUrl,
      pillarSheetUrl,
    );

    await ExitPad.loadSheet(
      gateAnimUrl,
    );

    await this.spawnRoomChests(
      DEFAULT_LOOT,
    );
  }

  override update(
    deltaTime: number,
  ): void {
    if (
      this.player === null
    ) {
      return;
    }

    if (
      this.handlePause()
    ) {
      return;
    }

    if (
      this.handleDeath()
    ) {
      return;
    }

    this.handleDebugKeys();

    if (
      this.handleCharacterScreen()
    ) {
      return;
    }

    this.updateChests(
      deltaTime,
    );

    this.updateWorld(
      deltaTime,
    );
  }

  override render(
    ctx: CanvasRenderingContext2D,
  ): void {
    if (this.paused) {
      this.pause.draw(
        ctx,
        this.width,
        this.height,
      );

      return;
    }

    this.renderWorld(ctx);

    this.renderChests(ctx);

    this.renderExit(ctx);

    if (
      this.player !== null
    ) {
      OverlayHelper.renderPlayerOverlay(
        ctx,
        this.player,
        this.width,
        this.height,
      );
    }

    if (
      this.characterOpen &&
      this.player !== null
    ) {
      this.characterScreen.draw(
        ctx,
        this.player,
        this.width,
        this.height,
      );
    }

    if (
      this.dead &&
      this.player !== null
    ) {
      this.deathScreen.draw(
        ctx,
        this.width,
        this.height,
        this.player,
      );
    }
  }
}
