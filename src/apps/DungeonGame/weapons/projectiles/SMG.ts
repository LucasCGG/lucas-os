import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class SMG extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<SMG> {
    const gun = new SMG(provider, team, ensureProjectileSheet());
    gun.damage = 6;
    gun.projectileSpeed = 15;
    gun.cooldown = 0.06;
    gun.magazineSize = 40;
    gun.reloadTime = 2.0;
    gun.maxRange = 400;
    gun.falloffStart = 150;
    gun.falloffEnd = 400;
    gun.minDamageFactor = 0.45;
    gun.pellets = 1;
    gun.spreadDegrees = 0;
    gun.reload();
    return gun;
  }
}
