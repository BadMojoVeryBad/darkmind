import { Component, inject, injectable, ControlsInterface } from 'phaser-component-framework';

@injectable()
export class PlayerComponent extends Component {
  constructor(@inject('controls') private controls: ControlsInterface) {
    super();
  }

  public create(): void {
    this.scene.add.image(0, 0, 'player').setScale(0.1);
  }

  public update(): void {
    console.log(this.controls.isActive('UP'));
  }
}
