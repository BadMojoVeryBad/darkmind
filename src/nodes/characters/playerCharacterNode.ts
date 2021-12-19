import { inject, injectable } from "inversify";
import { PlayerIdleState } from "../../states/playerCharacterStates/playerIdleState";
import { PlayerRunningState } from "../../states/playerCharacterStates/playerRunningState";
import { CharacterNode } from "./characterNode";

@injectable()
export class PlayerCharacterNode extends CharacterNode {
  private controlsDisabledCount = 0;

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

    this.scene.events.emit('cutscene.play.prologue_start');
  }

  public name(): string {
    return 'player';
  }

  public disableControls(): void {
    this.controlsDisabledCount++;
  }

  public enableControls(): void {
    this.controlsDisabledCount--;
  }

  public controlsEnabled(): boolean {
    return this.controlsDisabledCount === 0;
  }
}
