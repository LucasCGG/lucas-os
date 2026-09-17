import { Player } from "../entities/Player";
import { Level1 } from "./Level1";

export class Level2 extends Level1 {
    constructor(player: Player) {
        super(player, { difficulty: 2, boss: true });
    }
}
