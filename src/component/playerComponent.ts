import { Component, injectable } from "phaser-component-framework";

@injectable()
export class PlayerComponent extends Component {
  public create(): void {
    this.scene.add.image(0, 0, 'player').setScale(0.1);
  }

  public update(): void {
    // console.log(this.controls.isActive('UP'))
  }
}
