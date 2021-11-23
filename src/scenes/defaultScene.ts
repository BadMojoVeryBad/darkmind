import { Scene } from 'phaser-node-framework';

export class DefaultScene extends Scene {
  public init(): void {
    this.addNode('camera');
    this.addNode('map', { name: 'debugMap' });
    this.addNode('mapCollision');
    this.addNode('mapMask');
    this.addNode('player');
  }
}
