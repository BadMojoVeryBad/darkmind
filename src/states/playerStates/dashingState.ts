import { injectable } from 'inversify';
import { ControlsInterface, inject } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';
import { PlayerContext } from './playerContext';

@injectable()
export class DashingState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('controls') private controls: ControlsInterface,
    @inject('mathService') private mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'dashing';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    // Transition to running state if dash ends.
    if (context.dash.time + CONSTANTS.PLAYER_DASH_TIME < time) {
      const runningState = context.states.find((state) => state.getName() === 'running');
      return runningState.update(time, delta, context);
    }

    // Set the velocity.
    const playerSpeed = CONSTANTS.PLAYER_DASH_SPEED;
    const playerAngle = this.mathService.vectorToRadians(context.dash.vector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.player.setVelocity(playerVector.x, playerVector.y);

    // Set running animation.
    const currentAngle = this.mathService.angleNameFromPoints(context.dash.vector, new Phaser.Math.Vector2(0, 0));
    context.currentAngle = playerAngle;
    context.player.anims.play(`playerDash${currentAngle}`, true);

    // Player flip.
    if (context.player.body.velocity.x < 0) {
      context.player.flipX = true;
    } else if (context.player.body.velocity.x > 0) {
      context.player.flipX = false;
    }

    return this;
  }
}
