import { Node, injectable } from 'phaser-node-framework';
import { PlayerNode } from './playerNode';

/**
 * The camera that follows the player in-game.
 */
@injectable()
export class CameraNode extends Node {
  public create(): void {
    // Listen to events.
    this.scene.events.on('playerCreated', this.onPlayerCreated, this);
    this.scene.events.on('onMapCreated', this.onMapCreated, this);
  }

  public destroy(): void {
    // Remove event listeners.
    this.scene.events.off('playerCreated', this.onPlayerCreated, this);
    this.scene.events.off('onMapCreated', this.onMapCreated, this);
  }

  private onPlayerCreated(player: PlayerNode): void {
    this.scene.cameras.main.setZoom(1);
    this.scene.cameras.main.startFollow(player.getSprite(), false, 0.05, 0.05, 0, 0);
    this.scene.cameras.main.setPostPipeline('colorShader');
  }

  private onMapCreated(map: Phaser.Tilemaps.Tilemap): void {
    this.scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
