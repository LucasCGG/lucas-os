import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class HandCannon extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<HandCannon> {
    const gun = new HandCannon(provider, team, ensureProjectileSheet());
    gun.damage = 32;
    gun.projectileSpeed = 16;
    gun.cooldown = 0.70;
    gun.magazineSize = 6;
    gun.reloadTime = 1.8;
    gun.maxRange = 600;
    gun.falloffStart = 350;
    gun.falloffEnd = 600;
    gun.minDamageFactor = 0.65;
    gun.pellets = 1;
    gun.spreadDegrees = 2;
    gun.reload();
    return gun;
  }
}
