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
export class MapCollisionNode extends Node {
  private maskRectangles: Phaser.GameObjects.Rectangle[] = [];
  private mask: Phaser.GameObjects.RenderTexture;

  public destroy(): void {
    // TODO: Destroy objects an listeners.
  }

  public create(): void {
    this.mask = this.scene.add.renderTexture(0, 0, 400, 1600);
    this.mask.setVisible(false);

    this.scene.events.on('mapCreated', (map: Phaser.Tilemaps.Tilemap) => {
      this.mask = this.scene.add.renderTexture(0, 0, map.widthInPixels, map.heightInPixels);
      this.mask.setVisible(false);
      this.scene.events.emit('maskRenderTextureCreated');
    });
  }

  public update(): void {
    if (!this.mask) {
      return;
    }

    // Delete last frame's mask.
    this.maskRectangles.forEach(rectangle => rectangle.destroy());
    this.maskRectangles = [];
    this.mask.clear();

    // Create an array of rectangles and allow other
    // nodes to add to it by listening to and event.
    const rectangles: Array<Rectangle> = [];
    this.scene.events.emit('addRectanglesToMapMask', rectangles);

    // Add the rectangles to the render texture.
    for (const rectangle of rectangles) {
      const maskRectangle = this.scene.add.rectangle(rectangle.xmin, rectangle.ymin, rectangle.xmax - rectangle.xmin, rectangle.ymax - rectangle.ymin, 0x000000)
        .setVisible(false);

      this.mask.draw(maskRectangle);
      this.maskRectangles.push(maskRectangle);
    }
  }
}
