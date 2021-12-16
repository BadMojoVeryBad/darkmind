import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { CharacterNode } from '../../nodes/characters/characterNode';
import { PlayerCharacterNode } from '../../nodes/characters/PlayerCharacterNode';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { RunningState } from '../characterStates/runningState';
import { NodeStateInterface } from '../nodeStateInterface';

@injectable()
export class PlayerRunningState extends RunningState implements NodeStateInterface<PlayerCharacterNode> {
  constructor(
    @inject('controls') controls: ControlsInterface,
    @inject('mathService') mathService: MathServiceInterface
  ) {
    super(controls, mathService);
  }

  getName(): string {
    return 'characterRunning';
  }

  update(time: number, delta: number, context: CharacterNode): NodeStateInterface<PlayerCharacterNode> {
    // Do the logic that's generic to all characters.
    super.update(time, delta, context);

    // Player input.
    const inputVector = new Phaser.Math.Vector2(
      this.controls.isActive('RIGHT') - this.controls.isActive('LEFT'),
      this.controls.isActive('DOWN') - this.controls.isActive('UP')
    );

    // Transition to idle state if not moving.
    if (!inputVector.x && !inputVector.y) {
      const idleState = context.states.find((state) => state.getName() === 'characterIdle');
      return idleState;
    }

    // Set the velocity.
    const playerSpeed = Math.min(1, inputVector.length()) * CONSTANTS.PLAYER_SPEED;
    const playerAngle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.sprite.setVelocity(playerVector.x, playerVector.y);
    context.angle = playerAngle;

    return this;
  }
}
