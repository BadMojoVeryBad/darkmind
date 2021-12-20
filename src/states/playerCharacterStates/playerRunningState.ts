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

  update(time: number, delta: number, context: PlayerCharacterNode): NodeStateInterface<PlayerCharacterNode> {
    // Do the logic that's generic to all characters.
    const parentState = super.update(time, delta, context);

    // Player input.
    const inputVector = new Phaser.Math.Vector2(
      this.controls.isActive('RIGHT') - this.controls.isActive('LEFT'),
      this.controls.isActive('DOWN') - this.controls.isActive('UP')
    );

    // Transition to idle state if not moving.
    if ((!inputVector.x && !inputVector.y) || (!context.controlsEnabled() && parentState.getName() === 'characterIdle')) {
      const idleState = context.states.find((state) => state.getName() === 'characterIdle');
      return idleState;
    }

    // Do footstep.
    if (context.sprite.anims.currentFrame.index === 1 && context.hasStepped) {
      context.hasStepped = false;
      context.groundParticlesEmitter.explode(10, context.sprite.x, context.sprite.y + 12);
    } else if (context.sprite.anims.currentFrame.index !== 1) {
      context.hasStepped = true;
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

      // Set safe position if the player
      // is overlapping a tile.
      if (context.isOverlappingMap) {
        context.lastSafePosition = new Phaser.Math.Vector2(context.sprite.x, context.sprite.y);
      }

      // Set the velocity.
      const playerSpeed = Math.min(1, inputVector.length()) * CONSTANTS.PLAYER_SPEED;
      const playerAngle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
      const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
      context.sprite.setVelocity(playerVector.x, playerVector.y);
      context.angle = playerAngle;
    }

    return this;
  }
}
