export type Direction = "N" | "S" | "E" | "W";
export type RoomRotation = 0 | 90 | 180 | 270;

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
    N: "S",
    S: "N",
    E: "W",
    W: "E",
};

export const rotateDirection = (direction: Direction, rotation: RoomRotation): Direction => {
    const directions: Direction[] = ["N", "E", "S", "W"];
    return directions[(directions.indexOf(direction) + rotation / 90) % directions.length];
};

export const rotateRect = (
    rect: RoomWall,
    width: number,
    height: number,
    rotation: RoomRotation
): RoomWall => {
    switch (rotation) {
        case 90:
            return { x: height - rect.y - rect.height, y: rect.x, width: rect.height, height: rect.width };
        case 180:
            return {
                x: width - rect.x - rect.width,
                y: height - rect.y - rect.height,
                width: rect.width,
                height: rect.height,
            };
        case 270:
            return { x: rect.y, y: width - rect.x - rect.width, width: rect.height, height: rect.width };
        default:
            return rect;
    }
};

export const rotatePoint = (
    point: { x: number; y: number },
    width: number,
    height: number,
    rotation: RoomRotation
): { x: number; y: number } => {
    switch (rotation) {
        case 90:
            return { x: height - point.y, y: point.x };
        case 180:
            return { x: width - point.x, y: height - point.y };
        case 270:
            return { x: point.y, y: width - point.x };
        default:
            return point;
    }
};

export interface RoomWall {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface RoomPillar {
    x: number;
    y: number;
    variant?: number;
}

export interface RoomChestSpot {
    x: number;
    y: number;
}

export interface RoomDecoration {
    x: number;
    y: number;
    kind: string;
    /** Multiplier over the decoration's default pixel-art scale. */
    scale?: number;
    /** Degrees, e.g. 90 to turn a horizontal prop (like a bridge) vertical. */
    rotation?: number;
}

export interface RoomTemplate {
    id: string;

    width: number;
    height: number;

    wallThickness: number;
    doorWidth: number;

    walls: RoomWall[];
    floorRegions?: RoomWall[];
    /**
     * Water is rendered (and walked on) like floor, but with the water
     * tileset instead of stone, auto-framed at its edges — this is how a
     * room gets one cohesive pool/stream instead of scattered water decals.
     * Implicitly counts as floor, so it doesn't need a matching floorRegion.
     */
    waterRegions?: RoomWall[];
    pillars: RoomPillar[];
    chestSpots: RoomChestSpot[];
    decorations?: RoomDecoration[];

    doors: Direction[];
    boundaryWalls?: Partial<Record<Direction, boolean>>;

    tags: string[];
    requiresTags?: string[];
    excludesTags?: string[];

    /**
     * Relative odds this template gets picked over others during generation.
     * Defaults to 1. Corridors typically weight higher so they show up as
     * connective tissue between rooms more often than as a one-off room.
     */
    weight?: number;
}
