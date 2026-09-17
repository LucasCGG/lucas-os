import { Player } from "../entities/Player";
import { Level1 } from "./Level1";

export class Level3 extends Level1 {
    constructor(player: Player) {
        super(player, { difficulty: 4, boss: true });
    }

    protected override getStageLabel(): string {
        return "LEVEL 3 • THE ABYSSAL THRONE";
    }
}
