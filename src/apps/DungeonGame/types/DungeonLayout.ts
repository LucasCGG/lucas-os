import { RoomRotation, RoomTemplate } from "../scenes/RoomTemplate";

export interface DungeonRoom {
    template: RoomTemplate;
    gridX: number;
    gridY: number;
    originX?: number;
    originY?: number;
    rotation?: RoomRotation;
}

export interface DungeonLayout {
    cols: number;
    rows: number;
    rooms: DungeonRoom[];
    cellWidth?: number;
    cellHeight?: number;
}
