import { RoomTemplate } from "../RoomTemplate";

export const Room_1: RoomTemplate = {
  id: "room_1",

  width: 800,
  height: 600,

  wallThickness: 40,
  doorWidth: 120,

  walls: [
    {
      x: 300,
      y: 200,
      width: 200,
      height: 40,
    },
  ],

  pillars: [
    {
      x: 100,
      y: 100,
      variant: 0,
    },
    {
      x: 668,
      y: 100,
      variant: 1,
    },
    {
      x: 100,
      y: 452,
      variant: 2,
    },
    {
      x: 668,
      y: 452,
      variant: 3,
    },
  ],

  chestSpots: [
    [200, 200],
    [550, 200],
  ],

  doors: [
    "N",
    "S",
    "E",
    "W",
  ],

  tags: [
    "normal",
    "combat",
  ],
};
