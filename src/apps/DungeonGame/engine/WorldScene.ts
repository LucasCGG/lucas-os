import { AABBCollider, Collider, Transform } from "../engine";
import { GameScene } from "../engine/GameScene";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Wall } from "../objects/Wall";
import { Entity } from "../entities/Entity";
import { Projectile } from "../entities/Projectile";
import { EntityDelegator } from "../weapons/EntityDelegator";
import { KeyListener } from "./input/KeyListener";
import { MouseListener } from "./input/MouseListener";
import { PauseScreen } from "../ui/menu/PauseScreen";
import { CharacterScreen } from "../ui/menu/CharaterScreen";
import { ImageSource } from "../sprites/types";
import { AssetPool } from "../sprites/AssetPool";
import { ExitPad } from "../objects/ExitPad";
import { Team } from "../entities/Team";
import { Spawner } from "../utils/spawner";
import { AudioManager } from "../audio/AudioManager";
import { scaleObject, StatScaling } from "../utils/levelScaler";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { ArcherEnemy } from "../entities/ArcherEnemy";
import { MeleeEnemy } from "../entities/MeleeEnemy";
import { DeathScreen } from "../ui/menu/DeathScreen";
import {
    Direction,
    OPPOSITE_DIRECTION,
    RoomTemplate,
    RoomRotation,
    RoomWall,
    FLOOR_TILE_SIZE,
    roundToTile,
    rotateDirection,
    rotatePoint,
    rotateRect,
} from "../scenes/RoomTemplate";
import { Chest } from "../objects/Chest";
import { LootTable } from "../loot/LootTable";
import { DungeonLayout, DungeonRoom } from "../types/DungeonLayout";
import { Decoration, decorationSize } from "../objects/Decoration";
import { MobileInput } from "./MobileInput";
import { isMobileDevice } from "../utils/isMobileDevice";
import { OverlayHelper } from "../ui/overlay/OverlayHelper";
import { MobileOverlayHelper } from "../ui/overlay/MobileOverlayHelper";

export abstract class WorldScene extends GameScene implements EntityDelegator {
    protected keys = KeyListener.get();
    protected mouse = MouseListener.get();

    protected player: Player | null = null;
    protected playerCollider!: AABBCollider;

    protected dead = false;
    protected deathScreen = new DeathScreen();

    protected characterOpen = false;
    protected characterScreen = new CharacterScreen();

    protected walls: Wall[] = [];
    protected wallColliders: AABBCollider[] = [];
    private readonly wallGrid = new Map<string, AABBCollider[]>();
    private readonly wallGridSize = 128;
    protected decorations: Decoration[] = [];

    /** Floor rects for the stub corridors that bridge undersized rooms to their cell edge. */
    protected marginFloor: RoomWall[] = [];

    /** Water rects (world space) — rendered with the water tileset and implicitly walkable floor. */
    protected waterRegions: RoomWall[] = [];

    private floorSheet: ImageSource | null = null;
    private waterSheet: ImageSource | null = null;

    private readonly floorTileSize = FLOOR_TILE_SIZE;

    private readonly floorTiles: [number, number][] = [
        [4, 7],
        [5, 7],
        [6, 7],
        [4, 8],
        [5, 8],
    ];

    protected enemies: Enemy[] = [];
    protected projectiles: Entity[] = [];

    /** Tracks which dead enemies already paid out XP, since they now linger for their death animation. */
    private readonly xpAwardedTo = new WeakSet<Enemy>();

    protected paused = false;
    protected pause = new PauseScreen();

    protected activeRadius = 0;

    protected abstract get worldWidth(): number;
    protected abstract get worldHeight(): number;

    protected showHitboxes = false;

    protected musicKey: string | null = null;

    protected exit: ExitPad | null = null;
    protected wasAtExit = false;

    protected enemyTeam = new Team("enemies");

    protected enemySpawner!: Spawner;
    protected meleeScaling!: StatScaling;
    protected archerScaling!: StatScaling;
    protected archerChance = 0.45;

    protected chests: Chest[] = [];
    protected chestSpots: [number, number][] = [];

    protected dungeonLayout: DungeonLayout | null = null;
    private minimapTiles: Array<{ x: number; y: number; room: DungeonRoom | undefined }> = [];
    private minimapCanvas: HTMLCanvasElement | null = null;

    protected mobileInput = MobileInput.get();
    private readonly isMobile = isMobileDevice();

    init(width: number, height: number): void {
        super.init(width, height);

        this.activeRadius = Math.max(width, height) * 1.2;

        this.walls = [];
        this.wallColliders = [];
        this.wallGrid.clear();
        this.decorations = [];
        this.marginFloor = [];
        this.waterRegions = [];
        this.enemies = [];
        this.projectiles = [];

        this.dead = false;
        this.paused = false;
        this.characterOpen = false;

        this.exit = null;
        this.wasAtExit = false;

        this.floorSheet = null;
        this.waterSheet = null;

        this.chests = [];
        this.chestSpots = [];

        this.dungeonLayout = null;
        this.minimapTiles = [];
        this.minimapCanvas = null;
    }

    onExit?: () => void;

    spawn(entity: Entity): void {
        this.projectiles.push(entity);
    }

    spawnAll(entities: Entity[]): void {
        for (const entity of entities) {
            this.spawn(entity);
        }
    }

    protected async spawnRoomChests(loot: LootTable): Promise<void> {
        if (this.player === null) {
            return;
        }

        for (let i = 0; i < this.chestSpots.length; i++) {
            const [x, y] = this.chestSpots[i];

            const rolled = loot.roll();

            const chest = await Chest.create(
                `Chest-${i + 1}`,
                new Transform(x, y, 48, 48, 0),
                rolled.weaponFactories,
                rolled.xp,
                this.player
            );

            this.chests.push(chest);
        }
    }

    protected updateChests(deltaTime: number): void {
        if (this.player === null) {
            return;
        }

        for (const chest of this.chests) {
            chest.tick(deltaTime, this.player);
        }
    }

    protected renderChests(ctx: CanvasRenderingContext2D): void {
        for (const chest of this.chests) {
            chest.render(ctx, this.camera);
        }
    }

    /**
     * Attach the persistent player to this scene.
     */
    setPlayer(player: Player): void {
        this.player = player;

        this.playerCollider = new AABBCollider(player.transform);

        this.collisionWorld.register(player, this.playerCollider);

        player.setMeleeTargetProvider({
            getTargets: () => this.enemies,
        });
    }

    /**
     * Move the persistent player to a spawn point.
     */
    setPlayerSpawn(x: number, y: number): void {
        if (this.player === null) {
            return;
        }

        this.player.transform.x = x;
        this.player.transform.y = y;

        this.player.vx = 0;
        this.player.vy = 0;
    }

    protected addWall(x: number, y: number, w: number, h: number): void {
        const transform = new Transform(x, y, w, h, 0);

        this.walls.push(new Wall("Wall", transform));

        this.addWallCollider(new AABBCollider(transform));
    }

    protected addPillar(x: number, y: number, variant = 0): void {
        const spriteW = 32;
        const spriteH = 48;

        const spriteTransform = new Transform(x, y, spriteW, spriteH, 0);

        const wall = new Wall("Pillar", spriteTransform);

        wall.setPillarVariant(variant);

        this.walls.push(wall);

        const baseH = 20;

        const baseTransform = new Transform(x + 4, y + spriteH - baseH, spriteW - 8, baseH, 0);

        this.addWallCollider(new AABBCollider(baseTransform));
    }

    protected addDecoration(
        x: number,
        y: number,
        kind: string,
        scale?: number,
        rotation = 0
    ): void {
        const { width, height } = decorationSize(kind, scale);

        const transform = new Transform(x - width / 2, y - height / 2, width, height, rotation);

        this.decorations.push(new Decoration("Decoration", transform, kind));
    }

    protected hitsSolid(collider: Collider): boolean {
        const transform = collider.getTransform();
        const minX = Math.floor(transform.x / this.wallGridSize);
        const maxX = Math.floor((transform.x + transform.width) / this.wallGridSize);
        const minY = Math.floor(transform.y / this.wallGridSize);
        const maxY = Math.floor((transform.y + transform.height) / this.wallGridSize);
        for (let gridY = minY; gridY <= maxY; gridY++) {
            for (let gridX = minX; gridX <= maxX; gridX++) {
                for (const wallCollider of this.wallGrid.get(`${gridX},${gridY}`) ?? []) {
                    if (collider.intersects(wallCollider)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private addWallCollider(collider: AABBCollider): void {
        this.wallColliders.push(collider);

        const transform = collider.getTransform();
        const minX = Math.floor(transform.x / this.wallGridSize);
        const maxX = Math.floor(
            (transform.x + transform.width) / this.wallGridSize
        );
        const minY = Math.floor(transform.y / this.wallGridSize);
        const maxY = Math.floor(
            (transform.y + transform.height) / this.wallGridSize
        );

        for (let gridY = minY; gridY <= maxY; gridY++) {
            for (let gridX = minX; gridX <= maxX; gridX++) {
                const key = `${gridX},${gridY}`;
                const cell = this.wallGrid.get(key);
                if (cell === undefined) {
                    this.wallGrid.set(key, [collider]);
                } else {
                    cell.push(collider);
                }
            }
        }
    }

    protected hitsWall(transform: Transform): boolean {
        return this.hitsSolid(new AABBCollider(transform));
    }

    protected inBounds(transform: Transform): boolean {
        const margin = 200;

        return (
            transform.x > -margin &&
            transform.y > -margin &&
            transform.x < this.worldWidth + margin &&
            transform.y < this.worldHeight + margin
        );
    }

    protected inActiveRange(transform: Transform): boolean {
        if (this.player === null) {
            return false;
        }

        const px = this.player.transform.x + this.player.transform.width / 2;

        const py = this.player.transform.y + this.player.transform.height / 2;

        const ex = transform.x + transform.width / 2;

        const ey = transform.y + transform.height / 2;

        return Math.hypot(ex - px, ey - py) <= this.activeRadius;
    }

    protected inCameraView(transform: Transform, margin = 150): boolean {
        const view = this.camera.getViewBounds(this.width, this.height);

        return (
            transform.x + transform.width > view.x - margin &&
            transform.x < view.x + view.w + margin &&
            transform.y + transform.height > view.y - margin &&
            transform.y < view.y + view.h + margin
        );
    }

    protected registerEnemy(enemy: Enemy): void {
        if (this.player === null) {
            return;
        }

        enemy.setTarget(this.player);

        enemy.setBlockedCheck((transform) => this.hitsSolid(new AABBCollider(transform)));

        enemy.setDelegator(this);

        this.collisionWorld.register(enemy, new AABBCollider(enemy.transform));

        this.enemies.push(enemy);
    }

    protected updatePlayerMovement(deltaTime: number): void {
        const player = this.player;

        if (player === null) {
            return;
        }

        let moveX = 0;
        let moveY = 0;

        if (this.keys.isKeyDown("KeyA") || this.keys.isKeyDown("ArrowLeft")) {
            moveX -= 1;
        }

        if (this.keys.isKeyDown("KeyD") || this.keys.isKeyDown("ArrowRight")) {
            moveX += 1;
        }

        if (this.keys.isKeyDown("KeyW") || this.keys.isKeyDown("ArrowUp")) {
            moveY -= 1;
        }

        if (this.keys.isKeyDown("KeyS") || this.keys.isKeyDown("ArrowDown")) {
            moveY += 1;
        }

        const mobileX = this.mobileInput.getMoveX();
        const mobileY = this.mobileInput.getMoveY();

        if (mobileX !== 0 || mobileY !== 0) {
            moveX = mobileX;
            moveY = mobileY;
        }

        player.setMovementInput(moveX, moveY);

        if (this.isMobile) {
            if (this.mobileInput.hasAimDirection()) {
                const centerX = player.transform.x + player.transform.width / 2;
                const centerY = player.transform.y + player.transform.height / 2;

                player.setAimTarget(
                    centerX + this.mobileInput.getAimDirX() * 1000,
                    centerY + this.mobileInput.getAimDirY() * 1000
                );
            }
        } else {
            const worldAim = this.camera.screenToWorld(this.mouse.getX(), this.mouse.getY());

            player.setAimTarget(worldAim.x, worldAim.y);
        }

        player.update(deltaTime);

        const transform = player.transform;

        transform.x += player.vx * deltaTime;

        if (this.hitsSolid(new AABBCollider(player.getCollisionBox()))) {
            transform.x -= player.vx * deltaTime;
        }

        transform.y += player.vy * deltaTime;

        if (this.hitsSolid(new AABBCollider(player.getCollisionBox()))) {
            transform.y -= player.vy * deltaTime;
        }

        const firing = this.isMobile ? this.mobileInput.isAttacking() : this.mouse.isDown();

        if (firing) {
            this.spawnAll(player.fire());
        }
    }

    protected updateEnemies(deltaTime: number): void {
        for (const enemy of this.enemies) {
            enemy.setActive(this.inActiveRange(enemy.transform));

            enemy.update(deltaTime);
        }
    }

    protected updateProjectiles(deltaTime: number): void {
        const player = this.player;

        if (player === null) {
            return;
        }

        for (const projectile of this.projectiles) {
            projectile.setActive(this.inActiveRange(projectile.transform));

            projectile.update(deltaTime);

            if (projectile.transform.intersects(player.transform)) {
                projectile.collidesWith(player);
            }

            for (const enemy of this.enemies) {
                if (projectile.transform.intersects(enemy.transform)) {
                    projectile.collidesWith(enemy);
                }
            }
        }

        this.projectiles = this.projectiles.filter(
            (entity) =>
                entity instanceof Projectile &&
                !entity.isDead() &&
                this.inBounds(entity.transform) &&
                !this.hitsWall(entity.transform)
        );
    }

    protected updateEnemyDeaths(): void {
        for (const enemy of this.enemies) {
            if (enemy.getStats().isDestroyed() && !this.xpAwardedTo.has(enemy)) {
                this.xpAwardedTo.add(enemy);
                this.player?.getStats().gainExperience(enemy.getStats().getXpReward());
            }
        }

        /*
         * Dead enemies stay around (frozen, playing their death animation —
         * see Enemy.playDeath()) until it finishes, instead of vanishing
         * the instant their health hits 0.
         */
        this.enemies = this.enemies.filter(
            (enemy) => !enemy.getStats().isDestroyed() || !enemy.isReadyForRemoval()
        );
    }

    protected handlePause(): boolean {
        if (!this.paused) {
            return false;
        }

        if (this.keys.isKeyJustPressed("Escape") || this.mobileInput.consumePause()) {
            this.paused = false;
        }

        this.pause.updateHover(this.mouse.getX(), this.mouse.getY());

        if (this.mouse.isClicked()) {
            const action = this.pause.onPress(this.mouse.getX(), this.mouse.getY());

            if (action === "resume") {
                this.paused = false;
            } else if (action === "start") {
                this.paused = false;
                this.onMainMenu?.();
            }
        } else if (this.mouse.isDown()) {
            this.pause.onDrag(this.mouse.getX(), this.mouse.getY());
        } else if (this.mouse.isReleased()) {
            this.pause.onRelease();
        }

        this.keys.endFrame();
        this.mouse.endFrame();

        return true;
    }

    protected handleCharacterScreen(): boolean {
        if (!this.characterOpen) {
            return false;
        }

        if (this.mouse.isClicked()) {
            this.characterScreen.handleClick(this.mouse.getX(), this.mouse.getY(), this.player!);
        }

        this.keys.endFrame();
        this.mouse.endFrame();

        return true;
    }

    protected renderWorld(ctx: CanvasRenderingContext2D): void {
        this.renderFloor(ctx);

        this.renderDecorations(ctx);

        for (const wall of this.walls) {
            wall.renderShadow(ctx, this.camera);
        }

        for (const wall of this.walls) {
            wall.renderBody(ctx, this.camera);
        }

        for (const projectile of this.projectiles) {
            if (this.inCameraView(projectile.transform)) {
                projectile.render(ctx, this.camera);
            }
        }

        this.player?.render(ctx, this.camera);

        for (const enemy of this.enemies) {
            if (this.inCameraView(enemy.transform)) {
                enemy.render(ctx, this.camera);
            }
        }

        this.renderHitboxes(ctx);

        this.renderMobileControls(ctx);
    }

    protected renderMobileControls(ctx: CanvasRenderingContext2D): void {
        if (this.characterOpen || this.dead) {
            return;
        }

        const moveBase = this.mobileInput.getMoveJoystickBase();
        const moveKnob = this.mobileInput.getMoveJoystickKnob();

        if (moveBase !== null && moveKnob !== null) {
            this.drawJoystick(ctx, moveBase, moveKnob);
        }

        const aimBase = this.mobileInput.getAimJoystickBase();
        const aimKnob = this.mobileInput.getAimJoystickKnob();

        if (aimBase !== null && aimKnob !== null) {
            this.drawJoystick(
                ctx,
                aimBase,
                aimKnob,
                "rgba(255,110,110,0.16)",
                "rgba(255,110,110,0.55)"
            );
        }
    }

    private drawJoystick(
        ctx: CanvasRenderingContext2D,
        base: { x: number; y: number },
        knob: { x: number; y: number },
        baseColor = "rgba(255,255,255,0.14)",
        knobColor = "rgba(255,255,255,0.5)"
    ): void {
        ctx.beginPath();
        ctx.arc(base.x, base.y, 58, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(knob.x, knob.y, 28, 0, Math.PI * 2);
        ctx.fillStyle = knobColor;
        ctx.fill();
    }

    private renderFloor(ctx: CanvasRenderingContext2D): void {
        if (this.floorSheet === null) {
            this.floorSheet = AssetPool.getImage("dungeon/tileset");

            if (this.floorSheet === null) {
                return;
            }
        }

        if (this.waterSheet === null) {
            this.waterSheet = AssetPool.getImage("dungeon/water");
        }

        const sheet = this.floorSheet;

        const tile = this.floorTileSize;

        const view = this.camera.getViewBounds(this.width, this.height);

        const startX = Math.max(0, Math.floor(view.x / tile) * tile);

        const startY = Math.max(0, Math.floor(view.y / tile) * tile);

        const endX = Math.min(this.worldWidth, view.x + view.w);

        const endY = Math.min(this.worldHeight, view.y + view.h);

        ctx.imageSmoothingEnabled = false;

        for (let wy = startY; wy < endY; wy += tile) {
            for (let wx = startX; wx < endX; wx += tile) {
                const drawWidth = Math.min(tile, this.worldWidth - wx);

                const drawHeight = Math.min(tile, this.worldHeight - wy);

                const screen = this.camera.worldToScreen(wx, wy);

                const water = this.waterSheet !== null ? this.findWaterRegion(wx, wy, tile) : null;

                if (water !== null) {
                    const [sourceColumn, sourceRow] = this.waterTileAt(water, wx, wy, tile);

                    ctx.drawImage(
                        this.waterSheet!,
                        sourceColumn * tile,
                        sourceRow * tile,
                        drawWidth,
                        drawHeight,
                        screen.x,
                        screen.y,
                        drawWidth,
                        drawHeight
                    );

                    continue;
                }

                if (!this.isFloorTile(wx, wy, tile)) {
                    continue;
                }

                const [sourceColumn, sourceRow] = this.floorTileAt(wx / tile, wy / tile);

                ctx.drawImage(
                    sheet,
                    sourceColumn * tile,
                    sourceRow * tile,
                    drawWidth,
                    drawHeight,
                    screen.x,
                    screen.y,
                    drawWidth,
                    drawHeight
                );
            }
        }
    }

    /** The water region (if any) covering the given tile's center. */
    private findWaterRegion(x: number, y: number, tileSize: number): RoomWall | null {
        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        return (
            this.waterRegions.find(
                (region) =>
                    centerX >= region.x &&
                    centerX < region.x + region.width &&
                    centerY >= region.y &&
                    centerY < region.y + region.height
            ) ?? null
        );
    }

    /**
     * Picks the water tileset's 9-slice frame tile for a given world tile —
     * corners/edges around the region's border, the plain pool tile inside —
     * so any size of water region reads as one continuous, bordered pool
     * instead of a patch of disconnected tiles.
     */
    private waterTileAt(region: RoomWall, wx: number, wy: number, tile: number): [number, number] {
        const col = Math.round((wx - region.x) / tile);
        const row = Math.round((wy - region.y) / tile);

        const lastCol = Math.max(0, Math.round(region.width / tile) - 1);
        const lastRow = Math.max(0, Math.round(region.height / tile) - 1);

        const atLeft = col <= 0;
        const atRight = col >= lastCol;
        const atTop = row <= 0;
        const atBottom = row >= lastRow;

        if (atTop && atLeft) return [9, 1];
        if (atTop && atRight) return [11, 1];
        if (atBottom && atLeft) return [9, 3];
        if (atBottom && atRight) return [11, 3];
        if (atTop) return [10, 1];
        if (atBottom) return [10, 3];
        if (atLeft) return [9, 2];
        if (atRight) return [11, 2];

        return [10, 2];
    }

    private renderDecorations(ctx: CanvasRenderingContext2D): void {
        for (const decoration of this.decorations) {
            if (!this.inBounds(decoration.transform)) {
                continue;
            }

            decoration.render(ctx, this.camera);
        }
    }

    private isFloorTile(x: number, y: number, tileSize: number): boolean {
        const layout = this.dungeonLayout;

        if (layout === null) {
            return true;
        }

        const centerX = x + tileSize / 2;
        const centerY = y + tileSize / 2;

        const inStub = this.marginFloor.some(
            (rect) =>
                centerX >= rect.x &&
                centerX < rect.x + rect.width &&
                centerY >= rect.y &&
                centerY < rect.y + rect.height
        );

        if (inStub) {
            return true;
        }

        if (this.findWaterRegion(x, y, tileSize) !== null) {
            return true;
        }

        return layout.rooms.some((room) => {
            const rotation = room.rotation ?? 0;
            const { x: originX, y: originY } = this.getRoomOrigin(room, layout);
            const width = this.roomWidth(room);
            const height = this.roomHeight(room);
            const regions = room.template.floorRegions;

            if (regions === undefined) {
                return (
                    centerX >= originX &&
                    centerX < originX + width &&
                    centerY >= originY &&
                    centerY < originY + height
                );
            }

            return regions.some((region) => {
                const rotated = rotateRect(
                    region,
                    room.template.width,
                    room.template.height,
                    rotation
                );

                return (
                    centerX >= originX + rotated.x &&
                    centerX < originX + rotated.x + rotated.width &&
                    centerY >= originY + rotated.y &&
                    centerY < originY + rotated.y + rotated.height
                );
            });
        });
    }

    protected renderHitboxes(ctx: CanvasRenderingContext2D): void {
        if (!this.showHitboxes) {
            return;
        }

        const box = (transform: Transform, color: string): void => {
            const screen = this.camera.worldToScreen(transform.x, transform.y);

            ctx.strokeStyle = color;

            ctx.lineWidth = 1;

            ctx.strokeRect(
                screen.x + 0.5,
                screen.y + 0.5,
                transform.width - 1,
                transform.height - 1
            );
        };

        for (const wallCollider of this.wallColliders) {
            box(wallCollider.getTransform(), "rgba(255,60,60,0.9)");
        }

        if (this.playerCollider) {
            box(this.playerCollider.getTransform(), "rgba(0,220,255,0.9)");
        }

        for (const enemy of this.enemies) {
            box(enemy.transform, "rgba(255,220,0,0.8)");
        }

        for (const projectile of this.projectiles) {
            box(projectile.transform, "rgba(80,255,120,0.7)");
        }
    }

    private floorTileAt(col: number, row: number): [number, number] {
        const hash = this.hashCell(col, row);

        if (hash % 100 < 85) {
            return this.floorTiles[hash % 3];
        }

        return this.floorTiles[3 + (hash % 2)];
    }

    private hashCell(col: number, row: number): number {
        let n = (col * 73856093) ^ (row * 19349663);

        n = (n ^ (n >>> 13)) >>> 0;

        return n;
    }

    getPaused(): boolean {
        return this.paused;
    }

    setPaused(value: boolean): void {
        this.paused = value;
    }

    onResize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }

    protected onExitReached(): void {}

    protected placeExit(x: number, y: number, size = 72): void {
        const transform = new Transform(x, y, size, size, 0);

        this.exit = new ExitPad("exitPad", transform);

        const collider = new AABBCollider(transform);

        collider.isTrigger = true;

        this.collisionWorld.register(this.exit, collider);
    }

    protected handleDebugKeys(): void {
        if (this.keys.isKeyJustPressed("KeyH")) {
            this.showHitboxes = !this.showHitboxes;
        }

        if (this.keys.isKeyJustPressed("KeyC")) {
            this.camera.toggleMode();
        }

        if (this.keys.isKeyJustPressed("Escape") || this.mobileInput.consumePause()) {
            this.paused = true;
        }

        if (this.keys.isKeyJustPressed("KeyI") || this.mobileInput.consumeCharacterScreen()) {
            this.characterOpen = !this.characterOpen;
            if (this.characterOpen) {
                this.characterScreen.setActiveTab("inventory");
            }
        }

        if (this.keys.isKeyJustPressed("KeyQ") || this.mobileInput.consumeSwitchWeapon()) {
            this.player?.switchWeapon();
        }

        if (this.keys.isKeyJustPressed("KeyK")) {
            this.player?.getStats().destroy();
        }
    }

    protected updateWorld(deltaTime: number): void {
        // Read this frame's touches before anything consumes them, so movement/aim aren't a frame stale.
        this.mobileInput.update(this.width, this.height);

        this.enemySpawner.tick(deltaTime, this.enemies.length, (count) => this.spawnBatch(count));

        this.updatePlayerMovement(deltaTime);

        this.updateEnemies(deltaTime);

        this.updateProjectiles(deltaTime);

        this.updateEnemyDeaths();

        if (this.exit !== null) {
            const cleared =
                this.enemySpawner.isFinished() &&
                this.enemies.every((enemy) => enemy.getStats().isDestroyed());

            this.exit.setActive(cleared);

            this.exit.update(deltaTime);

            const hits = this.collisionWorld.checkCollisions();

            this.exit.reached =
                this.exit.isActive() &&
                (hits.some(
                    (result) =>
                        result.isTrigger && (result.a === this.player || result.b === this.player)
                ) ||
                    (this.player !== null && this.player.transform.intersects(this.exit.transform)));

            if (this.exit.reached && !this.wasAtExit) {
                AudioManager.get().playSound("ding");

                this.onExitReached();
            }

            this.wasAtExit = this.exit.reached;
        }

        if (this.player !== null) {
            this.camera.update(deltaTime, this.player.transform, this.width, this.height);
        }

        this.keys.endFrame();
        this.mouse.endFrame();
    }

    protected renderExit(ctx: CanvasRenderingContext2D): void {
        this.exit?.render(ctx, this.camera);
    }

    protected renderPlayerOverlay(ctx: CanvasRenderingContext2D): void {
        if (this.player === null) {
            return;
        }

        if (this.isMobile) {
            MobileOverlayHelper.renderPlayerOverlay(ctx, this.player);
        } else {
            OverlayHelper.renderPlayerOverlay(ctx, this.player, this.width, this.height);
        }
    }

    protected renderDungeonStatus(ctx: CanvasRenderingContext2D): void {
        const layout = this.dungeonLayout;
        if (layout === null || this.player === null) return;

        const topPadding = 45;
        const barH = 112;
        const barY = topPadding;
        ctx.fillStyle = "rgba(8, 10, 16, 0.9)";
        ctx.fillRect(0, barY, this.width, barH);
        ctx.strokeStyle = "rgba(255,255,255,0.14)";
        ctx.strokeRect(0.5, barY + 0.5, this.width - 1, barH - 1);

        const currentRoom = layout.rooms.find((room) => {
            const origin = this.getRoomOrigin(room, layout);
            return (
                this.player!.transform.x >= origin.x &&
                this.player!.transform.x <= origin.x + this.roomWidth(room) &&
                this.player!.transform.y >= origin.y &&
                this.player!.transform.y <= origin.y + this.roomHeight(room)
            );
        });
        const currentIndex = currentRoom === undefined ? -1 : layout.rooms.indexOf(currentRoom);
        const total = this.enemySpawner.getTotalToSpawn();
        const spawned = Math.min(total, this.enemySpawner.getSpawnedCount());
        const living = this.enemies.filter((enemy) => !enemy.getStats().isDestroyed()).length;

        ctx.font = "bold 12px monospace";
        ctx.fillStyle = "#f2f4f8";
        ctx.textAlign = "left";
        ctx.fillText(this.getStageLabel(), 16, barY + 17);
        ctx.font = "11px monospace";
        ctx.fillStyle = "#9da5b4";
        ctx.fillText(`WAVE ${spawned}/${total}   LIVING ${living}`, 16, barY + 38);

        const mapRadius = 48;
        const mapX = this.width - mapRadius - 18;
        const mapY = barY + mapRadius + 8;
        const mapDiameter = mapRadius * 2;
        const scale = Math.min(
            (mapDiameter - 12) / this.worldWidth,
            (mapDiameter - 12) / this.worldHeight
        );
        const mapPoint = (x: number, y: number) => ({
            x: mapX - (this.worldWidth * scale) / 2 + x * scale,
            y: mapY - (this.worldHeight * scale) / 2 + y * scale,
        });

        if (this.minimapCanvas === null) {
            this.minimapCanvas = this.buildMinimapCanvas(layout, scale, mapRadius);
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(mapX, mapY, mapRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "rgba(3, 5, 10, 0.96)";
        ctx.fillRect(mapX - mapRadius, mapY - mapRadius, mapDiameter, mapDiameter);

        ctx.drawImage(this.minimapCanvas, mapX - mapRadius, mapY - mapRadius);

        const playerPoint = mapPoint(
            this.player.transform.x + this.player.transform.width / 2,
            this.player.transform.y + this.player.transform.height / 2
        );
        ctx.save();
        ctx.translate(playerPoint.x, playerPoint.y);
        ctx.rotate((this.player.getFacingRotation() * Math.PI) / 180);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-5, -4);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-5, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (this.exit !== null) {
            const exitPoint = mapPoint(
                this.exit.transform.x + this.exit.transform.width / 2,
                this.exit.transform.y + this.exit.transform.height / 2
            );
            ctx.fillStyle = this.exit.isActive() ? "#5ad46a" : "#9da5b4";
            ctx.beginPath();
            ctx.arc(exitPoint.x, exitPoint.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        ctx.beginPath();
        ctx.arc(mapX, mapY, mapRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.65)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#9da5b4";
        ctx.font = "10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(
            `ROOM ${Math.max(1, currentIndex + 1)}/${layout.rooms.length}`,
            this.width - 16,
            barY + 104
        );
        ctx.textAlign = "left";
    }

    private buildMinimapTiles(
        layout: DungeonLayout
    ): Array<{ x: number; y: number; room: DungeonRoom | undefined }> {
        const tiles: Array<{ x: number; y: number; room: DungeonRoom | undefined }> = [];

        for (let worldY = 0; worldY < this.worldHeight; worldY += this.floorTileSize) {
            for (let worldX = 0; worldX < this.worldWidth; worldX += this.floorTileSize) {
                if (!this.isFloorTile(worldX, worldY, this.floorTileSize)) {
                    continue;
                }

                const room = layout.rooms.find((candidate) => {
                    const origin = this.getRoomOrigin(candidate, layout);
                    return (
                        worldX >= origin.x &&
                        worldX < origin.x + this.roomWidth(candidate) &&
                        worldY >= origin.y &&
                        worldY < origin.y + this.roomHeight(candidate)
                    );
                });

                tiles.push({ x: worldX, y: worldY, room });
            }
        }

        return tiles;
    }

    private buildMinimapCanvas(
        layout: DungeonLayout,
        scale: number,
        mapRadius: number
    ): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = mapRadius * 2;
        canvas.height = mapRadius * 2;

        const mapTileSize = this.floorTileSize * scale;
        const offsetX = mapRadius - (this.worldWidth * scale) / 2;
        const offsetY = mapRadius - (this.worldHeight * scale) / 2;

        if (this.minimapTiles.length === 0) {
            this.minimapTiles = this.buildMinimapTiles(layout);
        }

        const minimapContext = canvas.getContext("2d");
        if (minimapContext === null) {
            return canvas;
        }

        for (const tile of this.minimapTiles) {
            const boss = tile.room?.template.tags?.includes("boss") ?? false;
            minimapContext.fillStyle = boss ? "#e05261" : "#87909f";
            minimapContext.fillRect(
                offsetX + tile.x * scale,
                offsetY + tile.y * scale,
                mapTileSize + 0.5,
                mapTileSize + 0.5
            );
        }

        return canvas;
    }

    protected getStageLabel(): string {
        return "DUNGEON";
    }

    protected getEnemyLevel(): number {
        return this.player?.getStats().getLevel() ?? 1;
    }

    private async spawnBatch(count: number): Promise<number> {
        const enemies = await this.spawnEnemies(count);

        for (const enemy of enemies) {
            this.registerEnemy(enemy);
        }

        return enemies.length;
    }

    private async spawnEnemies(count: number): Promise<Enemy[]> {
        const spawned: Enemy[] = [];

        const level = this.getEnemyLevel();

        for (let i = 0; i < count; i++) {
            const transform = this.findSpawnPoint(52, 52);

            if (transform === null) {
                continue;
            }

            const isArcher = Math.random() < this.archerChance;

            const scaling = scaleObject(level, isArcher ? this.archerScaling : this.meleeScaling);

            const stats = new EntityAttributes(
                scaling.health,
                scaling.speed,
                scaling.damage,
                scaling.defense
            );

            const enemy = isArcher
                ? await ArcherEnemy.create({
                      name: `Archer ${i}`,
                      transform,
                      team: this.enemyTeam,
                      enemyStats: stats,
                      xpReward: scaling.xp,
                  })
                : await MeleeEnemy.create({
                      name: `Brute ${i}`,
                      transform,
                      team: this.enemyTeam,
                      enemyStats: stats,
                      xpReward: scaling.xp,
                  });

            spawned.push(enemy);
        }

        return spawned;
    }

    findClearPlayerSpawn(
        preferX: number,
        preferY: number,
        size = 52
    ): {
        x: number;
        y: number;
    } {
        if (this.isClear(preferX, preferY, size)) {
            return {
                x: preferX,
                y: preferY,
            };
        }

        const STEP = 24;
        const MAX_RING = 40;

        for (let ring = 1; ring <= MAX_RING; ring++) {
            const r = ring * STEP;

            for (let a = 0; a < 8; a++) {
                const angle = (a / 8) * Math.PI * 2;

                const x = preferX + Math.cos(angle) * r;

                const y = preferY + Math.sin(angle) * r;

                if (this.isClear(x, y, size)) {
                    return {
                        x,
                        y,
                    };
                }
            }
        }

        return {
            x: preferX,
            y: preferY,
        };
    }

    private isClear(x: number, y: number, size: number): boolean {
        if (x < 0 || y < 0 || x + size > this.worldWidth || y + size > this.worldHeight) {
            return false;
        }

        const probe = new Transform(x, y, size, size, 0);

        return !this.hitsSolid(new AABBCollider(probe));
    }

    protected findSpawnPoint(width: number, height: number): Transform | null {
        const margin = 80;
        const minDistance = 280;
        const tries = 40;

        for (let i = 0; i < tries; i++) {
            const x = margin + Math.random() * (this.worldWidth - width - margin * 2);

            const y = margin + Math.random() * (this.worldHeight - height - margin * 2);

            const transform = new Transform(x, y, width, height, 0);

            if (!this.isFloorArea(x, y, width, height)) {
                continue;
            }

            if (this.hitsSolid(new AABBCollider(transform))) {
                continue;
            }

            if (
                this.player &&
                Math.hypot(x - this.player.transform.x, y - this.player.transform.y) < minDistance
            ) {
                continue;
            }

            return transform;
        }

        return null;
    }

    private isFloorArea(x: number, y: number, width: number, height: number): boolean {
        if (this.dungeonLayout === null) {
            return true;
        }

        const step = this.floorTileSize;

        for (let sampleY = y; sampleY < y + height; sampleY += step) {
            for (let sampleX = x; sampleX < x + width; sampleX += step) {
                const sampleWidth = Math.min(step, x + width - sampleX);
                const sampleHeight = Math.min(step, y + height - sampleY);

                if (!this.isFloorTile(sampleX, sampleY, Math.min(sampleWidth, sampleHeight))) {
                    return false;
                }
            }
        }

        return true;
    }

    onPlayerDeath?: () => void;
    onRestart?: () => void;
    onMainMenu?: () => void;

    protected handleDeath(): boolean {
        if (!this.dead && this.player !== null && this.player.getStats().isDestroyed()) {
            this.dead = true;

            AudioManager.get().playMusic("gameOver");

            this.onPlayerDeath?.();
        }

        if (!this.dead) {
            return false;
        }

        this.deathScreen.updateHover(this.mouse.getX(), this.mouse.getY());

        if (this.mouse.isClicked()) {
            const action = this.deathScreen.onPress(this.mouse.getX(), this.mouse.getY());

            if (action === "restart") {
                this.onRestart?.();
            } else if (action === "menu") {
                this.onMainMenu?.();
            }
        }

        this.keys.endFrame();
        this.mouse.endFrame();

        return true;
    }

    /**
     * Rooms no longer have to fill their whole grid cell — a room smaller
     * than `cellWidth`/`cellHeight` is centered inside it, and any leftover
     * margin on a door side is bridged by a stub corridor (see
     * `buildRoomConnectors`). This is what lets rooms vary in size while
     * still lining up with their neighbours.
     */
    protected getRoomOrigin(room: DungeonRoom, layout: DungeonLayout): { x: number; y: number } {
        if (room.originX !== undefined && room.originY !== undefined) {
            return { x: room.originX, y: room.originY };
        }

        const cellWidth = layout.cellWidth ?? this.roomWidth(room);
        const cellHeight = layout.cellHeight ?? this.roomHeight(room);

        const cellX = room.gridX * cellWidth;
        const cellY = room.gridY * cellHeight;

        return {
            x: cellX + roundToTile((cellWidth - this.roomWidth(room)) / 2),
            y: cellY + roundToTile((cellHeight - this.roomHeight(room)) / 2),
        };
    }

    protected buildRoom(room: DungeonRoom, layout: DungeonLayout): void {
        const template = room.template;
        const rotation = room.rotation ?? 0;

        const { x: originX, y: originY } = this.getRoomOrigin(room, layout);

        for (const wall of template.walls) {
            const rotated = rotateRect(wall, template.width, template.height, rotation);
            this.addWall(originX + rotated.x, originY + rotated.y, rotated.width, rotated.height);
        }

        for (const pillar of template.pillars) {
            const rotated = rotatePoint(pillar, template.width, template.height, rotation);
            this.addPillar(originX + rotated.x, originY + rotated.y, pillar.variant ?? 0);
        }

        for (const chestSpot of template.chestSpots) {
            const rotated = rotatePoint(chestSpot, template.width, template.height, rotation);
            this.chestSpots.push([originX + rotated.x, originY + rotated.y]);
        }

        for (const decoration of template.decorations ?? []) {
            const rotated = rotatePoint(decoration, template.width, template.height, rotation);
            this.addDecoration(
                originX + rotated.x,
                originY + rotated.y,
                decoration.kind,
                decoration.scale,
                (decoration.rotation ?? 0) + rotation
            );
        }

        for (const region of template.waterRegions ?? []) {
            const rotated = rotateRect(region, template.width, template.height, rotation);
            this.waterRegions.push({
                x: originX + rotated.x,
                y: originY + rotated.y,
                width: rotated.width,
                height: rotated.height,
            });
        }

        const north = this.getRoomAt(layout, room.gridX, room.gridY - 1);

        const south = this.getRoomAt(layout, room.gridX, room.gridY + 1);

        const west = this.getRoomAt(layout, room.gridX - 1, room.gridY);

        const east = this.getRoomAt(layout, room.gridX + 1, room.gridY);

        this.buildNorthWall(room, north, originX, originY);

        this.buildSouthWall(room, south, originX, originY);

        this.buildWestWall(room, west, originX, originY);

        this.buildEastWall(room, east, originX, originY);

        this.buildRoomConnectors(room, layout, originX, originY);
    }

    /**
     * Bridges the gap left by centering a smaller-than-cell room: for every
     * door whose side doesn't reach the cell edge, lays down a short railed
     * stub corridor (and its floor) out to that edge. Because every room is
     * centered in its cell, a door's position always lands on the cell's
     * center line regardless of that room's own size — so two differently
     * sized neighbours' stubs always meet up cleanly.
     */
    private buildRoomConnectors(
        room: DungeonRoom,
        layout: DungeonLayout,
        originX: number,
        originY: number
    ): void {
        if (room.originX !== undefined && room.originY !== undefined) {
            return;
        }

        const cellWidth = layout.cellWidth ?? this.roomWidth(room);
        const cellHeight = layout.cellHeight ?? this.roomHeight(room);

        const cellX = room.gridX * cellWidth;
        const cellY = room.gridY * cellHeight;

        const W = this.roomWidth(room);
        const H = this.roomHeight(room);
        const T = room.template.wallThickness;
        const doorWidth = room.template.doorWidth;

        const marginN = originY - cellY;
        const marginS = cellY + cellHeight - (originY + H);
        const marginW = originX - cellX;
        const marginE = cellX + cellWidth - (originX + W);

        if (marginN > 0 && this.roomHasDoor(room, "N")) {
            this.buildStub(
                originX + W / 2 - doorWidth / 2,
                cellY,
                doorWidth,
                marginN,
                T,
                "vertical"
            );
        }

        if (marginS > 0 && this.roomHasDoor(room, "S")) {
            this.buildStub(
                originX + W / 2 - doorWidth / 2,
                originY + H,
                doorWidth,
                marginS,
                T,
                "vertical"
            );
        }

        if (marginW > 0 && this.roomHasDoor(room, "W")) {
            this.buildStub(
                cellX,
                originY + H / 2 - doorWidth / 2,
                marginW,
                doorWidth,
                T,
                "horizontal"
            );
        }

        if (marginE > 0 && this.roomHasDoor(room, "E")) {
            this.buildStub(
                originX + W,
                originY + H / 2 - doorWidth / 2,
                marginE,
                doorWidth,
                T,
                "horizontal"
            );
        }
    }

    /** A short railed corridor segment bridging a room to its cell edge. */
    private buildStub(
        x: number,
        y: number,
        width: number,
        height: number,
        thickness: number,
        orientation: "horizontal" | "vertical"
    ): void {
        this.marginFloor.push({ x, y, width, height });

        if (orientation === "horizontal") {
            this.addWall(x, y - thickness, width, thickness);
            this.addWall(x, y + height, width, thickness);
        } else {
            this.addWall(x - thickness, y, thickness, height);
            this.addWall(x + width, y, thickness, height);
        }
    }

    private getRoomAt(layout: DungeonLayout, gridX: number, gridY: number): DungeonRoom | null {
        return (
            layout.rooms.find(
                (room: DungeonRoom) => room.gridX === gridX && room.gridY === gridY
            ) ?? null
        );
    }

    private roomHasDoor(room: DungeonRoom | RoomTemplate | null, direction: Direction): boolean {
        if (room === null) {
            return false;
        }

        if ("template" in room) {
            return this.roomDoors(room).includes(direction);
        }

        return room.doors.includes(direction);
    }

    private roomDoors(room: DungeonRoom): Direction[] {
        const rotation = room.rotation ?? 0;
        return room.template.doors.map((direction) => rotateDirection(direction, rotation));
    }

    protected roomWidth(room: DungeonRoom): number {
        return room.rotation === 90 || room.rotation === 270
            ? room.template.height
            : room.template.width;
    }

    protected roomHeight(room: DungeonRoom): number {
        return room.rotation === 90 || room.rotation === 270
            ? room.template.width
            : room.template.height;
    }

    private roomHasBoundaryWall(room: DungeonRoom, direction: Direction): boolean {
        const rotation = room.rotation ?? 0;
        const originalDirection = rotateDirection(
            direction,
            ((360 - rotation) % 360) as RoomRotation
        );

        return room.template.boundaryWalls?.[originalDirection] !== false;
    }

    private roomsConnect(
        room: DungeonRoom,
        direction: Direction,
        neighbour: DungeonRoom | null
    ): boolean {
        if (neighbour === null) {
            return false;
        }

        return (
            this.roomHasDoor(room, direction) &&
            this.roomHasDoor(neighbour, OPPOSITE_DIRECTION[direction])
        );
    }

    private buildNorthWall(
        room: DungeonRoom,
        neighbour: DungeonRoom | null,
        originX: number,
        originY: number
    ): void {
        const template = room.template;

        if (!this.roomHasBoundaryWall(room, "N")) {
            return;
        }

        const W = this.roomWidth(room);

        const T = template.wallThickness;

        const connected = this.roomsConnect(room, "N", neighbour);

        if (!connected) {
            this.addWall(originX, originY, W, T);

            return;
        }

        this.addHorizontalDoorWall(originX, originY, W, T, template.doorWidth);
    }

    private buildSouthWall(
        room: DungeonRoom,
        neighbour: DungeonRoom | null,
        originX: number,
        originY: number
    ): void {
        const template = room.template;

        if (!this.roomHasBoundaryWall(room, "S")) {
            return;
        }

        const W = this.roomWidth(room);

        const H = this.roomHeight(room);

        const T = template.wallThickness;

        const connected = this.roomsConnect(room, "S", neighbour);

        if (!connected) {
            this.addWall(originX, originY + H - T, W, T);

            return;
        }

        this.addHorizontalDoorWall(originX, originY + H - T, W, T, template.doorWidth);
    }

    private buildWestWall(
        room: DungeonRoom,
        neighbour: DungeonRoom | null,
        originX: number,
        originY: number
    ): void {
        const template = room.template;

        if (!this.roomHasBoundaryWall(room, "W")) {
            return;
        }

        const H = this.roomHeight(room);

        const T = template.wallThickness;

        const connected = this.roomsConnect(room, "W", neighbour);

        if (!connected) {
            this.addWall(originX, originY, T, H);

            return;
        }

        this.addVerticalDoorWall(originX, originY, H, T, template.doorWidth);
    }

    private buildEastWall(
        room: DungeonRoom,
        neighbour: DungeonRoom | null,
        originX: number,
        originY: number
    ): void {
        const template = room.template;

        if (!this.roomHasBoundaryWall(room, "E")) {
            return;
        }

        const W = this.roomWidth(room);

        const H = this.roomHeight(room);

        const T = template.wallThickness;

        const connected = this.roomsConnect(room, "E", neighbour);

        if (!connected) {
            this.addWall(originX + W - T, originY, T, H);

            return;
        }

        this.addVerticalDoorWall(originX + W - T, originY, H, T, template.doorWidth);
    }

    private addHorizontalDoorWall(
        x: number,
        y: number,
        width: number,
        thickness: number,
        doorWidth: number
    ): void {
        const gapStart = Math.max(0, (width - doorWidth) / 2);

        const leftWidth = gapStart;

        const rightWidth = width - gapStart - doorWidth;

        if (leftWidth > 0) {
            this.addWall(x, y, leftWidth, thickness);
        }

        if (rightWidth > 0) {
            this.addWall(x + gapStart + doorWidth, y, rightWidth, thickness);
        }
    }

    private addVerticalDoorWall(
        x: number,
        y: number,
        height: number,
        thickness: number,
        doorWidth: number
    ): void {
        const gapStart = Math.max(0, (height - doorWidth) / 2);

        const topHeight = gapStart;

        const bottomHeight = height - gapStart - doorWidth;

        if (topHeight > 0) {
            this.addWall(x, y, thickness, topHeight);
        }

        if (bottomHeight > 0) {
            this.addWall(x, y + gapStart + doorWidth, thickness, bottomHeight);
        }
    }
}
