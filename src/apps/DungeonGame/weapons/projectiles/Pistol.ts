import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class Pistol extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<Pistol> {
    const gun = new Pistol(provider, team, ensureProjectileSheet());
    gun.damage = 10;
    gun.projectileSpeed = 13;
    gun.cooldown = 0.35;
    gun.magazineSize = 12;
    gun.reloadTime = 1.0;
    gun.maxRange = 500;
    gun.falloffStart = 300;
    gun.falloffEnd = 500;
    gun.minDamageFactor = 0.7;
    gun.reload();
    return gun;
  }
}
