import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class SimpleBow extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<SimpleBow> {
    const gun = new SimpleBow(provider, team, ensureProjectileSheet());
    gun.damage = 22;
    gun.projectileSpeed = 15;
    gun.cooldown = 0.75;
    gun.magazineSize = 1;
    gun.reloadTime = 0;
    gun.maxRange = 700;
    gun.falloffStart = 500;
    gun.falloffEnd = 700;
    gun.minDamageFactor = 0.65;
    gun.reload();
    return gun;
  }
}
