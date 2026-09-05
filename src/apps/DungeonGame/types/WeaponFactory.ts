import { Team } from "../entities/Team";
import { TransformProvider, Weapon } from "../weapons";

export type WeaponFactory = (provider: TransformProvider, team: Team) => Promise<Weapon>;
