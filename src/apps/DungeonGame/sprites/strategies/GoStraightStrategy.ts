import { Transform } from "../../engine";
import { MoveStrategy } from "./MoveStrategy";

export class GoStraightStrategy implements MoveStrategy {
  private readonly directionX: number;
  private readonly directionY: number;

  constructor(transform: Transform) {
    const radians = (transform.rotation * Math.PI) / 180;
    this.directionX = Math.cos(radians);
    this.directionY = Math.sin(radians);
  }

  move(transform: Transform, speed: number): Transform {
    return new Transform(
      transform.x + this.directionX * speed,
      transform.y + this.directionY * speed,
      transform.width,
      transform.height,
      transform.rotation,
    );
  }
}
