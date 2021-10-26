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
  }

  public destroy(): void {
    // Remove event listeners.
    this.scene.events.off('playerCreated', this.onPlayerCreated, this);
  }

  private onPlayerCreated(player: Phaser.Physics.Arcade.Sprite): void {
    this.scene.cameras.main.setZoom(1);
    this.scene.cameras.main.startFollow(player);
    this.scene.cameras.main.setLerp(0.05);
  }
}
