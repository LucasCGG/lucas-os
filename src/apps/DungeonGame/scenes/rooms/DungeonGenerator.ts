import {
    Direction,
    OPPOSITE_DIRECTION,
    RoomRotation,
    RoomTemplate,
    rotateDirection,
} from "../RoomTemplate";

import { DungeonLayout, DungeonRoom } from "../../types/DungeonLayout";

export interface DungeonGeneratorOptions {
    cols: number;
    rows: number;
    templates: RoomTemplate[];
    sequence?: RoomTemplate[];
}

export class DungeonGenerator {
    static generate(options: DungeonGeneratorOptions): DungeonLayout {
        const { cols, rows, templates, sequence } = options;

        if (cols <= 0 || rows <= 0) {
            throw new Error(`Invalid dungeon size: ${cols}x${rows}`);
        }

        if (templates.length === 0) {
            throw new Error("DungeonGenerator: no room templates were supplied.");
        }

        if (sequence !== undefined) {
            return this.generateSequence(sequence);
        }

        const rooms: DungeonRoom[] = [];

        const requiredDoors = this.buildRequiredDoors(cols, rows);

        const success = this.fill(rooms, cols, rows, this.expandWeighted(templates), requiredDoors);

        if (!success) {
            this.printGenerationDiagnostics(cols, rows, templates);

            throw new Error(
                `Could not generate a valid dungeon layout for ${cols}x${rows}. ` +
                    `Check your room door combinations and tag constraints.`
            );
        }

        // Sized off the rooms that actually got placed, not every candidate
        // template — one rarely-picked oversized template (a "grand" corridor,
        // say) shouldn't force every cell in the grid to be that big.
        return {
            cols,
            rows,
            rooms,
            cellWidth: Math.max(...rooms.map((room) => room.template.width)),
            cellHeight: Math.max(...rooms.map((room) => room.template.height)),
        };
    }

    /**
     * Places an explicitly ordered run of rooms and corridors in a single row.
     * Unlike the grid generator, this has no fixed piece count.
     */
    private static generateSequence(sequence: RoomTemplate[]): DungeonLayout {
        if (sequence.length === 0) {
            throw new Error("DungeonGenerator: the room sequence cannot be empty.");
        }

        for (let index = 1; index < sequence.length; index++) {
            const previous = sequence[index - 1];
            const current = sequence[index];

            if (
                !(previous.doors?.includes("E") ?? false) ||
                !(current.doors?.includes("W") ?? false)
            ) {
                throw new Error(
                    `DungeonGenerator: sequence pieces "${previous.id}" and ` +
                        `"${current.id}" must have matching E/W doors.`
                );
            }
        }

        let originX = 0;

        const rooms = sequence.map((template, gridX) => {
            const room: DungeonRoom = {
                template,
                gridX,
                gridY: 0,
                originX,
                originY: 0,
            };

            originX += template.width;
            return room;
        });

        return {
            cols: sequence.length,
            rows: 1,
            rooms,
        };
    }

    /**
     * Repeats each template proportionally to its `weight` so higher-weight
     * templates (typically corridors) are more likely to be picked by the
     * random shuffle in `fill()`.
     */
    private static expandWeighted(templates: RoomTemplate[]): RoomTemplate[] {
        return templates.flatMap((template) =>
            Array(Math.max(1, Math.round(template.weight ?? 1))).fill(template)
        );
    }

    // ---------------------------------------------------------------------------
    // CONNECTIVITY PLANNING
    // ---------------------------------------------------------------------------

    /**
     * Picks a random spanning tree over the grid (plus a few extra loop
     * edges) up front, and returns, per cell, the directions a room placed
     * there *must* open a door towards. Guaranteeing connectivity this way —
     * instead of only checking it once the whole grid is filled — means
     * `fill()` never has to discover a fully-built-but-disconnected layout
     * and unwind most of the grid to fix it. That "backtrack from the last
     * cell" pattern is combinatorially explosive on a 12-cell grid with a
     * large template pool, and was observed taking 60+ seconds on an unlucky
     * shuffle before this existed.
     */
    private static buildRequiredDoors(cols: number, rows: number): Map<string, Set<Direction>> {
        const index = (x: number, y: number): number => y * cols + x;

        const parent = Array.from({ length: cols * rows }, (_, i) => i);

        const find = (i: number): number => {
            while (parent[i] !== i) {
                parent[i] = parent[parent[i]];
                i = parent[i];
            }

            return i;
        };

        const union = (a: number, b: number): boolean => {
            const rootA = find(a);
            const rootB = find(b);

            if (rootA === rootB) {
                return false;
            }

            parent[rootA] = rootB;

            return true;
        };

        interface GridEdge {
            ax: number;
            ay: number;
            bx: number;
            by: number;
        }

        const edges: GridEdge[] = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (x + 1 < cols) {
                    edges.push({ ax: x, ay: y, bx: x + 1, by: y });
                }

                if (y + 1 < rows) {
                    edges.push({ ax: x, ay: y, bx: x, by: y + 1 });
                }
            }
        }

        edges.sort(() => Math.random() - 0.5);

        const required = new Map<string, Set<Direction>>();

        const addRequired = (x: number, y: number, direction: Direction): void => {
            const key = `${x},${y}`;

            if (!required.has(key)) {
                required.set(key, new Set());
            }

            required.get(key)!.add(direction);
        };

        const connect = (edge: GridEdge): void => {
            const direction: Direction =
                edge.bx > edge.ax ? "E" : edge.bx < edge.ax ? "W" : edge.by > edge.ay ? "S" : "N";

            addRequired(edge.ax, edge.ay, direction);
            addRequired(edge.bx, edge.by, OPPOSITE_DIRECTION[direction]);
        };

        // Randomized Kruskal's — guarantees every cell ends up reachable.
        for (const edge of edges) {
            if (union(index(edge.ax, edge.ay), index(edge.bx, edge.by))) {
                connect(edge);
            }
        }

        // A handful of extra edges so the layout isn't a pure loop-free maze.
        const EXTRA_EDGE_CHANCE = 0.15;

        for (const edge of edges) {
            if (Math.random() < EXTRA_EDGE_CHANCE) {
                connect(edge);
            }
        }

        return required;
    }

    private static hasRequiredDoors(
        template: RoomTemplate,
        rotation: RoomRotation,
        required: Set<Direction> | undefined
    ): boolean {
        if (required === undefined) {
            return true;
        }

        const doors = this.rotatedDoors(template, rotation);

        for (const direction of required) {
            if (!doors.includes(direction)) {
                return false;
            }
        }

        return true;
    }

    // ---------------------------------------------------------------------------
    // BACKTRACKING
    // ---------------------------------------------------------------------------

    private static fill(
        rooms: DungeonRoom[],
        cols: number,
        rows: number,
        templates: RoomTemplate[],
        requiredDoors: Map<string, Set<Direction>>
    ): boolean {
        if (rooms.length >= cols * rows) {
            return this.isConnected(rooms);
        }

        const index = rooms.length;

        const gridX = index % cols;
        const gridY = Math.floor(index / cols);

        const required = requiredDoors.get(`${gridX},${gridY}`);

        const candidates = templates
            .map((template) => ({
                template,
                rotation: 0 as RoomRotation,
            }))
            .filter(
                ({ template, rotation }) =>
                    this.canPlace(template, rotation, gridX, gridY, rooms, cols, rows) &&
                    this.hasRequiredDoors(template, rotation, required)
            )
            .sort(() => Math.random() - 0.5);

        for (const { template, rotation } of candidates) {
            const room: DungeonRoom = {
                template,
                gridX,
                gridY,
                rotation,
            };

            rooms.push(room);

            if (this.fill(rooms, cols, rows, templates, requiredDoors)) {
                return true;
            }

            // Backtrack.
            rooms.pop();
        }

        return false;
    }

    private static isConnected(rooms: DungeonRoom[]): boolean {
        if (rooms.length === 0) {
            return false;
        }

        const visited = new Set<string>();
        const pending: DungeonRoom[] = [rooms[0]];

        while (pending.length > 0) {
            const room = pending.pop();

            if (room === undefined) {
                continue;
            }

            const key = `${room.gridX},${room.gridY}`;

            if (visited.has(key)) {
                continue;
            }

            visited.add(key);

            for (const direction of ["N", "S", "E", "W"] as Direction[]) {
                if (!this.roomHasDoor(room, direction)) {
                    continue;
                }

                const neighbour = rooms.find(
                    (candidate) =>
                        candidate.gridX ===
                            room.gridX + (direction === "E" ? 1 : direction === "W" ? -1 : 0) &&
                        candidate.gridY ===
                            room.gridY + (direction === "S" ? 1 : direction === "N" ? -1 : 0)
                );

                if (
                    neighbour !== undefined &&
                    this.roomHasDoor(neighbour, OPPOSITE_DIRECTION[direction])
                ) {
                    pending.push(neighbour);
                }
            }
        }

        return visited.size === rooms.length;
    }

    private static roomHasDoor(room: DungeonRoom, direction: Direction): boolean {
        return this.rotatedDoors(room.template, room.rotation ?? 0).includes(direction);
    }

    // ---------------------------------------------------------------------------
    // PLACEMENT VALIDATION
    // ---------------------------------------------------------------------------

    private static canPlace(
        template: RoomTemplate,
        rotation: RoomRotation,
        gridX: number,
        gridY: number,
        rooms: DungeonRoom[],
        cols: number,
        rows: number
    ): boolean {
        const doors = this.rotatedDoors(template, rotation);

        // -------------------------------------------------------------------------
        // OUTER BOUNDARIES
        //
        // A room cannot have a door pointing outside the dungeon.
        // -------------------------------------------------------------------------

        if (gridY === 0 && doors.includes("N")) {
            return false;
        }

        if (gridY === rows - 1 && doors.includes("S")) {
            return false;
        }

        if (gridX === 0 && doors.includes("W")) {
            return false;
        }

        if (gridX === cols - 1 && doors.includes("E")) {
            return false;
        }

        // -------------------------------------------------------------------------
        // NORTH NEIGHBOR
        // -------------------------------------------------------------------------

        const north = this.getRoomAt(rooms, gridX, gridY - 1);

        if (north) {
            if (!this.sidesMatch(template, rotation, "N", north)) {
                return false;
            }

            if (!this.areRoomsCompatible(template, north.template)) {
                return false;
            }
        }

        // -------------------------------------------------------------------------
        // WEST NEIGHBOR
        // -------------------------------------------------------------------------

        const west = this.getRoomAt(rooms, gridX - 1, gridY);

        if (west) {
            if (!this.sidesMatch(template, rotation, "W", west)) {
                return false;
            }

            if (!this.areRoomsCompatible(template, west.template)) {
                return false;
            }
        }

        return true;
    }

    // ---------------------------------------------------------------------------
    // DOOR MATCHING
    // ---------------------------------------------------------------------------

    private static sidesMatch(
        room: RoomTemplate,
        rotation: RoomRotation,
        direction: Direction,
        neighbor: DungeonRoom
    ): boolean {
        const roomHasDoor = this.rotatedDoors(room, rotation).includes(direction);

        const opposite = OPPOSITE_DIRECTION[direction];

        const neighborHasDoor = this.rotatedDoors(
            neighbor.template,
            neighbor.rotation ?? 0
        ).includes(opposite);

        /*
         * Both sides must agree.
         *
         * Example:
         *
         * Room A E = true
         * Room B W = true
         *
         * => connected
         *
         * Room A E = false
         * Room B W = false
         *
         * => solid wall between rooms
         *
         * Room A E = true
         * Room B W = false
         *
         * => invalid
         */

        return roomHasDoor === neighborHasDoor;
    }

    private static rotatedDoors(template: RoomTemplate, rotation: RoomRotation): Direction[] {
        return (template.doors ?? []).map((direction) => rotateDirection(direction, rotation));
    }

    // ---------------------------------------------------------------------------
    // TAG COMPATIBILITY
    // ---------------------------------------------------------------------------

    private static areRoomsCompatible(a: RoomTemplate, b: RoomTemplate): boolean {
        const aTags = a.tags ?? [];
        const bTags = b.tags ?? [];

        const aExcludes = a.excludesTags ?? [];
        const bExcludes = b.excludesTags ?? [];

        // A excludes something B has.
        if (aExcludes.some((tag) => bTags.includes(tag))) {
            return false;
        }

        // B excludes something A has.
        if (bExcludes.some((tag) => aTags.includes(tag))) {
            return false;
        }

        return true;
    }

    // ---------------------------------------------------------------------------
    // ROOM LOOKUP
    // ---------------------------------------------------------------------------

    private static getRoomAt(
        rooms: DungeonRoom[],
        gridX: number,
        gridY: number
    ): DungeonRoom | undefined {
        return rooms.find((room) => room.gridX === gridX && room.gridY === gridY);
    }

    // ---------------------------------------------------------------------------
    // DEBUGGING
    // ---------------------------------------------------------------------------

    private static printGenerationDiagnostics(
        cols: number,
        rows: number,
        templates: RoomTemplate[]
    ): void {
        console.group("DungeonGenerator: generation failed");

        console.log(`Dungeon size: ${cols}x${rows}`);

        console.log("Available templates:");

        console.table(
            templates.map((template) => ({
                id: template.id,

                doors: template.doors?.join(",") ?? "",

                tags: template.tags?.join(",") ?? "",

                requires: template.requiresTags?.join(",") ?? "",

                excludes: template.excludesTags?.join(",") ?? "",
            }))
        );

        console.log("Valid templates for each grid position:");

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const validTemplates = templates.filter((template) =>
                    this.canPlace(template, 0, x, y, [], cols, rows)
                );

                console.log(
                    `Cell (${x}, ${y}):`,
                    validTemplates.map((template) => template.id)
                );
            }
        }

        console.groupEnd();
    }
}
