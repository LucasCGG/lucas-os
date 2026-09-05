import { Attributes } from "../attributes/Attributes";
import { GameObject, Transform } from "../engine";
import { Sprite } from "../sprites/Sprite";
import { Team } from "./Team";

export abstract class Entity extends GameObject {
  attributes: Attributes;
  protected sprite: Sprite | null;
  protected team: Team | null;
  protected active: boolean = true;

  constructor(
    name: string,
    transform: Transform,
    attributes: Attributes,
    sprite: Sprite | null = null,
    team: Team | null = null,
  ) {
    super(name, transform);
    this.attributes = attributes;
    this.sprite = sprite;
    this.team = team;
  }

  getSprite(): Sprite | null {
    return this.sprite;
  }

  getTeam(): Team | null {
    return this.team;
  }

  getAttributes(): Attributes {
    return this.attributes;
  }

  setActive(value: boolean): void {
    this.active = value;
  }

  getActive(): boolean{
    return this.active;
  }

  collidesWith(_other: Entity): void {}

  getCollisionBox(): Transform {
    const t = this.transform;
    const insetX = 11;
    const insetTop = 18;
    return new Transform(t.x + insetX, t.y + insetTop, t.width - insetX * 2, t.height - insetTop, 0);
  }

  getTransform(): Transform{
    return this.transform;
  }
}
