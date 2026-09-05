import { WorldScene } from "../engine/WorldScene";
import { Player } from "../entities/Player";
import { Transform } from "../engine";
import { Wall } from "../objects/Wall";
import { ExitPad } from "../objects/ExitPad";
import { Chest } from "../objects/Chest";
import { Spawner } from "../utils/spawner";
import { OverlayHelper } from "../ui/overlay/OverlayHelper";
import { AssetPool } from "../sprites/AssetPool";
import { ImageSource } from "../sprites/types";
import { DEFAULT_LOOT } from "../loot/LootTable";

import wallSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1.png";
import pillarSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1_Pillars.png";
import gateAnimUrl from "../assets/environment/Dungeon_1/Dungeon_1_Gate_anim.png";
import archUrl from "../assets/environment/Dungeon_1/Dungeon_1_Arch.png";

export class DungeonEntrance extends WorldScene {
  protected get worldWidth(): number {
    return 1800;
  }

  protected get worldHeight(): number {
    return 1200;
  }

  private readonly scenePlayer: Player;

  private chests: Chest[] = [];

  private archImage: ImageSource | null = null;

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

  constructor(player: Player) {
    super();

    /*
     * Only store the player here.
     *
     * Do NOT call setPlayerForScene() until init().
     */
    this.scenePlayer = player;
  }

  override init(
    width: number,
    height: number,
  ): void {
    /*
     * GameScene.init() must execute before anything accesses
     * collisionWorld.
     */
    super.init(width, height);

    /*
     * collisionWorld now exists.
     */
    this.setPlayerForScene(this.scenePlayer);

    this.chests = [];
    this.archImage = null;

    const t = 40;

    this.addWall(
      0,
      0,
      this.worldWidth,
      t,
    );

    this.addWall(
      0,
      this.worldHeight - t,
      this.worldWidth,
      t,
    );

    this.addWall(
      0,
      0,
      t,
      this.worldHeight,
    );

    this.addWall(
      this.worldWidth - t,
      0,
      t,
      this.worldHeight,
    );

    this.addWall(
      300,
      200,
      60,
      400,
    );

    this.addWall(
      900,
      200,
      60,
      400,
    );

    this.addWall(
      450,
      400,
      250,
      60,
    );

    this.addWall(
      1100,
      350,
      300,
      60,
    );

    this.addWall(
      650,
      750,
      400,
      60,
    );

    for (
      const x of [
        500,
        750,
        1000,
        1250,
      ]
    ) {
      this.addPillar(
        x,
        300,
        1,
      );

      this.addPillar(
        x,
        650,
        1,
      );
    }

    this.placeExit(
      this.worldWidth - 180,
      this.worldHeight - 180,
    );

    this.camera.setSmoothSpeed(6);
    this.camera.toggleMode();
  }

  setPlayerForScene(
    player: Player,
  ): void {
    this.setPlayer(player);

    this.setPlayerSpawn(
      120,
      this.worldHeight / 2,
    );
  }

  async load(): Promise<void> {
    this.musicKey = "dungeon";

    this.startMusic();

    await Wall.loadSheets(
      wallSheetUrl,
      pillarSheetUrl,
    );

    await ExitPad.loadSheet(
      gateAnimUrl,
    );

    await AssetPool.loadAll([
      {
        path: "environment/dungeon1/arch",
        url: archUrl,
      },
    ]);

    this.archImage =
      AssetPool.getImage(
        "environment/dungeon1/arch",
      );

    if (this.player === null) {
      throw new Error(
        "DungeonEntrance requires a player",
      );
    }

    const chestPositions = [
      [500, 180],
      [760, 180],
      [1120, 180],
      [1360, 180],
      [500, 900],
      [1300, 900],
    ] as const;

    for (
      let i = 0;
      i < chestPositions.length;
      i++
    ) {
      const [x, y] =
        chestPositions[i];

      const loot =
        DEFAULT_LOOT.roll();

      const chest =
        await Chest.create(
          `Entrance Chest ${i + 1}`,
          new Transform(
            x,
            y,
            48,
            48,
            0,
          ),
          loot.weaponFactories,
          loot.xp,
          this.player,
        );

      this.chests.push(chest);
    }
  }

  override update(
    deltaTime: number,
  ): void {
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

    for (const chest of this.chests) {
      chest.tick(
        deltaTime,
        this.player,
      );
    }

    this.updateWorld(deltaTime);
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

    this.renderArch(ctx);

    for (const chest of this.chests) {
      chest.render(
        ctx,
        this.camera,
      );
    }

    this.renderExit(ctx);

    OverlayHelper.renderPlayerOverlay(
      ctx,
      this.player!,
      this.width,
      this.height,
    );

    if (this.characterOpen) {
      this.characterScreen.draw(
        ctx,
        this.player!,
        this.width,
        this.height,
      );
    }

    if (this.dead) {
      this.deathScreen.draw(
        ctx,
        this.width,
        this.height,
        this.player!,
      );
    }
  }

  /**
   * The arch is a 32×32 tile.
   * Draw it at 2× scale (64×64).
   */
  private renderArch(
    ctx: CanvasRenderingContext2D,
  ): void {
    if (this.archImage === null) {
      return;
    }

    const screen =
      this.camera.worldToScreen(
        300,
        160,
      );

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      this.archImage,
      0,
      0,
      32,
      32,
      screen.x,
      screen.y,
      64,
      64,
    );
  }
}
