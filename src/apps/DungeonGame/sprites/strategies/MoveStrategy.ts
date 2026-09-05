import { Transform } from "../../engine";

export interface MoveStrategy {
  move(current: Transform, speed: number): Transform;
}
