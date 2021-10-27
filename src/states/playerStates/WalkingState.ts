import { injectable } from "inversify";
import { NodeStateInterface } from "../NodeStateInterface";
import { PlayerContext } from "./PlayerContext";

@injectable()
export class WalkingState implements NodeStateInterface<PlayerContext> {
  getName(): string {
    return 'walking';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    console.log(this.getName());
    return this;
  }
}
