import { Entity } from "../entities/Entity";

export interface EntityDelegator {
  spawn(entity: Entity): void;
  spawnAll(entities: Entity[]): void;
}

export function spawnAll(delegator: EntityDelegator, entities: Entity[]): void {
  for (const entity of entities) {
    delegator.spawn(entity);
  }
}
