import { ControlsInterface, inject, injectable } from 'phaser-node-framework';
import { CharacterNode } from '../../nodes/characters/characterNode';
import { MathServiceInterface } from '../../services/mathServiceInterface';
import { NodeStateInterface } from '../nodeStateInterface';

@injectable()
export class IdleState implements NodeStateInterface<CharacterNode> {
  constructor(
    @inject('controls') protected controls: ControlsInterface,
    @inject('mathService') protected mathService: MathServiceInterface
  ) { }

  getName(): string {
    return 'characterIdle';
  }

  update(time: number, delta: number, context: CharacterNode): NodeStateInterface<CharacterNode> {
    // If there's a target position, start running towards it.
    if (context.targetPosition) {
      return context.states.find(state => state.getName() === 'characterRunning');
    }

    // Set velocity.
    context.sprite.setVelocity(0, 0);

    // Set idle animation.
    const characterName = context.name();
    const currentAngle = this.mathService.angleName(context.angle);
    context.sprite.anims.play(`${characterName}Idle${currentAngle}`, true);

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
    context.shadow.anims.play(`${characterName}Idle${shadowAngle}`, true);
    context.shadow.setPosition(context.sprite.x + 16, context.sprite.y + 12);
    context.shadow.flipX = flipped;

    return this;
  }
}
