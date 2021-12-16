import { inject, injectable } from "inversify";
import { PlayerIdleState } from "../../states/playerCharacterStates/playerIdleState";
import { PlayerRunningState } from "../../states/playerCharacterStates/playerRunningState";
import { CharacterNode } from "./characterNode";

@injectable()
export class PlayerCharacterNode extends CharacterNode {
  public constructor(
    @inject('playerCharacterIdleState') idleState: PlayerIdleState,
    @inject('playerCharacterRunningState') runningState: PlayerRunningState
  ) {
    super(idleState, runningState);
  }

  public create(): void {
    super.create();
  }

  public created(): void {
    this.scene.events.emit('playerCharacterCreated', this);
  }

  public name(): string {
    return 'player';
  }
}
