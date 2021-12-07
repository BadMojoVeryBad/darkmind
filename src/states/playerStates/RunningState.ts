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
      this.controls.isActive('RIGHT') - this.controls.isActive('LEFT'),
      this.controls.isActive('DOWN') - this.controls.isActive('UP')
    );

    // Check for dead.
    if (!context.isOverlappingMap && !context.isOnPlatform) {
      context.deathAnimation.setPosition(context.player.x, context.player.y);
      context.deathAnimation.visible = true;
      context.deathAnimation.anims.play('puff');
      context.deadTime = time;

      const nextState = context.states.find((state) => state.getName() === 'dead');
      return nextState.update(time, delta, context);
    }

    // Transition to dashing state if the dash control is active.
    if (this.controls.isActive(CONSTANTS.CONTROL_DASH) && context.dashTime + CONSTANTS.PLAYER_DASH_RESET_TIME < time) {
      context.dashTime = time;
      context.angle = this.mathService.closestMultiple(context.angle, Math.PI / 4);
      context.dashVector = this.mathService.radiansToVector(context.angle);
      context.dashStartX = context.player.x;
      context.dashStartY = context.player.y;
      const dashState = context.states.find((state) => state.getName() === 'dashing');
      return dashState.update(time, delta, context);
    }

    // Transition to idle state if not moving.
    if (!inputVector.x && !inputVector.y) {
      const idleState = context.states.find((state) => state.getName() === 'idle');
      return idleState.update(time, delta, context);
    }

    // Set safe position if the player
    // is overlapping a tile.
    if (context.isOverlappingMap) {
      context.lastSafePosition = new Phaser.Math.Vector2(context.player.x, context.player.y);
    }

    // Set the velocity.
    const playerSpeed = Math.min(1, inputVector.length()) * CONSTANTS.PLAYER_SPEED;
    const playerAngle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.player.setVelocity(playerVector.x, playerVector.y);

    // Set running animation.
    const currentAngle = this.mathService.angleName(playerAngle);
    context.angle = playerAngle;
    context.player.anims.play(`playerRunning${currentAngle}`, true);

    // Player flip.
    if (context.player.body.velocity.x < 0) {
      context.player.flipX = true;
    } else if (context.player.body.velocity.x > 0) {
      context.player.flipX = false;
    }

    // Do footstep.
    if (context.player.anims.currentFrame.index === 1 && context.hasStepped) {
      context.hasStepped = false;
      context.footsteps.explode(10, context.player.x, context.player.y + 12);
    } else if (context.player.anims.currentFrame.index !== 1) {
      context.hasStepped = true;
    }

    // Shadow stuff.
    let shadowAngle = 'Up';
    let flipped = false;
    let yOffset = 12;
    if (currentAngle === 'Side') {
      shadowAngle = 'Up';
    } else if (currentAngle === 'Up') {
      flipped = true;
      shadowAngle = 'Side';
    } else if (currentAngle === 'Down') {
      shadowAngle = 'Side';
      yOffset = 14;
    } else if (currentAngle === 'DiagonalUp') {
      flipped = true;
      shadowAngle = 'DiagonalDown';
    } else if (currentAngle === 'DiagonalDown') {
      shadowAngle = 'DiagonalUp';
    }
    context.shadow.anims.play(`playerRunning${shadowAngle}`, true);
    context.shadow.setPosition(context.player.x + 16, context.player.y + yOffset);
    context.shadow.flipX = flipped;

    return this;
  }
}
