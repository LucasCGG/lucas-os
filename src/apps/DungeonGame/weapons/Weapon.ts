import { EntityAttributes } from "../attributes/EntityAttributes";
import { Entity } from "../entities/Entity";

export abstract class Weapon {
    private displayName = "Unknown weapon";

    setDisplayName(name: string): void {
        this.displayName = name;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    applyOwnerBonus(_stats: EntityAttributes): void {}

    abstract attack(): Entity[];

    abstract tick(deltaTime: number): void;

    getDamageOutput(): number {
        return 0;
    }
}
