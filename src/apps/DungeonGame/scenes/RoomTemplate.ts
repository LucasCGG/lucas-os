export type Direction = "N" | "S" | "E" | "W";

export const OPPOSITE_DIRECTION: Record<
  Direction,
  Direction
> = {
  N: "S",
  S: "N",
  E: "W",
  W: "E",
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

export interface RoomTemplate {
  id: string;

  width: number;
  height: number;

  wallThickness: number;
  doorWidth: number;

  walls: RoomWall[];
  pillars: RoomPillar[];
  chestSpots: RoomChestSpot[];

  doors: Direction[];

  tags: string[];
  requiresTags?: string[];
  excludesTags?: string[];
}
