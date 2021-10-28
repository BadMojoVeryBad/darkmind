import { injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { NodeStateInterface } from '../nodeStateInterface';
import { PlayerContext } from './playerContext';

@injectable()
export class DeadState implements NodeStateInterface<PlayerContext> {
  getName(): string {
    return 'dead';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    context.player.visible = false;
    context.player.setVelocity(0, 0);

    if (context.dashTime + CONSTANTS.PLAYER_RESPAWN_TIME < time) {
      context.player.visible = true;
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
