import { RoomTemplate } from "../RoomTemplate";
import {
    NEW_ROOM_TEMPLATES,
    Room_Barracks,
    Room_Cistern,
    Room_Entrance,
    Room_Gallery,
    Room_Throne,
} from "./NewRooms";
import { CORRIDOR_TEMPLATES } from "./Corridors";
import { EXTRA_ROOM_TEMPLATES } from "./ExtraRooms";

const isPlaceable = (template: RoomTemplate): boolean => template.doors.length > 0;

export const ROOM_TEMPLATES: RoomTemplate[] = [
    ...NEW_ROOM_TEMPLATES,
    ...CORRIDOR_TEMPLATES,
    ...EXTRA_ROOM_TEMPLATES,
].filter(isPlaceable);

export const DUNGEON_SEQUENCE: RoomTemplate[] = [
    Room_Entrance,
    Room_Barracks,
    Room_Gallery,
    Room_Cistern,
    Room_Throne,
];
