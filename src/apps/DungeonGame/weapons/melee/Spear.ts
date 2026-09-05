import { MeleeTargetProvider, MeleeWeapon } from "../../entities/MeleeWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";

export class Spear extends MeleeWeapon {
  static async create(provider: TransformProvider, team: Team, targetProvider: MeleeTargetProvider): Promise<Spear> {
    const weapon = new Spear(
      provider,
      team,
      targetProvider
    )
    weapon.damage = 15;
    weapon.cooldown = 0.55;
    weapon.range = 150;
    weapon.attackAngle = 45;
    return weapon;
  }
}
