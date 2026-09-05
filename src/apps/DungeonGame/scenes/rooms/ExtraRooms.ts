import { Direction, RoomDecoration, RoomPillar, RoomTemplate, RoomWall } from "../RoomTemplate";

const CELL = { width: 800, height: 600, wallThickness: 40, doorWidth: 120 };

/** A light, tag-appropriate default so every room gets *some* clutter even
 *  without a bespoke layout — placed in the open lane between the corner
 *  wall clusters so it stays clear of braces()/pilasters(). */
const autoDecor = (tags: string[]): RoomDecoration[] => {
    const kind = tags.includes("treasure")
        ? "goldCoins"
        : tags.includes("combat")
        ? "crate"
        : "urnSmall";

    return [
        { x: 400, y: 110, kind },
        { x: 400, y: 490, kind },
    ];
};

const room = (
    id: string,
    doors: Direction[],
    tags: string[],
    walls: RoomWall[],
    pillars: RoomPillar[],
    chestSpots: { x: number; y: number }[],
    decorations: RoomDecoration[] = autoDecor(tags)
): RoomTemplate => ({ ...CELL, id, doors, tags, walls, pillars, chestSpots, decorations });

/** Uniformly resizes a finished room so it can feel grander or cozier than
 *  the 800×600 baseline — see the matching helper in NewRooms.ts. */
const scale = (template: RoomTemplate, factorX: number, factorY: number): RoomTemplate => ({
    ...template,
    width: Math.round(template.width * factorX),
    height: Math.round(template.height * factorY),
    walls: template.walls.map((wall) => ({
        x: Math.round(wall.x * factorX),
        y: Math.round(wall.y * factorY),
        width: Math.round(wall.width * factorX),
        height: Math.round(wall.height * factorY),
    })),
    pillars: template.pillars.map((pillar) => ({
        ...pillar,
        x: Math.round(pillar.x * factorX),
        y: Math.round(pillar.y * factorY),
    })),
    chestSpots: template.chestSpots.map((chest) => ({
        x: Math.round(chest.x * factorX),
        y: Math.round(chest.y * factorY),
    })),
    decorations: (template.decorations ?? []).map((decoration) => ({
        ...decoration,
        x: Math.round(decoration.x * factorX),
        y: Math.round(decoration.y * factorY),
    })),
});

// ---- reusable, always-safe decoration -------------------------------------

const CORNERS: RoomPillar[] = [
    { x: 80, y: 80, variant: 0 },
    { x: 688, y: 80, variant: 1 },
    { x: 80, y: 472, variant: 2 },
    { x: 688, y: 472, variant: 3 },
];

const INNER: RoomPillar[] = [
    { x: 250, y: 150, variant: 1 },
    { x: 518, y: 150, variant: 2 },
    { x: 250, y: 402, variant: 3 },
    { x: 518, y: 402, variant: 0 },
];

const braces = (): RoomWall[] => [
    { x: 120, y: 120, width: 130, height: 40 },
    { x: 550, y: 120, width: 130, height: 40 },
    { x: 120, y: 440, width: 130, height: 40 },
    { x: 550, y: 440, width: 130, height: 40 },
];

const pilasters = (): RoomWall[] => [
    { x: 140, y: 100, width: 40, height: 110 },
    { x: 620, y: 100, width: 40, height: 110 },
    { x: 140, y: 390, width: 40, height: 110 },
    { x: 620, y: 390, width: 40, height: 110 },
];

// The 20 rooms 

export const EXTRA_ROOM_TEMPLATES: RoomTemplate[] = [
    // 1-2  straight halls (chests tucked into the two unused arms)
    room("room_nave_ns", ["N", "S"], ["normal"], braces(), [...CORNERS, ...INNER], [
        { x: 152, y: 276 },
        { x: 600, y: 276 },
    ]),
    room("room_colonnade_ew", ["E", "W"], ["normal"], pilasters(), [...CORNERS, ...INNER], [
        { x: 376, y: 120 },
        { x: 376, y: 432 },
    ]),

    // 3-6  elbows / bends
    room("room_bend_ne", ["N", "E"], ["normal"], braces(), CORNERS, [
        { x: 376, y: 432 },
        { x: 152, y: 276 },
    ]),
    room("room_bend_nw", ["N", "W"], ["normal"], braces(), CORNERS, [
        { x: 376, y: 432 },
        { x: 600, y: 276 },
    ]),
    room("room_bend_se", ["S", "E"], ["normal"], braces(), CORNERS, [
        { x: 376, y: 120 },
        { x: 152, y: 276 },
    ]),
    room("room_bend_sw", ["S", "W"], ["normal"], braces(), CORNERS, [
        { x: 376, y: 120 },
        { x: 600, y: 276 },
    ]),

    // 7-10  tee junctions
    room("room_tee_nse", ["N", "S", "E"], ["combat"], pilasters(), [...CORNERS, ...INNER], [
        { x: 152, y: 276 },
    ]),
    room("room_tee_nsw", ["N", "S", "W"], ["combat"], pilasters(), [...CORNERS, ...INNER], [
        { x: 600, y: 276 },
    ]),
    room("room_tee_new", ["N", "E", "W"], ["combat"], braces(), [...CORNERS, ...INNER], [
        { x: 376, y: 432 },
    ]),
    room("room_tee_sew", ["S", "E", "W"], ["combat"], braces(), [...CORNERS, ...INNER], [
        { x: 376, y: 120 },
    ]),

    // 11  four-way crossing
    room("room_crossing", ["N", "S", "E", "W"], ["combat"], braces(), [...CORNERS, ...INNER], [
        { x: 200, y: 150 },
        { x: 600, y: 430 },
    ]),

    // 12-13  dense colonnades — a bit wider than a normal cell, for grandeur
    scale(
        room(
        "room_hypostyle_ew",
        ["E", "W"],
        ["normal", "treasure"],
        [],
        [
            ...CORNERS,
            ...INNER,
            { x: 376, y: 120, variant: 0 },
            { x: 376, y: 432, variant: 1 },
        ],
        [
            { x: 200, y: 150 },
            { x: 600, y: 150 },
        ],
        [
            { x: 376, y: 90, kind: "candelabra" },
            { x: 376, y: 462, kind: "candelabra" },
            { x: 100, y: 300, kind: "goldPile" },
            { x: 676, y: 300, kind: "goldPile" },
        ]
        ),
        1.2,
        1
    ),
    scale(
        room(
        "room_processional_ns",
        ["N", "S"],
        ["normal", "treasure"],
        [],
        [
            ...CORNERS,
            { x: 180, y: 150, variant: 1 },
            { x: 180, y: 300, variant: 2 },
            { x: 180, y: 450, variant: 3 },
            { x: 620, y: 150, variant: 1 },
            { x: 620, y: 300, variant: 2 },
            { x: 620, y: 450, variant: 3 },
        ],
        [
            { x: 250, y: 150 },
            { x: 548, y: 150 },
        ],
        [
            { x: 400, y: 150, kind: "candelabra" },
            { x: 400, y: 300, kind: "rubble" },
            { x: 400, y: 450, kind: "candelabra" },
        ]
        ),
        1.2,
        1
    ),

    // 14  reliquary — shelves across the (unused) south edge
    room(
        "room_reliquary_new",
        ["N", "E", "W"],
        ["treasure"],
        [
            { x: 120, y: 440, width: 120, height: 40 },
            { x: 340, y: 440, width: 120, height: 40 },
            { x: 560, y: 440, width: 120, height: 40 },
        ],
        CORNERS,
        [
            { x: 170, y: 400 },
            { x: 376, y: 400 },
            { x: 600, y: 400 },
        ],
        [
            { x: 290, y: 460, kind: "urnSmall" },
            { x: 510, y: 460, kind: "urnSmall" },
            { x: 400, y: 100, kind: "candelabra" },
        ]
    ),

    // 15  boss arena — a full size larger, the grandest room in the dungeon
    scale(
        room(
        "room_arena",
        ["N", "S", "E", "W"],
        ["combat", "boss"],
        braces(),
        [...CORNERS, ...INNER],
        [
            { x: 200, y: 150 },
            { x: 600, y: 150 },
            { x: 200, y: 430 },
            { x: 600, y: 430 },
        ],
        [
            { x: 400, y: 110, kind: "candelabra" },
            { x: 400, y: 490, kind: "candelabra" },
            { x: 100, y: 300, kind: "crate" },
            { x: 700, y: 300, kind: "crate" },
        ]
        ),
        1.2,
        1.2
    ),

    // 16-18  dead-end treasure vaults (single door) — smaller, cozier rooms
    scale(
        room(
        "room_vault_n",
        ["N"],
        ["treasure", "vault"],
        [
            { x: 120, y: 300, width: 180, height: 40 },
            { x: 500, y: 300, width: 180, height: 40 },
            { x: 120, y: 440, width: 130, height: 40 },
            { x: 340, y: 440, width: 120, height: 40 },
            { x: 550, y: 440, width: 130, height: 40 },
        ],
        CORNERS,
        [
            { x: 160, y: 250 },
            { x: 600, y: 250 },
            { x: 170, y: 390 },
            { x: 600, y: 390 },
        ],
        [
            { x: 400, y: 230, kind: "goldPile" },
            { x: 200, y: 180, kind: "urnLarge" },
            { x: 600, y: 180, kind: "urnLarge" },
        ]
        ),
        0.8,
        0.8
    ),
    scale(
        room(
        "room_vault_s",
        ["S"],
        ["treasure", "vault"],
        [
            { x: 120, y: 260, width: 180, height: 40 },
            { x: 500, y: 260, width: 180, height: 40 },
            { x: 120, y: 120, width: 130, height: 40 },
            { x: 340, y: 120, width: 120, height: 40 },
            { x: 550, y: 120, width: 130, height: 40 },
        ],
        CORNERS,
        [
            { x: 160, y: 200 },
            { x: 600, y: 200 },
            { x: 170, y: 330 },
            { x: 600, y: 330 },
        ],
        [
            { x: 400, y: 450, kind: "goldPile" },
            { x: 200, y: 500, kind: "urnLarge" },
            { x: 600, y: 500, kind: "urnLarge" },
        ]
        ),
        0.8,
        0.8
    ),
    scale(
        room(
        "room_vault_e",
        ["E"],
        ["treasure", "vault"],
        [
            { x: 120, y: 120, width: 130, height: 40 },
            { x: 120, y: 440, width: 130, height: 40 },
            { x: 120, y: 250, width: 40, height: 100 },
        ],
        CORNERS,
        [
            { x: 200, y: 160 },
            { x: 210, y: 300 },
            { x: 376, y: 120 },
            { x: 376, y: 452 },
        ],
        [
            { x: 550, y: 300, kind: "goldPile" },
            { x: 550, y: 150, kind: "urnLarge" },
            { x: 550, y: 450, kind: "urnLarge" },
        ]
        ),
        0.8,
        0.8
    ),

    // 19  garrison — cover along the (unused) north edge
    room(
        "room_garrison_sew",
        ["S", "E", "W"],
        ["combat"],
        [
            { x: 120, y: 120, width: 130, height: 40 },
            { x: 340, y: 120, width: 120, height: 40 },
            { x: 550, y: 120, width: 130, height: 40 },
            { x: 140, y: 390, width: 40, height: 110 },
            { x: 620, y: 390, width: 40, height: 110 },
        ],
        [...CORNERS, ...INNER],
        [
            { x: 200, y: 150 },
            { x: 600, y: 150 },
        ],
        [
            { x: 400, y: 90, kind: "grillWindow", scale: 1.5 },
            { x: 150, y: 520, kind: "crate" },
            { x: 650, y: 520, kind: "crate" },
        ]
    ),

    // 20  shrine — four corner offerings, slightly larger than a normal cell
    scale(
        room(
        "room_shrine",
        ["N", "S", "E", "W"],
        ["normal", "treasure"],
        braces(),
        [...CORNERS, ...INNER],
        [
            { x: 200, y: 150 },
            { x: 600, y: 150 },
            { x: 200, y: 430 },
            { x: 600, y: 430 },
        ],
        [
            { x: 230, y: 180, kind: "candelabra" },
            { x: 570, y: 180, kind: "candelabra" },
            { x: 230, y: 400, kind: "goldCoins" },
            { x: 570, y: 400, kind: "goldCoins" },
            { x: 400, y: 300, kind: "urnLarge" },
        ]
        ),
        1.15,
        1.15
    ),
];
