import { Transform } from "../Tranform";

export enum ColliderType {
  AABB,
  CIRCLE,
}

export abstract class Collider {
  protected transform: Transform;
  isTrigger = false;

  constructor(transform: Transform) {
    this.transform = transform;
  }

  abstract getType(): ColliderType;
  abstract intersects(other: Collider): boolean;

  getTransform(): Transform {
    return this.transform;
  }
}
