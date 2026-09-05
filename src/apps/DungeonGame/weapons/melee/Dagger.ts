
import { MeleeTargetProvider, MeleeWeapon } from "../../entities/MeleeWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";

export class Dagger extends MeleeWeapon {
  static async create(provider: TransformProvider, team: Team, targetProvider: MeleeTargetProvider): Promise<Dagger> {
    const weapon = new Dagger(
      provider,
      team,
      targetProvider
    )
    weapon.damage = 6;
    weapon.cooldown = 0.2;
    weapon.range = 35;
    weapon.attackAngle = 100;
    return weapon;
  }
}
