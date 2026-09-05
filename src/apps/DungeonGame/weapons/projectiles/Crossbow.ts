
import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class CrossBow extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<CrossBow> {
    const gun = new CrossBow(provider, team, ensureProjectileSheet());
    gun.damage = 45;
    gun.projectileSpeed = 22;
    gun.cooldown = 0.75;
    gun.magazineSize = 1;
    gun.reloadTime = 1.8;
    gun.maxRange = 850;
    gun.falloffStart = 650;
    gun.falloffEnd = 850;
    gun.minDamageFactor = 0.80;
    gun.pellets = 1;
    gun.spreadDegrees = 0;
    gun.reload();
    return gun;
  }
}
