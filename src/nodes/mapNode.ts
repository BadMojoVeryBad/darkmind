import { Node, injectable } from 'phaser-node-framework';
import { Rectangle } from './mapCollisionNode';

/**
 * Creates a map from tiled data.
 */
@injectable()
export class MapNode extends Node {
  private name = '';
  private map: Phaser.Tilemaps.Tilemap;
  private mask: Phaser.GameObjects.RenderTexture;

  constructor() {
    super();
  }

  public init(data: Record<string, string>): void {
    this.name = data.name;
  }

  public create(): void {
    // Create map.
    this.map = this.scene.make.tilemap({ key: this.name });
    const tiles = this.map.addTilesetImage('main', 'tiles', 16, 16, 8, 8);
    const collisionLayer = this.map.createLayer('tiles', tiles).setDepth(10);
    // const collisionLayer = this.map.createLayer('collision', tiles).setDepth(10);
    const maskLayer = this.map.createLayer('mask', tiles).setDepth(10);
    maskLayer.setVisible(false);
    // collisionLayer.setCollision([2, 3, 13, 11, 1, 12, 22, 4, 5], true, false);

    // Create a mask that shows only 'land' tiles.
    this.mask = this.scene.add.renderTexture(0, 0, 400, 1600);
    this.mask.setVisible(false);
    maskLayer.forEachTile((tile: Phaser.Tilemaps.Tile) => {
      if (tile.index >= 0) {
        const image = tiles.image;
        const coordinates = tiles.getTileTextureCoordinates(tile.index) as ({ x: number, y: number } | null);
        image.add('mask' + tile.index, 0, coordinates.x, coordinates.y, 16, 16);
        this.mask.draw(this.scene.make.image({
          x: (tile.x * 16) + 8,
          y: (tile.y * 16) + 8,
          key: image,
          frame: 'mask' + tile.index,
          add: true
        }));
      }
    });

    // Debug graphics.
    // const debugGraphics = this.scene.add.graphics();
    // debugGraphics.setScale(1);
    // debugGraphics.setDepth(1000);
    // const style: Phaser.Types.Tilemaps.StyleConfig = {
    //     tileColor: null,
    //     collidingTileColor: new Phaser.Display.Color(255, 98, 0, 50),
    //     faceColor: new Phaser.Display.Color(255, 98, 0, 150)
    // };
    // this.map.renderDebug(debugGraphics, style, 'tiles');

    // Listen.
    this.scene.events.on('addRectanglesToMapCollision', (rectangles: Array<Rectangle>) => {
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
    });
  }

  public created(): void {
    // Emit the mask so that others can add to it.
    this.scene.events.emit('maskRenderTextureCreated', this.mask);

    // Create a mask with the render texture and emit it.
    this.scene.events.emit('maskCreated', this.mask.createBitmapMask());

    // Emit the map so other nodes can use it.
    this.scene.events.emit('mapCreated', this.map);

    // Add nodes dynamically based on what's in the tiled map.
    const objects: Phaser.Types.Tilemaps.TiledObject[] = this.map.getObjectLayer('objects').objects;
    for (const obj of objects) {
      this.scene.events.emit(obj.name, obj);
      this.addNode(obj.name, {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        obj: obj
      });
    }
  }

  public destroy(): void {
    // TODO: Destroy map objects properly.
    this.map.destroy();
  }
}
