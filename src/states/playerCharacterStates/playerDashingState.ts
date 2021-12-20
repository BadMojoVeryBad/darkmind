import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { PlayerCharacterNode } from '../../nodes/characters/PlayerCharacterNode';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';

@injectable()
export class PlayerDashingState implements NodeStateInterface<PlayerCharacterNode> {
  constructor(
    @inject('controls') protected controls: ControlsInterface,
    @inject('mathService') protected mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'playerDashing';
  }

  update(time: number, delta: number, context: PlayerCharacterNode): NodeStateInterface<PlayerCharacterNode> {
    // Transition to running state if dash ends.
    if (Math.abs(context.sprite.x - context.dashStart.x) > 26 ||
        Math.abs(context.sprite.y - context.dashStart.y) > 26 ||
        time > context.dashTime + CONSTANTS.PLAYER_DASH_TIME + 50) {

      // If the player is not overlapping a platform or
      // a tile, they are dead.
      const nextStateName = (!context.isOverlappingMap && !context.isOnPlatform) ? 'playerDead' : 'characterIdle';

      if (nextStateName === 'playerDead') {
        context.deathAnimation.setPosition(context.sprite.x, context.sprite.y);
        context.deathAnimation.visible = true;
        context.deathAnimation.anims.play('puff');
        context.deadTime = time;
      }

      const nextState = context.states.find((state) => state.getName() === nextStateName);
      return nextState.update(time, delta, context);
    }

    // Set the velocity.
    const playerSpeed = (this.mathService.angleName(context.angle).includes('Diagonal')) ? CONSTANTS.PLAYER_DASH_SPEED_DIAGONAL : CONSTANTS.PLAYER_DASH_SPEED;
    const playerAngle = this.mathService.vectorToRadians(context.dashVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.sprite.setVelocity(playerVector.x, playerVector.y);

    // Set idle animation.
    const characterName = context.name();
    const currentAngle = this.mathService.angleName(context.angle);
    context.sprite.anims.play(`${characterName}Dash${currentAngle}`, true);

    // Character flip.
    context.sprite.flipX = context.angle > 1.5708 || context.angle < -1.5708;

    // Shadow stuff.
    let shadowAngle = 'Up';
    let flipped = false;
    if (currentAngle === 'Side') {
      shadowAngle = 'Up';
    } else if (currentAngle === 'Up') {
      flipped = true;
      shadowAngle = 'Side';
    } else if (currentAngle === 'Down') {
      shadowAngle = 'Side';
    } else if (currentAngle === 'DiagonalUp') {
      flipped = true;
      shadowAngle = 'DiagonalDown';
    } else if (currentAngle === 'DiagonalDown') {
      shadowAngle = 'DiagonalUp';
    }
    context.shadow.anims.play(`playerDash${shadowAngle}`, true);
    context.shadow.setPosition(context.sprite.x + 16, context.sprite.y + 12);
    context.shadow.flipX = flipped;

    context.groundParticlesEmitter.explode(10, context.sprite.x, context.sprite.y + 12);

    return this;
  }
}
