import { WorldScene } from "../engine/WorldScene";
import { Player } from "../entities/Player";
import { Spawner } from "../utils/spawner";
import { OverlayHelper } from "../ui/overlay/OverlayHelper";

import { Wall } from "../objects/Wall";
import { ExitPad } from "../objects/ExitPad";

import wallSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1.png";
import pillarSheetUrl from "../assets/environment/Dungeon_1/Dungeon_1_Pillars.png";
import gateAnimUrl from "../assets/environment/Dungeon_1/Dungeon_1_Gate_anim.png";

export class DungeonTutorial extends WorldScene {
  protected get worldWidth(): number {
    return 1400;
  }

  protected get worldHeight(): number {
    return 1000;
  }


  private readonly scenePlayer: Player;

  protected enemySpawner = new Spawner({
    totalToSpawn: 10,
    minDelay: 3,
    maxDelay: 6,
    minBatch: 1,
    maxBatch: 2,
    maxActive: 8,
  });

  protected meleeScaling = {
    health: {
      base: 150,
      perLevel: 20,
    },
    speed: {
      base: 90,
      perLevel: 3,
    },
    damage: {
      base: 15,
      perLevel: 2,
    },
    defense: {
      base: 1,
      perLevel: 1,
      step: 2,
    },
    xp: {
      base: 30,
      perLevel: 10,
    },
  };

  protected archerScaling = {
    health: {
      base: 100,
      perLevel: 15,
    },
    speed: {
      base: 80,
      perLevel: 2,
    },
    damage: {
      base: 10,
      perLevel: 2,
    },
    defense: {
      base: 1,
      perLevel: 1,
      step: 3,
    },
    xp: {
      base: 25,
      perLevel: 8,
    },
  };

  protected archerChance = 0.4;

  constructor(player: Player) {
    super();

    /*
     * Do NOT call setPlayerForScene() here.
     *
     * collisionWorld is created by GameScene.init(), which has
     * not happened yet during construction.
     */
    this.scenePlayer = player;
  }

  override init(
    width: number,
    height: number,
  ): void {
    /*
     * This must happen first.
     *
     * GameScene.init() creates the scene's collision world.
     */
    super.init(width, height);

    /*
     * Now it is safe to create the player's collider and register
     * it with this scene's collision world.
     */
    this.setPlayerForScene(this.scenePlayer);

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
      220,
      250,
      50,
    );

    this.addWall(
      850,
      220,
      50,
      300,
    );

    this.addWall(
      500,
      650,
      300,
      50,
    );

    this.addWall(
      200,
      500,
      200,
      50,
    );

    this.addPillar(
      600,
      400,
      1,
    );

    this.addPillar(
      720,
      400,
      1,
    );

    this.addPillar(
      600,
      550,
      1,
    );

    this.addPillar(
      720,
      550,
      1,
    );

    this.placeExit(
      this.worldWidth - 160,
      this.worldHeight - 160,
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
      120,
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
  }

  protected onExitReached(): void {
    this.onExit?.();
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
}
