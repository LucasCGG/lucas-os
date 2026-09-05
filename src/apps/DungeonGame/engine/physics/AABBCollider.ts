import { Transform } from "../Tranform";
import { Collider, ColliderType } from "./Collider";

export class AABBCollider extends Collider {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;

  constructor(transform: Transform, offsetX = 0, offsetY = 0, width?: number, height?: number) {
    super(transform);
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.width = width ?? transform.width;
    this.height = height ?? transform.height;
  }

  getLeft(): number {
    return this.transform.x + this.offsetX;
  }

  getRight(): number {
    return this.transform.x + this.offsetX + this.width;
  }

  getTop(): number {
    return this.transform.y + this.offsetY;
  }

  getBottom(): number {
    return this.transform.y + this.offsetY + this.height;
  }

  getType(): ColliderType {
    return ColliderType.AABB;
  }

  intersects(other: Collider): boolean {
    return this.transform.intersects(other["transform"]);
  }
}
