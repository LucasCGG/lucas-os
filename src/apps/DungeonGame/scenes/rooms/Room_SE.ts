import { RoomTemplate } from "../RoomTemplate";

export const Room_SE: RoomTemplate = {
  id: "room_new",

  width: 800,
  height: 600,

  wallThickness: 40,
  doorWidth: 120,

  walls: [
    { x: 100, y: 280, width: 300, height: 40 },
    { x: 400, y: 280, width: 300, height: 40 },
    { x: 380, y: 100, width: 40, height: 180 },
    { x: 380, y: 320, width: 40, height: 180 },
    { x: 140, y: 60, width: 140, height: 40 },
  ],

  pillars: [
    { x: 260, y: 200, variant: 0 },
    { x: 480, y: 200, variant: 0 },
    { x: 480, y: 380, variant: 0 },
    { x: 260, y: 380, variant: 0 },
  ],

  chestSpots: [
    { x: 100, y: 100 },
    { x: 640, y: 100 },
    { x: 640, y: 440 },
    { x: 100, y: 440 },
  ],

  doors: ["S", "E"],

  tags: [],
};
