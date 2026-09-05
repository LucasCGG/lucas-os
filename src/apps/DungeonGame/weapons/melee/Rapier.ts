import { MeleeTargetProvider, MeleeWeapon } from "../../entities/MeleeWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";

export class Rapier extends MeleeWeapon {
  static async create(provider: TransformProvider, team: Team, targetProvider: MeleeTargetProvider): Promise<Rapier> {
    const weapon = new Rapier(
      provider,
      team,
      targetProvider
    )
    weapon.damage = 9;
    weapon.cooldown = 0.25;
    weapon.range = 110;
    weapon.attackAngle = 50;
    return weapon;
  }
}
