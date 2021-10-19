import { Scene } from 'phaser-component-framework';

export class DefaultScene extends Scene {
  public preload(): void {
    this.load.bitmapFont('helloRobotWhite', 'assets/helloRobotWhite.png', 'assets/helloRobot.fnt');
  }

  public init(): void {
    this.addComponent('player');
    this.addComponent('camera');
  }
}
