import { inject, injectable } from "phaser-node-framework";
import { NodeStateInterface } from "../NodeStateInterface";
import { PlayerContext } from "./PlayerContext";

@injectable()
export class IdleState implements NodeStateInterface<PlayerContext> {
  constructor(@inject('playerWalkingState') private walkingState: NodeStateInterface<PlayerContext>) { }

  getName(): string {
    return 'idle';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    console.log(this.getName());
    if (time > 3000) {
      return this.walkingState;
    } else {
      return this;
    }
  }
}
