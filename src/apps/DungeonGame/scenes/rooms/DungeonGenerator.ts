import {
  Direction,
  OPPOSITE_DIRECTION,
  RoomTemplate,
} from "../RoomTemplate";

import {
  DungeonLayout,
  DungeonRoom,
} from "../../types/DungeonLayout";

export interface DungeonGeneratorOptions {
  cols: number;
  rows: number;
  templates: RoomTemplate[];
}

export class DungeonGenerator {
  static generate(
    options: DungeonGeneratorOptions,
  ): DungeonLayout {
    const {
      cols,
      rows,
      templates,
    } = options;

    if (cols <= 0 || rows <= 0) {
      throw new Error(
        `Invalid dungeon size: ${cols}x${rows}`,
      );
    }

    if (templates.length === 0) {
      throw new Error(
        "DungeonGenerator: no room templates were supplied.",
      );
    }

    const rooms: DungeonRoom[] = [];

    const success = this.fill(
      rooms,
      cols,
      rows,
      templates,
    );

    if (!success) {
      this.printGenerationDiagnostics(
        cols,
        rows,
        templates,
      );

      throw new Error(
        `Could not generate a valid dungeon layout for ${cols}x${rows}. ` +
        `Check your room door combinations and tag constraints.`,
      );
    }

    return {
      cols,
      rows,
      rooms,
    };
  }

  // ---------------------------------------------------------------------------
  // BACKTRACKING
  // ---------------------------------------------------------------------------

  private static fill(
    rooms: DungeonRoom[],
    cols: number,
    rows: number,
    templates: RoomTemplate[],
  ): boolean {
    if (rooms.length >= cols * rows) {
      return true;
    }

    const index = rooms.length;

    const gridX = index % cols;
    const gridY = Math.floor(index / cols);

    const candidates = templates
      .filter((template) =>
        this.canPlace(
          template,
          gridX,
          gridY,
          rooms,
          cols,
          rows,
        ),
      )
      .sort(() => Math.random() - 0.5);

    for (const template of candidates) {
      const room: DungeonRoom = {
        template,
        gridX,
        gridY,
      };

      rooms.push(room);

      if (
        this.fill(
          rooms,
          cols,
          rows,
          templates,
        )
      ) {
        return true;
      }

      // Backtrack.
      rooms.pop();
    }

    return false;
  }

  // ---------------------------------------------------------------------------
  // PLACEMENT VALIDATION
  // ---------------------------------------------------------------------------

  private static canPlace(
    template: RoomTemplate,
    gridX: number,
    gridY: number,
    rooms: DungeonRoom[],
    cols: number,
    rows: number,
  ): boolean {
    const doors = template.doors ?? [];

    // -------------------------------------------------------------------------
    // OUTER BOUNDARIES
    //
    // A room cannot have a door pointing outside the dungeon.
    // -------------------------------------------------------------------------

    if (
      gridY === 0 &&
      doors.includes("N")
    ) {
      return false;
    }

    if (
      gridY === rows - 1 &&
      doors.includes("S")
    ) {
      return false;
    }

    if (
      gridX === 0 &&
      doors.includes("W")
    ) {
      return false;
    }

    if (
      gridX === cols - 1 &&
      doors.includes("E")
    ) {
      return false;
    }

    // -------------------------------------------------------------------------
    // NORTH NEIGHBOR
    // -------------------------------------------------------------------------

    const north = this.getRoomAt(
      rooms,
      gridX,
      gridY - 1,
    );

    if (north) {
      if (
        !this.sidesMatch(
          template,
          "N",
          north.template,
        )
      ) {
        return false;
      }

      if (
        !this.areRoomsCompatible(
          template,
          north.template,
        )
      ) {
        return false;
      }
    }

    // -------------------------------------------------------------------------
    // WEST NEIGHBOR
    // -------------------------------------------------------------------------

    const west = this.getRoomAt(
      rooms,
      gridX - 1,
      gridY,
    );

    if (west) {
      if (
        !this.sidesMatch(
          template,
          "W",
          west.template,
        )
      ) {
        return false;
      }

      if (
        !this.areRoomsCompatible(
          template,
          west.template,
        )
      ) {
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
    direction: Direction,
    neighbor: RoomTemplate,
  ): boolean {
    const roomHasDoor =
      room.doors?.includes(direction) ?? false;

    const opposite =
      OPPOSITE_DIRECTION[direction];

    const neighborHasDoor =
      neighbor.doors?.includes(opposite) ?? false;

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

  // ---------------------------------------------------------------------------
  // TAG COMPATIBILITY
  // ---------------------------------------------------------------------------

  private static areRoomsCompatible(
    a: RoomTemplate,
    b: RoomTemplate,
  ): boolean {
    const aTags = a.tags ?? [];
    const bTags = b.tags ?? [];

    const aExcludes = a.excludesTags ?? [];
    const bExcludes = b.excludesTags ?? [];

    // A excludes something B has.
    if (
      aExcludes.some((tag) =>
        bTags.includes(tag),
      )
    ) {
      return false;
    }

    // B excludes something A has.
    if (
      bExcludes.some((tag) =>
        aTags.includes(tag),
      )
    ) {
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
    gridY: number,
  ): DungeonRoom | undefined {
    return rooms.find(
      (room) =>
        room.gridX === gridX &&
        room.gridY === gridY,
    );
  }

  // ---------------------------------------------------------------------------
  // DEBUGGING
  // ---------------------------------------------------------------------------

  private static printGenerationDiagnostics(
    cols: number,
    rows: number,
    templates: RoomTemplate[],
  ): void {
    console.group(
      "DungeonGenerator: generation failed",
    );

    console.log(
      `Dungeon size: ${cols}x${rows}`,
    );

    console.log(
      "Available templates:",
    );

    console.table(
      templates.map((template) => ({
        id: template.id,

        doors:
          template.doors?.join(",") ?? "",

        tags:
          template.tags?.join(",") ?? "",

        requires:
          template.requiresTags?.join(",") ?? "",

        excludes:
          template.excludesTags?.join(",") ?? "",
      })),
    );

    console.log(
      "Valid templates for each grid position:",
    );

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const validTemplates =
          templates.filter((template) =>
            this.canPlace(
              template,
              x,
              y,
              [],
              cols,
              rows,
            ),
          );

        console.log(
          `Cell (${x}, ${y}):`,
          validTemplates.map(
            (template) => template.id,
          ),
        );
      }
    }

    console.groupEnd();
  }
}
