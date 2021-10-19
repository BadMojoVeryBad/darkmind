import { Component, inject, injectable, ControlsInterface } from 'phaser-component-framework';
import { Context } from '../contexts/context';

/**
 * The player sprite.
 */
@injectable()
export class PlayerComponent extends Component {
  private player: Phaser.Physics.Arcade.Sprite;
  private text: Phaser.GameObjects.BitmapText;
  private currentAngle: string = 'Side';

  constructor(@inject('controls') private controls: ControlsInterface, @inject('context') private context: Context) {
    super();
  }

  public create(): void {
    this.player = this.scene.physics.add.sprite(this.scene.width() / 2, this.scene.height() / 2, 'textures', 'playerIdleSide1').setScale(1);
    this.text = this.scene.add.bitmapText(10, 10, 'helloRobotWhite', 'Blah', 32);
    this.context.flag1 = true;
  }

  public afterCreate(): void {
    // Player created event.
    this.scene.events.emit('playerCreated', this.player);
  }

  public update(): void {
    // Get variables.
    const inputVector = new Phaser.Math.Vector2(
      this.easeOutCubic(this.controls.isActive('RIGHT')) - this.easeOutCubic(this.controls.isActive('LEFT')),
      this.easeOutCubic(this.controls.isActive('DOWN')) - this.easeOutCubic(this.controls.isActive('UP'))
    );

    const playerSpeed = inputVector.length() ? Math.min(1, inputVector.length()) * 60 : 0;
    const playerAngle = this.getAngle(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.velocityFromRotation(playerAngle, playerSpeed);

    // Set velocity.
    this.player.setVelocity(playerVector.x, playerVector.y);

    // Debug for now.
    this.text.setText(playerSpeed.toFixed(2));

    // Player flip.
    if (this.player.body.velocity.x < 0) {
      this.player.flipX = true;
    } else if (this.player.body.velocity.x > 0) {
      this.player.flipX = false;
    }

    // Set animation based on velocity and angle.
    let animation = `playerIdle${this.currentAngle}`;
    if (this.player.body.velocity.x || this.player.body.velocity.y) {
      this.currentAngle = this.getAngleName(inputVector, new Phaser.Math.Vector2(0, 0));
      animation = `playerRunning${this.currentAngle}`;
    }

    const current = this.player.anims.getName();
    if (current !== animation) {
      const progress = this.player.anims.getProgress();
      this.player.anims.play(animation, true);
      this.player.anims.setProgress(progress);
    }
  }

  private getAngle(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): number {
    return Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
  }

  private getAngleName(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): string {
    const radians = Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
    const margin = Math.PI / 8;

    if (radians >= (margin * -4) - margin && radians <= (margin * -4) + margin) {
      return 'Up';
    }

    if (radians >= (margin * -2) - margin && radians <= (margin * -2) + margin ||
      radians >= (margin * -6) - margin && radians <= (margin * -6) + margin) {
      return 'DiagonalUp';
    }

    if (radians >= (margin * 0) - margin && radians <= (margin * 0) + margin ||
      radians >= (margin * 8) - margin && radians <= (margin * 8) + margin) {
      return 'Side';
    }

    if (radians >= (margin * 2) - margin && radians <= (margin * 2) + margin ||
      radians >= (margin * 6) - margin && radians <= (margin * 6) + margin) {
      return 'DiagonalDown';
    }

    if (radians >= (margin * 4) - margin && radians <= (margin * 4) + margin) {
      return 'Down';
    }

    return 'Side';
  }

  private velocityFromRotation(rotation: number, speed = 60, vec2: Phaser.Math.Vector2 = new Phaser.Math.Vector2()): Phaser.Math.Vector2 {
    return vec2.setToPolar(rotation, speed);
  }

  private easeOutCubic(x: number): number {
    if (x > 1) {
      return 1;
    }

    if (x < 0) {
      return 0;
    }

    return 1 - Math.pow(1 - x, 3);
  }
}
