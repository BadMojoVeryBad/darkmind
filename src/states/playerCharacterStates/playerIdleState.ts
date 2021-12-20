import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
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

  update(time: number, delta: number, context: PlayerCharacterNode): NodeStateInterface<PlayerCharacterNode> {
    // Do the logic that's generic to all characters. If this causes a
    // change in state, change state.
    const nextState = super.update(time, delta, context);
    if (nextState.getName() !== this.getName()) {
      return nextState;
    }

    if (context.controlsEnabled()) {
      // Check for dead.
      if (!context.isOverlappingMap && !context.isOnPlatform) {
        context.deathAnimation.setPosition(context.sprite.x, context.sprite.y);
        context.deathAnimation.visible = true;
        context.deathAnimation.anims.play('puff');
        context.deadTime = time;

        const nextState = context.states.find((state) => state.getName() === 'playerDead');
        return nextState.update(time, delta, context);
      }

      // Transition to dashing state if the dash control is active.
      if (this.controls.isActive(CONSTANTS.CONTROL_DASH) && context.dashTime + CONSTANTS.PLAYER_DASH_RESET_TIME < time) {
        context.dashTime = time;
        context.angle = this.mathService.closestMultiple(context.angle, Math.PI / 4);
        context.dashVector = this.mathService.radiansToVector(context.angle);
        context.dashStart.x = context.sprite.x;
        context.dashStart.y = context.sprite.y;
        const dashState = context.states.find((state) => state.getName() === 'playerDashing');
        return dashState;
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
    }

    // Stay in the idle state.
    return this;
  }
}
