import { Component, inject, injectable, ControlsInterface } from 'phaser-component-framework';
import { Context } from '../contexts/context';

@injectable()
export class PlayerComponent extends Component {
  private player: Phaser.Physics.Arcade.Sprite;
  private text: Phaser.GameObjects.BitmapText;

  constructor(@inject('controls') private controls: ControlsInterface, @inject('context') private context: Context) {
    super();
  }

  public create(): void {
    this.player = this.scene.physics.add.sprite(this.scene.width() / 2, this.scene.height() / 2, 'playerSprite').setScale(0.0625);
    this.text = this.scene.add.bitmapText(10, 10, 'helloRobotWhite', 'Blah', 32);
    this.context.flag1 = true;
  }

  public update(time: number, delta: number): void {
    this.text.setText(delta.toFixed(2));

    if (this.controls.isActive('UP')) {
      this.player.setVelocityY(this.controls.isActive('UP') * -10 * delta);
    } else if (this.controls.isActive('DOWN')) {
      this.player.setVelocityY(this.controls.isActive('DOWN') * 10 * delta);
    } else {
      this.player.setVelocityY(0);
    }

    if (this.controls.isActive('LEFT')) {
      this.player.setVelocityX(this.controls.isActive('LEFT') * -10 * delta);
    } else if (this.controls.isActive('RIGHT')) {
      this.player.setVelocityX(this.controls.isActive('RIGHT') * 10 * delta);
    } else {
      this.player.setVelocityX(0);
    }
  }
}
