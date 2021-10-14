import { Scene } from "phaser-component-framework";

export class DefaultScene extends Scene {
  init() {
    this.addComponent('player');
  }
}
