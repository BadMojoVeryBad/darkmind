import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CharacterNode } from '../../nodes/characters/characterNode';
import { PlayerCharacterNode } from '../../nodes/characters/PlayerCharacterNode';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { IdleState } from '../characterStates/idleState';
import { NodeStateInterface } from '../nodeStateInterface';

@injectable()
export class PlayerIdleState extends IdleState implements NodeStateInterface<PlayerCharacterNode> {
  constructor(
    @inject('controls') controls: ControlsInterface,
    @inject('mathService') mathService: MathServiceInterface
  ) {
    super(controls, mathService);
  }

  getName(): string {
    return 'characterIdle';
  }

  update(time: number, delta: number, context: CharacterNode): NodeStateInterface<PlayerCharacterNode> {
    // Do the logic that's generic to all characters. If this causes a
    // change in state, change state.
    const nextState = super.update(time, delta, context);
    if (nextState.getName() !== this.getName()) {
      return nextState;
    }

    // Transition to running state if there's movement input.
    const inputVector = new Phaser.Math.Vector2(
      this.controls.isActive('RIGHT') - this.controls.isActive('LEFT'),
      this.controls.isActive('DOWN') - this.controls.isActive('UP')
    );
    if (inputVector.x || inputVector.y) {
      const runningState = context.states.find((state) => state.getName() === 'characterRunning');
      return runningState.update(time, delta, context);
    }

    // Stay in the idle state.
    return this;
  }
}
