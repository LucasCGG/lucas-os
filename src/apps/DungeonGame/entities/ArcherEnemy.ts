import { Transform } from "../engine";
import { Enemy } from "./Enemy";
import { loadCharacter } from "../objects/utils/loadCharacter";
import { Team } from "./Team";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { SimpleBow } from "../weapons/projectiles/SimpleBow";

interface ArcherCreateOptions {
  name: string;
  transform: Transform;
  team: Team;
  xpReward?: number;
  enemyStats?: EntityAttributes;
}

export class ArcherEnemy extends Enemy {
  protected stopDistance = 300;

  private weapon: SimpleBow | null = null;

  static async create(
    options: ArcherCreateOptions,
  ): Promise<ArcherEnemy> {
    const {
      name,
      transform,
      team,
      xpReward,
      enemyStats,
    } = options;

    const sheets = await loadCharacter(
      "6",
      72,
      72,
    );

    const stats =
      enemyStats ??
      new EntityAttributes(
        100, // health
        90,  // stamina/energy
        12,  // damage
        1,   // defense
      );

    stats.setXpReward(
      xpReward ?? 60,
    );

    const enemy = new ArcherEnemy(
      name,
      transform,
      sheets,
      team,
      stats,
    );

    /*
     * ProjectileWeapon expects a TransformProvider object.
     */
    const transformProvider = {
      getTransform: () =>
        enemy.getAimingTransform(),
    };

    const weapon = await SimpleBow.create(
      transformProvider,
      team,
    );

    enemy.weapon = weapon;

    return enemy;
  }

  protected behave(
    deltaTime: number,
    distance: number,
  ): void {
    if (this.weapon === null) {
      return;
    }

    this.weapon.tick(deltaTime);

    if (this.targetEntity === null) {
      return;
    }

    if (distance <= this.weapon.maxRange) {
      this.aimAtTarget();

      const projectiles =
        this.weapon.attack();

      if (projectiles.length > 0) {
        this.delegator?.spawnAll(
          projectiles,
        );
      }
    }
  }
}
