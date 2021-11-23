import { Node, injectable } from 'phaser-node-framework';

export type Rectangle = {
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number
};

/**
 * The mask for the level.
 */
@injectable()
export class MapMaskNode extends Node {
  private mask: Phaser.GameObjects.RenderTexture;
  private group: Phaser.GameObjects.Group;

  public destroy(): void {
    this.mask.destroy();
    this.group.destroy();
  }

  public create(): void {
    this.mask = this.scene.add.renderTexture(0, 0, 400, 1600);
    this.mask.setVisible(false);

    this.scene.events.on('onMapCreated', (map: Phaser.Tilemaps.Tilemap) => {
      this.mask = this.scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels);
      this.mask.setVisible(false);
      this.mask.setDepth(1000);
      this.scene.events.emit('maskRenderTextureCreated', this.mask.createBitmapMask());
    });

    this.group = this.scene.make.group({});
  }

  public update(): void {
    if (!this.mask) {
      return;
    }

    // Delete last frame's mask and remake it.
    this.group.destroy();
    this.group = this.scene.make.group({});
    this.scene.events.emit('onMaskGroupCreated', this.group);
    this.mask.clear();
    this.mask.beginDraw();
    this.mask.batchDraw(this.group);
    this.mask.endDraw();
  }
}
