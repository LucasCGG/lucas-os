import { MeleeTargetProvider, MeleeWeapon } from "../../entities/MeleeWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";

export class GreatSword extends MeleeWeapon {
  static async create(provider: TransformProvider, team: Team, targetProvider: MeleeTargetProvider): Promise<GreatSword> {
    const weapon = new GreatSword(
      provider,
      team,
      targetProvider
    )
    weapon.damage = 28;
    weapon.cooldown = 1.0;
    weapon.range = 80;
    weapon.attackAngle = 160;
    return weapon;
  }
}
