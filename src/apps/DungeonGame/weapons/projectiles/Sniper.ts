import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class Sniper extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<Sniper> {
    const gun = new Sniper(provider, team, ensureProjectileSheet());
    gun.damage = 80;
    gun.projectileSpeed = 30;
    gun.cooldown = 1.50;
    gun.magazineSize = 5;
    gun.reloadTime = 2.5;
    gun.maxRange = 1400;
    gun.falloffStart = 1100;
    gun.falloffEnd = 1400;
    gun.minDamageFactor = 0.9;
    gun.pellets = 1;
    gun.spreadDegrees = 0;
    gun.reload();
    return gun;
  }
}
