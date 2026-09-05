import { Direction, RoomTemplate } from "../RoomTemplate";

const roomDefaults = {
    width: 800,
    height: 600,
    wallThickness: 40,
    doorWidth: 120,
};

/**
 * Uniformly resizes a finished room (walls, pillars, chests, decorations —
 * everything) so a handful of rooms can feel grander or cozier than the
 * 800×600 baseline instead of every room being identically sized. The
 * dungeon grid still allocates a fixed max-size cell per room; WorldScene
 * centers anything smaller and bridges the gap with stub corridors, so
 * mismatched sizes still line up at the doors.
 */
const scaleRoom = (room: RoomTemplate, factorX: number, factorY: number): RoomTemplate => ({
    ...room,
    width: Math.round(room.width * factorX),
    height: Math.round(room.height * factorY),
    walls: room.walls.map((wall) => ({
        x: Math.round(wall.x * factorX),
        y: Math.round(wall.y * factorY),
        width: Math.round(wall.width * factorX),
        height: Math.round(wall.height * factorY),
    })),
    pillars: room.pillars.map((pillar) => ({
        ...pillar,
        x: Math.round(pillar.x * factorX),
        y: Math.round(pillar.y * factorY),
    })),
    chestSpots: room.chestSpots.map((chest) => ({
        x: Math.round(chest.x * factorX),
        y: Math.round(chest.y * factorY),
    })),
    decorations: (room.decorations ?? []).map((decoration) => ({
        ...decoration,
        x: Math.round(decoration.x * factorX),
        y: Math.round(decoration.y * factorY),
    })),
    waterRegions: (room.waterRegions ?? []).map((water) => ({
        x: Math.round(water.x * factorX),
        y: Math.round(water.y * factorY),
        width: Math.round(water.width * factorX),
        height: Math.round(water.height * factorY),
    })),
});

const withPillarWallClearance = (room: RoomTemplate): RoomTemplate => ({
    ...room,
    walls: room.walls.map((wall) => {
        if (wall.width > wall.height) {
            return {
                ...wall,
                y: wall.y < room.height / 2 ? wall.y - 20 : wall.y + 20,
            };
        }

        return {
            ...wall,
            x: wall.x < room.width / 2 ? wall.x - 20 : wall.x + 20,
        };
    }),
    pillars: room.pillars.map((pillar) => ({
        ...pillar,
        x: pillar.x < room.width / 2 ? pillar.x - 20 : pillar.x + 20,
        y: pillar.y < room.height / 2 ? pillar.y - 20 : pillar.y + 20,
    })),
});

export const Room_Entrance: RoomTemplate = withPillarWallClearance({
    ...roomDefaults,
    id: "new_entrance",
    walls: [
        { x: 160, y: 140, width: 200, height: 40 },
        { x: 440, y: 140, width: 200, height: 40 },
        { x: 160, y: 420, width: 480, height: 40 },
        { x: 360, y: 180, width: 40, height: 120 },
    ],
    pillars: [
        { x: 90, y: 90, variant: 0 },
        { x: 680, y: 90, variant: 1 },
        { x: 90, y: 460, variant: 2 },
        { x: 680, y: 460, variant: 3 },
    ],
    chestSpots: [{ x: 240, y: 260 }],
    decorations: [
        { x: 70, y: 140, kind: "candelabra" },
        { x: 730, y: 140, kind: "candelabra" },
        { x: 70, y: 420, kind: "urnLarge" },
        { x: 730, y: 420, kind: "urnLarge" },
        { x: 400, y: 500, kind: "rubble" },
    ],
    doors: ["E", "S"],
    tags: ["start", "normal"],
});

export const Room_Barracks: RoomTemplate = withPillarWallClearance({
    ...roomDefaults,
    id: "new_barracks",
    walls: [
        { x: 140, y: 140, width: 520, height: 40 },
        { x: 140, y: 420, width: 220, height: 40 },
        { x: 440, y: 420, width: 220, height: 40 },
        { x: 360, y: 180, width: 40, height: 180 },
    ],
    pillars: [
        { x: 80, y: 80, variant: 0 },
        { x: 690, y: 80, variant: 1 },
        { x: 80, y: 470, variant: 2 },
        { x: 690, y: 470, variant: 3 },
        { x: 220, y: 250, variant: 0 },
        { x: 540, y: 250, variant: 1 },
    ],
    chestSpots: [
        { x: 220, y: 300 },
        { x: 540, y: 300 },
    ],
    decorations: [
        { x: 70, y: 130, kind: "crate" },
        { x: 730, y: 130, kind: "crate" },
        { x: 70, y: 500, kind: "crate" },
        { x: 730, y: 500, kind: "crate" },
        { x: 400, y: 90, kind: "grillWindow", scale: 1.5 },
    ],
    doors: ["N", "E", "W"],
    tags: ["combat"],
});

export const Room_Gallery: RoomTemplate = scaleRoom(
    withPillarWallClearance({
    ...roomDefaults,
    id: "new_gallery",
    walls: [
        { x: 140, y: 120, width: 180, height: 40 },
        { x: 480, y: 120, width: 180, height: 40 },
        { x: 140, y: 440, width: 520, height: 40 },
        { x: 320, y: 160, width: 40, height: 160 },
        { x: 440, y: 280, width: 40, height: 160 },
    ],
    pillars: [
        { x: 80, y: 70, variant: 0 },
        { x: 690, y: 70, variant: 1 },
        { x: 80, y: 490, variant: 2 },
        { x: 690, y: 490, variant: 3 },
        { x: 220, y: 250, variant: 2 },
        { x: 580, y: 350, variant: 3 },
    ],
    chestSpots: [
        { x: 220, y: 220 },
        { x: 560, y: 220 },
    ],
    decorations: [
        { x: 90, y: 80, kind: "goldPile" },
        { x: 710, y: 80, kind: "goldPile" },
        { x: 400, y: 300, kind: "urnLarge" },
        { x: 90, y: 520, kind: "goldCoins" },
        { x: 710, y: 520, kind: "goldCoins" },
    ],
        doors: ["E", "W", "S"],
        tags: ["normal", "treasure"],
    }),
    1.2,
    1
);

export const Room_Cistern: RoomTemplate = scaleRoom(
    withPillarWallClearance({
    ...roomDefaults,
    id: "new_cistern",
    walls: [
        { x: 120, y: 160, width: 560, height: 40 },
        { x: 120, y: 400, width: 180, height: 40 },
        { x: 500, y: 400, width: 180, height: 40 },
        { x: 300, y: 200, width: 40, height: 200 },
        { x: 460, y: 200, width: 40, height: 200 },
    ],
    pillars: [
        { x: 70, y: 100, variant: 0 },
        { x: 700, y: 100, variant: 1 },
        { x: 70, y: 450, variant: 2 },
        { x: 700, y: 450, variant: 3 },
    ],
    chestSpots: [
        { x: 220, y: 280 },
        { x: 580, y: 280 },
    ],
    // One pool fills the whole central chamber (instead of scattered
    // moss/drain decals) so the water reads as one cohesive feature, crossed
    // by a bridge where the room's N/S path goes.
    waterRegions: [{ x: 340, y: 200, width: 120, height: 220 }],
    decorations: [
        { x: 400, y: 300, kind: "woodBridge", scale: 1.5 },
        { x: 400, y: 460, kind: "waterMoss" },
        { x: 220, y: 150, kind: "urnSmall" },
        { x: 580, y: 150, kind: "urnSmall" },
    ],
        doors: ["N", "S", "E", "W"],
        tags: ["combat", "normal"],
    }),
    1,
    1.2
);

export const Room_Throne: RoomTemplate = scaleRoom(
    withPillarWallClearance({
    ...roomDefaults,
    id: "new_throne",
    walls: [
        { x: 120, y: 120, width: 160, height: 40 },
        { x: 520, y: 120, width: 160, height: 40 },
        { x: 120, y: 440, width: 560, height: 40 },
        { x: 120, y: 160, width: 40, height: 280 },
        { x: 640, y: 160, width: 40, height: 280 },
    ],
    pillars: [
        { x: 70, y: 70, variant: 0 },
        { x: 700, y: 70, variant: 1 },
        { x: 70, y: 490, variant: 2 },
        { x: 700, y: 490, variant: 3 },
        { x: 260, y: 260, variant: 0 },
        { x: 540, y: 260, variant: 1 },
    ],
    chestSpots: [{ x: 400, y: 260 }],
    decorations: [
        { x: 400, y: 380, kind: "goldPile" },
        { x: 240, y: 400, kind: "candelabra" },
        { x: 560, y: 400, kind: "candelabra" },
        { x: 70, y: 70, kind: "urnLarge" },
        { x: 700, y: 70, kind: "urnLarge" },
    ],
        doors: ["N", "W"],
        tags: ["boss", "combat"],
    }),
    1.25,
    1.2
);

const Room_EntranceCorner: RoomTemplate = {
    ...Room_Entrance,
    id: "new_corner_nw",
    doors: ["E", "S"],
};

const Room_GalleryCorner: RoomTemplate = {
    ...Room_Gallery,
    id: "new_corner_ne",
    doors: ["S", "W"],
};

const Room_CisternCorner: RoomTemplate = {
    ...Room_Cistern,
    id: "new_corner_sw",
    doors: ["N", "E"],
};

const Room_ThroneCorner: RoomTemplate = {
    ...Room_Throne,
    id: "new_corner_se",
    doors: ["N", "W"],
};

const Room_EntranceSide: RoomTemplate = {
    ...Room_Entrance,
    id: "new_side_west",
    doors: ["N", "S", "E"],
};

const DOOR_PATTERNS: Direction[][] = [
    [],
    ["N"],
    ["S"],
    ["E"],
    ["W"],
    ["N", "S"],
    ["E", "W"],
    ["N", "E"],
    ["N", "W"],
    ["S", "E"],
    ["S", "W"],
    ["N", "S", "E"],
    ["N", "S", "W"],
    ["N", "E", "W"],
    ["S", "E", "W"],
    ["N", "S", "E", "W"],
];

const Room_DoorPatternVariants: RoomTemplate[] = DOOR_PATTERNS.map((doors, index) => ({
    ...Room_Cistern,
    id: `new_pattern_${index}`,
    doors,
    tags: ["normal", "dynamic"],
}));

export const NEW_ROOM_TEMPLATES: RoomTemplate[] = [
    Room_Entrance,
    Room_Barracks,
    Room_Gallery,
    Room_Cistern,
    Room_Throne,
    Room_EntranceCorner,
    Room_GalleryCorner,
    Room_CisternCorner,
    Room_ThroneCorner,
    Room_EntranceSide,
    ...Room_DoorPatternVariants,
];
