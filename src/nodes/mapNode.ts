import { Node, injectable } from 'phaser-node-framework';
import { Rectangle } from './mapCollisionNode';

/**
 * Creates a map from tiled data.
 */
@injectable()
export class MapNode extends Node {
  private name = '';
  private map: Phaser.Tilemaps.Tilemap;
  private maskImages: Phaser.GameObjects.Image[] = [];
  private mapMask: Phaser.GameObjects.RenderTexture;

  public destroy(): void {
    this.map.destroy();
    this.mapMask.destroy();
    for (const image of this.maskImages) {
      image.destroy();
    }
    this.scene.events.off('onMapCollisionRectanglesCreated', this.onMapCollisionRectanglesCreated, this);
    this.scene.events.off('onMaskGroupCreated', this.onMaskGroupCreated, this);
  }

  public init(data: Record<string, string>): void {
    this.name = data.name;
  }

  public create(): void {
    // Create map.
    this.map = this.scene.make.tilemap({ key: this.name });
    const tiles = this.map.addTilesetImage('main', 'tiles', 16, 16, 8, 8);
    const collisionLayer = this.map.createLayer('tiles', tiles).setDepth(10);
    const maskLayer = this.map.createLayer('mask', tiles).setDepth(10);
    maskLayer.setVisible(false);
    collisionLayer.setCollision([2, 3, 13, 11, 1, 12, 22, 4, 5]);

    // Create images for each of the mask tiles.
    this.mapMask = this.scene.add.renderTexture(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.mapMask.setDepth(1001).setVisible(false);
    maskLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.index >= 0) {
        const image = tiles.image;
        const coordinates = tiles.getTileTextureCoordinates(tile.index) as ({ x: number, y: number } | null);
        image.add('mask' + tile.index, 0, coordinates.x, coordinates.y, 16, 16);
        const newImage = this.scene.make.image({
          x: (tile.x * 16) + 8,
          y: (tile.y * 16) + 8,
          key: image,
          frame: 'mask' + tile.index,
          add: true
        });
        this.maskImages.push(newImage);
        this.mapMask.draw(newImage);
      }
    });

    // Listen.
    this.scene.events.on('onMaskGroupCreated', this.onMaskGroupCreated, this);

    this.scene.events.on('onMapCollisionRectanglesCreated', this.onMapCollisionRectanglesCreated, this);
  }

  public created(): void {
    // Add nodes dynamically based on what's in the tiled map.
    const objects: Phaser.Types.Tilemaps.TiledObject[] = this.map.getObjectLayer('objects').objects;
    for (const obj of objects) {
      this.addNode(obj.name, {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        obj: obj
      });
    }

    const events: Phaser.Types.Tilemaps.TiledObject[] = this.map.getObjectLayer('events').objects;
    for (const ev of events) {
      this.scene.events.emit(ev.name, ev);
    }

    // Emit the map so other nodes can use it.
    this.scene.events.emit('onMapCreated', this.map);

    this.scene.events.emit('onMapMaskCreated', this.mapMask.createBitmapMask());
  }

  private onMapCollisionRectanglesCreated(rectangles: Array<Rectangle>): void {
    if (this.map.getLayer('tiles')) {
      const collisionLayer = this.map.getLayer('tiles').tilemapLayer;
      collisionLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
        if ([2, 3, 13, 11, 1, 12, 22, 4, 5].includes(tile.index)) {
          rectangles.push({
            xmin: Math.round((tile.x * 16)),
            ymin: Math.round((tile.y * 16)),
            xmax: Math.round((tile.x * 16) + 16),
            ymax: Math.round((tile.y * 16) + 16)
          });
        }
      });
    }
  }

  private onMaskGroupCreated(group: Phaser.GameObjects.Group): void {
    group.addMultiple(this.maskImages);
  }
}
