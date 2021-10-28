import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';
import { PlayerContext } from './playerContext';

@injectable()
export class IdleState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('controls') private controls: ControlsInterface,
    @inject('mathService') private mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'idle';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    const inputVector = new Phaser.Math.Vector2(
      this.mathService.easing(this.controls.isActive('RIGHT')) - this.mathService.easing(this.controls.isActive('LEFT')),
      this.mathService.easing(this.controls.isActive('DOWN')) - this.mathService.easing(this.controls.isActive('UP'))
    );

    // Transition to dashing state if the dash control is active.
    if (this.controls.isActive(CONSTANTS.CONTROL_DASH) && context.dashTime + CONSTANTS.PLAYER_DASH_RESET_TIME < time) {
      context.dashTime = time;
      context.dashVector = this.mathService.radiansToVector(context.angle);
      const dashState = context.states.find((state) => state.getName() === 'dashing');
      return dashState.update(time, delta, context);
    }

    // Transition to running state if there's movement input.
    if (inputVector.x || inputVector.y) {
      const runningState = context.states.find((state) => state.getName() === 'running');
      return runningState.update(time, delta, context);
    }

    // Set velocity.
    context.player.setVelocity(0, 0);

    // Set running animation.
    const currentAngle = this.mathService.angleName(context.angle);
    context.player.anims.play(`playerIdle${currentAngle}`, true);

    // Player flip.
    if (context.player.body.velocity.x < 0) {
      context.player.flipX = true;
    } else if (context.player.body.velocity.x > 0) {
      context.player.flipX = false;
    }

    return this;
  }
}
