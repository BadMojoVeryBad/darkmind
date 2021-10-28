import { injectable } from 'inversify';
import { inject } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';
import { PlayerContext } from './playerContext';

@injectable()
export class DashingState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('mathService') private mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'dashing';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    // Don't collide with map while dashing.
    context.mapCollider.active = false;

    // Transition to running state if dash ends.
    if (context.dashTime + CONSTANTS.PLAYER_DASH_TIME < time) {
      context.mapCollider.active = true;
      const runningState = context.states.find((state) => state.getName() === 'running');
      return runningState.update(time, delta, context);
    }

    // Set the velocity.
    const playerSpeed = CONSTANTS.PLAYER_DASH_SPEED;
    const playerAngle = this.mathService.vectorToRadians(context.dashVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.player.setVelocity(playerVector.x, playerVector.y);

    // Set dashing animation.
    const currentAngle = this.mathService.angleNameFromPoints(context.dashVector, new Phaser.Math.Vector2(0, 0));
    context.player.anims.play(`playerDash${currentAngle}`, true);

    // Player flip.
    if (context.player.body.velocity.x < 0) {
      context.player.flipX = true;
    } else if (context.player.body.velocity.x > 0) {
      context.player.flipX = false;
    }

    context.footsteps.explode(10, context.player.x, context.player.y + 12);

    return this;
  }
}
