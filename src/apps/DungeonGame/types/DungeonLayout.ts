import { RoomTemplate } from "../scenes/RoomTemplate";

export interface DungeonRoom {
  template: RoomTemplate;
  gridX: number;
  gridY: number;
}

export interface DungeonLayout {
  cols: number;
  rows: number;
  rooms: DungeonRoom[];
}
