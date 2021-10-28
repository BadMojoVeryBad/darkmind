import { Node, injectable } from 'phaser-node-framework';

/**
 * The camera that follows the player in-game.
 */
@injectable()
export class CameraNode extends Node {
  constructor() {
    super();
  }

  public create(): void {
    // Listen to events.
    this.scene.events.on('playerCreated', this.onPlayerCreated, this);
    this.scene.events.on('mapCreated', this.onMapCreated, this);
  }

  public destroy(): void {
    // Remove event listeners.
    this.scene.events.off('playerCreated', this.onPlayerCreated, this);
    this.scene.events.off('mapCreated', this.onMapCreated, this);
  }

  private onPlayerCreated(player: Phaser.Physics.Arcade.Sprite): void {
    this.scene.cameras.main.setZoom(1);
    this.scene.cameras.main.startFollow(player);
    this.scene.cameras.main.setLerp(0.05);
  }

  private onMapCreated(map: Phaser.Tilemaps.Tilemap): void {
    this.scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
