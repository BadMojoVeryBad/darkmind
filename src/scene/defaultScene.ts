import { Scene } from 'phaser-component-framework';

export class DefaultScene extends Scene {
  public init(): void {
    this.addComponent('player');
  }
}
