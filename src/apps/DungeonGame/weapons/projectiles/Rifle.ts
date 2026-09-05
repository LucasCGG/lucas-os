import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";


export class Rifle extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<Rifle> {
    const gun = new Rifle(provider, team, ensureProjectileSheet());
    gun.damage = 12;
    gun.projectileSpeed = 18;
    gun.cooldown = 0.12;
    gun.magazineSize = 30;
    gun.reloadTime = 2.0;
    gun.maxRange = 650;
    gun.falloffStart = 400;
    gun.falloffEnd = 650;
    gun.minDamageFactor = 0.75;
    gun.spreadDegrees = 2;
    gun.reload();
    return gun;
  }
}
