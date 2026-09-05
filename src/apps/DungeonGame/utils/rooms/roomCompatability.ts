import { Direction, OPPOSITE_DIRECTION, RoomTemplate } from "../../scenes/RoomTemplate";

export const hasDoor= (
  room: RoomTemplate,
  direction: Direction,
): boolean => {
  return room.doors.includes(direction);
}

export const canConnect = (
  a: RoomTemplate,
  direction: Direction,
  b: RoomTemplate,
): boolean => {
  return (
    hasDoor(a, direction) &&
    hasDoor(
      b,
      OPPOSITE_DIRECTION[direction],
    )
  );
}

export const areRoomsCompatible =(
  a: RoomTemplate,
  b: RoomTemplate,
): boolean => {
  if (
    a.excludesTags?.some((tag) =>
      b.tags.includes(tag),
    )
  ) {
    return false;
  }

  if (
    b.excludesTags?.some((tag) =>
      a.tags.includes(tag),
    )
  ) {
    return false;
  }

  return true;
}
