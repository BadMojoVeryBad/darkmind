import { injectable } from 'inversify';
import { ControlsInterface, inject } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';
import { PlayerContext } from './playerContext';

@injectable()
export class RunningState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('controls') private controls: ControlsInterface,
    @inject('mathService') private mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'running';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    // Get player input.
    const inputVector = new Phaser.Math.Vector2(
      this.mathService.easing(this.controls.isActive('RIGHT')) - this.mathService.easing(this.controls.isActive('LEFT')),
      this.mathService.easing(this.controls.isActive('DOWN')) - this.mathService.easing(this.controls.isActive('UP'))
    );

    // Transition to dashing state if the dash control is active.
    if (this.controls.isActive(CONSTANTS.CONTROL_DASH) && context.dash.time + CONSTANTS.PLAYER_DASH_RESET_TIME < time) {
      context.dash.time = time;
      context.dash.vector = this.mathService.radiansToVector(context.player.angle);
      const dashState = context.states.find((state) => state.getName() === 'dashing');
      return dashState.update(time, delta, context);
    }

    // Transition to idle state if not moving.
    if (!inputVector.x && !inputVector.y) {
      const idleState = context.states.find((state) => state.getName() === 'idle');
      return idleState.update(time, delta, context);
    }

    // Set the velocity.
    const playerSpeed = Math.min(1, inputVector.length()) * CONSTANTS.PLAYER_SPEED;
    const playerAngle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.player.sprite.setVelocity(playerVector.x, playerVector.y);

    // Set running animation.
    const currentAngle = this.mathService.angleNameFromPoints(inputVector, new Phaser.Math.Vector2(0, 0));
    context.player.angle = playerAngle;
    context.player.sprite.anims.play(`playerRunning${currentAngle}`, true);

    // Player flip.
    if (context.player.sprite.body.velocity.x < 0) {
      context.player.sprite.flipX = true;
    } else if (context.player.sprite.body.velocity.x > 0) {
      context.player.sprite.flipX = false;
    }

    // Do footstep.
    if (context.player.sprite.anims.currentFrame.index === 1 && context.player.hasStepped) {
      context.player.hasStepped = false;
      context.player.footsteps.explode(10, context.player.sprite.x, context.player.sprite.y + 12);
    } else if (context.player.sprite.anims.currentFrame.index !== 1) {
      context.player.hasStepped = true;
    }

    return this;
  }
}
