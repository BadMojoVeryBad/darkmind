import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CONSTANTS } from '../../constants';
import { CharacterNode } from '../../nodes/characters/characterNode';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';

@injectable()
export class RunningState implements NodeStateInterface<CharacterNode> {
  constructor(
    @inject('controls') protected controls: ControlsInterface,
    @inject('mathService') protected mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'characterRunning';
  }

  update(time: number, delta: number, context: CharacterNode): NodeStateInterface<CharacterNode> {
    // Character flip.
    context.sprite.flipX = context.angle > 1.5708 || context.angle < -1.5708;

    // Set running animation.
    const characterName = context.name();
    const currentAngle = this.mathService.angleName(context.angle);
    context.sprite.anims.play(`${characterName}Running${currentAngle}`, true);

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
    context.shadow.anims.play(`${characterName}Running${shadowAngle}`, true);
    context.shadow.setPosition(context.sprite.x + 16, context.sprite.y + 12);
    context.shadow.flipX = flipped;

    // If the character has reached their destination, idle.
    const characterPosition = new Phaser.Math.Vector2(context.sprite.x, context.sprite.y);
    if (!context.targetPosition || context.targetPosition.fuzzyEquals(characterPosition, 4)) {
      context.targetPosition = undefined;
      return context.states.find(state => state.getName() === 'characterIdle');
    }

    // Get running direction.
    const inputVector = new Phaser.Math.Vector2(
      context.targetPosition.x - characterPosition.x,
      context.targetPosition.y - characterPosition.y
    );

    // Set the velocity.
    const playerSpeed = CONSTANTS.PLAYER_SPEED;
    const playerAngle = this.mathService.vectorToRadians(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.mathService.velocityFromRotation(playerAngle, playerSpeed);
    context.sprite.setVelocity(playerVector.x, playerVector.y);
    context.angle = playerAngle;

    return this;
  }
}
