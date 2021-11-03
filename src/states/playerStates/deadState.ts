import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';
import { PlayerContext } from './playerContext';

@injectable()
export class DeadState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('controls') private controls: ControlsInterface,
    @inject('mathService') private mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'dead';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    context.player.visible = false;
    context.player.setVelocity(0, 0);

    const inputVector = new Phaser.Math.Vector2(
      this.controls.isActive('RIGHT') - this.controls.isActive('LEFT'),
      this.controls.isActive('DOWN') - this.controls.isActive('UP')
    );

    if (context.dashTime + CONSTANTS.PLAYER_RESPAWN_TIME < time) {
      context.player.visible = true;
      if (inputVector.x !== 0 || inputVector.y !== 0) {
        context.angle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
      }
      context.player.setPosition(context.lastSafePosition.x, context.lastSafePosition.y);
      const idleState = context.states.find((state) => state.getName() === 'idle');
      return idleState.update(time, delta, context);
    }

    if (context.deathAnimation.anims.getProgress() === 1) {
      context.deathAnimation.visible = false;
    }

    return this;
  }
}
