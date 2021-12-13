import { Node, injectable } from 'phaser-node-framework';
import { ColorShader } from '../shaders/colorShader';
import { PlayerNode } from './playerNode';

/**
 * The camera that follows the player in-game.
 */
@injectable()
export class CameraNode extends Node {
  private fade: number = 1;
  private fadeTarget: number = 1;

  public create(): void {
    // Listen to events.
    this.scene.events.on('playerCreated', this.onPlayerCreated, this);
    this.scene.events.on('onMapCreated', this.onMapCreated, this);

    this.scene.cameras.main.setPostPipeline(['colorShader']);
    let pipelineInstance = this.scene.cameras.main.getPostPipeline(ColorShader);
    (pipelineInstance as ColorShader).setFadeAmount(this.fade);

    this.scene.events.on('camera.fade_in', () => {
      this.fadeTarget = 0;
    });

    this.scene.events.on('camera.fade_out', () => {
      this.fadeTarget = 1;
    });

    this.scene.events.emit('camera.fade_in');
  }

  public destroy(): void {
    // Remove event listeners.
    this.scene.events.off('playerCreated', this.onPlayerCreated, this);
    this.scene.events.off('onMapCreated', this.onMapCreated, this);
  }

  public update(): void {
    this.fade = Phaser.Math.Linear(this.fade, this.fadeTarget, 0.15);
    let pipelineInstance = this.scene.cameras.main.getPostPipeline(ColorShader);
    (pipelineInstance as ColorShader).setFadeAmount(this.fade);
}

  private onPlayerCreated(player: PlayerNode): void {
    this.scene.cameras.main.setZoom(1);
    this.scene.cameras.main.startFollow(player.getSprite(), false, 0.05, 0.05, 0, 0);
  }

  private onMapCreated(map: Phaser.Tilemaps.Tilemap): void {
    this.scene.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }
}
