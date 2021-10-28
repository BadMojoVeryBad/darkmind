import { Node, injectable } from 'phaser-node-framework';

/**
 * Creates a map from tiled data.
 */
@injectable()
export class MapNode extends Node {
  private name = '';
  private map: Phaser.Tilemaps.Tilemap;
  private collider: Phaser.Physics.Arcade.Collider;
  private mask: Phaser.GameObjects.RenderTexture;

  constructor() {
    super();
  }

  public init(data: Record<string, string>) {
    this.name = data.name;
  }

  public create(): void {
    this.map = this.scene.make.tilemap({ key: this.name });
    const tiles = this.map.addTilesetImage('main', 'tiles', 16, 16, 8, 8);
    const tilesLayer = this.map.createLayer('tiles', tiles).setDepth(10);
    const collisionLayer = this.map.createLayer('collision', tiles).setDepth(10);
    const maskLayer = this.map.createLayer('mask', tiles).setDepth(10);
    collisionLayer.setVisible(false);
    maskLayer.setVisible(false);
    collisionLayer.setCollision([6]);

    this.scene.events.on('playerCreated', (player: Phaser.Physics.Arcade.Sprite) => {
      this.collider = this.scene.physics.add.collider(player, collisionLayer);
      this.scene.events.emit('playerMapColliderCreated', this.collider);
    });

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
    // this.map.renderDebug(debugGraphics, style, 'collision');

    // Fire the events of the map.
    const events: Phaser.Types.Tilemaps.TiledObject[] = this.map.getObjectLayer('objects').objects;
    for (const event of events) {
      this.scene.events.emit(event.name, event);
      this.addNode(event.name, {
        x: event.x,
        y: event.y,
        width: event.width,
        height: event.height
      });
    }

    this.scene.events.emit('mapCreated', this.map);
  }

  public created(): void {
    // Emit the mask so that others can add to it.
    this.scene.events.emit('maskRenderTextureCreated', this.mask);

    // Create a mask with the render texture and emit it.
    this.scene.events.emit('maskCreated', this.mask.createBitmapMask());
  }

  public destroy(): void {
    this.map.destroy();
  }
}
