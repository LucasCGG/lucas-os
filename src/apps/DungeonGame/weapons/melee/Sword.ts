import { MeleeTargetProvider, MeleeWeapon } from "../../entities/MeleeWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";

export class Sword extends MeleeWeapon {
  static async create(provider: TransformProvider, team: Team, targetProvider: MeleeTargetProvider): Promise<Sword> {
    const weapon = new Sword(
      provider,
      team,
      targetProvider
    )
    weapon.damage = 12;
    weapon.cooldown = 0.45;
    weapon.range = 60;
    weapon.attackAngle = 140;
    return weapon;
  }
}
