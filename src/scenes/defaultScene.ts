import { Scene } from 'phaser-node-framework';

export class DefaultScene extends Scene {
  public preload(): void {
    this.load.bitmapFont('helloRobotWhite', 'assets/helloRobotWhite.png', 'assets/helloRobot.fnt');
  }

  public init(): void {
    this.addNode('camera');
    this.addNode('map', { name: 'debugMap' });
    this.addNode('player');
  }
}
