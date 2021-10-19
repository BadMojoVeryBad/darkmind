
import { Component, injectable } from 'phaser-component-framework';

/**
 * The camera that follows the player in-game.
 */
@injectable()
export class CameraComponent extends Component {
  constructor() {
    super();
  }

  public create(): void {
    // Listen to events.
    this.scene.events.on('playerCreated', (player: Phaser.Physics.Arcade.Sprite) => {
      // Set camera to follow player.
      this.scene.cameras.main.setZoom(1);
      this.scene.cameras.main.startFollow(player);
      this.scene.cameras.main.setLerp(0.05);
    });
  }
}
