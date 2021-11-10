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
    // Transition to running state if dash ends.
    if (context.dashTime + CONSTANTS.PLAYER_DASH_TIME < time) {
      const nextStateName = (context.isOverlappingMap) ? 'dead' : 'running';

      if (nextStateName === 'dead') {
        context.deathAnimation.setPosition(context.player.x, context.player.y);
        context.deathAnimation.visible = true;
        context.deathAnimation.anims.play('puffA');
      }

      const nextState = context.states.find((state) => state.getName() === nextStateName);
      return nextState.update(time, delta, context);
    }

    // Set the velocity.
    const playerSpeed = (this.mathService.angleName(context.angle).includes('Diagonal')) ? CONSTANTS.PLAYER_DASH_SPEED_DIAGONAL : CONSTANTS.PLAYER_DASH_SPEED;
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
