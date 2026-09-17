import { ProjectileWeapon } from "../../entities/ProjectileWeapon";
import { Team } from "../../entities/Team";
import { TransformProvider } from "../TransformProvider";
import { ensureArrowSheet } from "../sprites/arrowSheet";

export class CrossBow extends ProjectileWeapon {
    static async create(provider: TransformProvider, team: Team): Promise<CrossBow> {
        const gun = new CrossBow(provider, team, await ensureArrowSheet());
        gun.setDisplayName("Siegebow");
        gun.damage = 45;
        gun.projectileSpeed = 22;
        gun.cooldown = 0.75;
        gun.magazineSize = 1;
        gun.reloadTime = 1.8;
        gun.maxRange = 850;
        gun.falloffStart = 650;
        gun.falloffEnd = 850;
        gun.minDamageFactor = 0.8;
        gun.pellets = 1;
        gun.spreadDegrees = 0;
        gun.reload();
        return gun;
    }
}
