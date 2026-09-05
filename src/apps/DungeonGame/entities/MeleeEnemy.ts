import { Transform } from "../engine";
import { Enemy } from "./Enemy";
import { loadCharacter } from "../objects/utils/loadCharacter";
import { Team } from "./Team";
import { EntityAttributes } from "../attributes/EntityAttributes";
import { Sword } from "../weapons/melee/Sword";
import { MeleeTargetProvider } from "../entities/MeleeWeapon";

interface MeleeCreateOptions {
  name: string;
  transform: Transform;
  team: Team;
  xpReward?: number;
  enemyStats?: EntityAttributes;
}

export class MeleeEnemy extends Enemy {
  protected stopDistance = 50;

  private weapon: Sword | null = null;

  static async create(
    options: MeleeCreateOptions,
  ): Promise<MeleeEnemy> {
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
        120,
        90,
        12,
        1,
      );

    stats.setXpReward(
      xpReward ?? 50,
    );

    const enemy = new MeleeEnemy(
      name,
      transform,
      sheets,
      team,
      stats,
    );

    /*
     * Melee weapons expect a TransformProvider object,
     * not a bare function.
     */
    const transformProvider = {
      getTransform: () =>
        enemy.getAimingTransform(),
    };

    /*
     * The sword asks this provider which entities are
     * currently valid melee targets.
     */
    const targetProvider: MeleeTargetProvider = {
      getTargets: () =>
        enemy.targetEntity
          ? [enemy.targetEntity]
          : [],
    };

    const weapon = await Sword.create(
      transformProvider,
      team,
      targetProvider,
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

    if (distance <= this.weapon.range) {
      this.aimAtTarget();
      this.weapon.attack();
    }
  }
}
