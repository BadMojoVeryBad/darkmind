import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { PlayerCharacterNode } from '../../nodes/characters/PlayerCharacterNode';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';

@injectable()
export class PlayerDeadState implements NodeStateInterface<PlayerCharacterNode> {
  constructor(
    @inject('controls') protected controls: ControlsInterface,
    @inject('mathService') protected mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'playerDead';
  }

  update(time: number, delta: number, context: PlayerCharacterNode): NodeStateInterface<PlayerCharacterNode> {
    context.sprite.visible = false;
    context.sprite.setVelocity(0, 0);

    const inputVector = new Phaser.Math.Vector2(
      this.controls.isActive('RIGHT') - this.controls.isActive('LEFT'),
      this.controls.isActive('DOWN') - this.controls.isActive('UP')
    );

    if (context.deadTime + CONSTANTS.PLAYER_RESPAWN_TIME < time) {
      context.sprite.visible = true;
      if (inputVector.x !== 0 || inputVector.y !== 0) {
        context.angle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
      }
      context.sprite.setPosition(context.lastSafePosition.x, context.lastSafePosition.y);
      const idleState = context.states.find((state) => state.getName() === 'characterIdle');
      return idleState;
    }

    if (context.deathAnimation.anims.getProgress() === 1) {
      context.deathAnimation.visible = false;
    }

    return this;
  }
}
