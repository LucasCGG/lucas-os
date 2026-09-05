import { GameObject } from "../GameObject";
import { Collider } from "./Collider";
import { CollisionResult } from "./CollisionResult";

interface ColliderEntry {
  owner: GameObject
  collider: Collider;
}

export class CollisionWorld {
  private entries: ColliderEntry[] = [];
  register(owner: GameObject, collider: Collider): void{
    this.entries.push({ owner, collider });
  }

  unregister(owner: GameObject): void{
    this.entries = this.entries.filter((e) => e.owner !== owner);
  }

  clear(): void{
    this.entries = [];
  }

  checkCollisions(): CollisionResult[] {
    const results: CollisionResult[] = [];
    const snapshot = [...this.entries];
    for (let i = 0; i < snapshot.length; i++) {
      for (let j = i + 1; j < snapshot.length; j++) {   // i + 1
        const a = snapshot[i];
        const b = snapshot[j];
        if (!a.owner.isAlive() || !b.owner.isAlive()) { // both must be alive
          continue;
        }
        if (a.collider.intersects(b.collider)) {
          const trigger = a.collider.isTrigger || b.collider.isTrigger;
          results.push(new CollisionResult(a.owner, b.owner, trigger));
        }
      }
    }
    this.entries = this.entries.filter((e) => e.owner.isAlive());
    return results;
  }

  getCollider(owner: GameObject): Collider | null{
    for (const e of this.entries) {
      if(e.owner === owner){
        return e.collider;
      }
    }
    return null;
  }
}
