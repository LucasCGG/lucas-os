import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureProjectileSheet } from "../sprites/projectileSheet";

export class Shotgun extends ProjectileWeapon {
  static async create(provider: TransformProvider, team: Team): Promise<Shotgun> {
    const gun = new Shotgun(provider, team, ensureProjectileSheet());
    gun.damage = 14;
    gun.projectileSpeed = 14;
    gun.cooldown = 0.9;
    gun.spreadDegrees = 22;
    gun.maxRange = 300;
    gun.falloffStart = 80;
    gun.falloffEnd = 250;
    gun.pellets = 6;
    gun.minDamageFactor = 0.15;
    gun.reload();
    return gun;
  }
}
