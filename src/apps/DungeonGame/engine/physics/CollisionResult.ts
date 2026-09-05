import { GameObject } from "../GameObject";

export class CollisionResult {
  readonly a: GameObject;
  readonly b: GameObject;
  readonly isTrigger: boolean;

  constructor(a: GameObject, b: GameObject, isTrigger: boolean) {
    this.a = a;
    this.b = b;
    this.isTrigger = isTrigger;
  }

}
