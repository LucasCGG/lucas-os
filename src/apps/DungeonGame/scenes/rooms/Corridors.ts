import { Direction, RoomDecoration, RoomTemplate, RoomWall } from "../RoomTemplate";

const CELL = { width: 800, height: 600, wallThickness: 40, doorWidth: 120 };

const has = (dirs: Direction[], d: Direction): boolean => dirs.includes(d);

interface CorridorGeometry {
    width: number;
    height: number;
    wallThickness: number;
    hubSize: number;
}

/**
 * Rails fencing each open arm, or a short cap sealing a closed side, all
 * derived from the hub's centered position — this is what lets a corridor
 * be a different size from the 800×600 baseline (see `sizedCorridor`) while
 * still meeting its neighbours at the door.
 */
const corridorWalls = (dirs: Direction[], geo: CorridorGeometry): RoomWall[] => {
    const { width, height, wallThickness: T, hubSize } = geo;

    const hubX = (width - hubSize) / 2;
    const hubY = (height - hubSize) / 2;

    const walls: RoomWall[] = [];

    if (has(dirs, "N")) {
        walls.push({ x: hubX - T, y: 0, width: T, height: hubY });
        walls.push({ x: hubX + hubSize, y: 0, width: T, height: hubY });
    } else {
        walls.push({ x: hubX, y: hubY - T, width: hubSize, height: T });
    }

    if (has(dirs, "S")) {
        walls.push({ x: hubX - T, y: hubY + hubSize, width: T, height: height - (hubY + hubSize) });
        walls.push({ x: hubX + hubSize, y: hubY + hubSize, width: T, height: height - (hubY + hubSize) });
    } else {
        walls.push({ x: hubX, y: hubY + hubSize, width: hubSize, height: T });
    }

    if (has(dirs, "E")) {
        walls.push({ x: hubX + hubSize, y: hubY - T, width: width - (hubX + hubSize), height: T });
        walls.push({
            x: hubX + hubSize,
            y: hubY + hubSize,
            width: width - (hubX + hubSize),
            height: T,
        });
    } else {
        walls.push({ x: hubX + hubSize, y: hubY, width: T, height: hubSize });
    }

    if (has(dirs, "W")) {
        walls.push({ x: 0, y: hubY - T, width: hubX, height: T });
        walls.push({ x: 0, y: hubY + hubSize, width: hubX, height: T });
    } else {
        walls.push({ x: hubX - T, y: hubY, width: T, height: hubSize });
    }

    return walls;
};

/** Floor = hub + one arm per open door. */
const corridorFloor = (dirs: Direction[], geo: CorridorGeometry): RoomWall[] => {
    const { width, height, hubSize } = geo;

    const hubX = (width - hubSize) / 2;
    const hubY = (height - hubSize) / 2;

    const regions: RoomWall[] = [{ x: hubX, y: hubY, width: hubSize, height: hubSize }];

    if (has(dirs, "N")) regions.push({ x: hubX, y: 0, width: hubSize, height: hubY });
    if (has(dirs, "S"))
        regions.push({ x: hubX, y: hubY + hubSize, width: hubSize, height: height - (hubY + hubSize) });
    if (has(dirs, "E"))
        regions.push({ x: hubX + hubSize, y: hubY, width: width - (hubX + hubSize), height: hubSize });
    if (has(dirs, "W")) regions.push({ x: 0, y: hubY, width: hubX, height: hubSize });

    return regions;
};

interface CorridorOptions {
    tags?: string[];
    /** Relative pick odds — corridors default higher so they show up as
     *  connective tissue between rooms more often than a one-off room does. */
    weight?: number;
    width?: number;
    height?: number;
    wallThickness?: number;
    doorWidth?: number;
    decorations?: RoomDecoration[];
    /** A pool spanning the hub, in room-local coordinates — see `sizedCorridor`. */
    water?: RoomWall;
}

const sizedCorridor = (id: string, doors: Direction[], options: CorridorOptions = {}): RoomTemplate => {
    const width = options.width ?? CELL.width;
    const height = options.height ?? CELL.height;
    const wallThickness = options.wallThickness ?? CELL.wallThickness;
    const doorWidth = options.doorWidth ?? CELL.doorWidth;

    // The hub is always exactly as wide as the doorway — anything else leaves
    // a seam where the arm's floor/rails don't line up with the door gap (or
    // with the stub WorldScene bridges in when this corridor is smaller than
    // its neighbours' shared cell).
    const hubSize = doorWidth;

    const geo: CorridorGeometry = { width, height, wallThickness, hubSize };

    return {
        id,
        width,
        height,
        wallThickness,
        doorWidth,
        walls: corridorWalls(doors, geo),
        floorRegions: corridorFloor(doors, geo),
        waterRegions: options.water ? [options.water] : undefined,
        pillars: [],
        chestSpots: [],
        // A grate sits in the hub, which is floor in every variant regardless
        // of which arms are open — the one spot guaranteed safe to decorate.
        decorations: options.decorations ?? [{ x: width / 2, y: height / 2, kind: "floorDrain" }],
        doors,
        // Corridors carry their own complete wall set (rails along every open
        // arm, caps on every closed one) shaped around the hub, not around
        // the room's outer rectangle — the generic per-side boundary wall
        // WorldScene builds for ordinary rooms would otherwise cut a
        // full-width/height wall straight across empty (non-floor) space in
        // this room's corners, appearing as "walls floating in the void".
        boundaryWalls: { N: false, S: false, E: false, W: false },
        tags: options.tags ?? ["corridor"],
        weight: options.weight ?? 2,
    };
};

const corridor = (id: string, doors: Direction[], tags: string[] = ["corridor"]): RoomTemplate =>
    sizedCorridor(id, doors, { tags });

export const CORRIDOR_TEMPLATES: RoomTemplate[] = [
    // straight
    corridor("corridor_ew", ["E", "W"]),
    corridor("corridor_ns", ["N", "S"]),
    // elbows
    corridor("corridor_ne", ["N", "E"]),
    corridor("corridor_nw", ["N", "W"]),
    corridor("corridor_se", ["S", "E"]),
    corridor("corridor_sw", ["S", "W"]),
    // tees
    corridor("corridor_nse", ["N", "S", "E"]),
    corridor("corridor_nsw", ["N", "S", "W"]),
    corridor("corridor_new", ["N", "E", "W"]),
    corridor("corridor_sew", ["S", "E", "W"]),
    // cross
    corridor("corridor_nsew", ["N", "S", "E", "W"]),

    // A river runs the full height of the room, crossed by a bridge where the
    // E/W path goes — every door in this pool is 120 wide (the shared
    // baseline), so this stays a normal-size cell that lines up with any
    // neighbour; the water is what makes it feel distinct, not its size.
    sizedCorridor("corridor_gallery_ew", ["E", "W"], {
        tags: ["corridor", "water"],
        weight: 1,
        water: { x: 340, y: 0, width: 120, height: 600 },
        decorations: [
            { x: 400, y: 300, kind: "woodBridge", scale: 1.6 },
            { x: 300, y: 90, kind: "waterMoss" },
            { x: 500, y: 510, kind: "waterMoss" },
        ],
    }),
];

// Handy if you ever want to spawn a bespoke corridor from door data at runtime.
export { corridor as makeCorridor, sizedCorridor };
