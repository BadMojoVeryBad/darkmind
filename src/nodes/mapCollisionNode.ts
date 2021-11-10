import { Node, injectable, inject } from 'phaser-node-framework';
import { CONSTANTS } from '../constants';
import { Rectangle, RectangleServiceInterface } from '../services/rectangleServiceInterface';

/**
 * The collision for the level.
 */
@injectable()
export class MapCollisionNode extends Node {
  private collisionRectangles: Array<Phaser.GameObjects.Rectangle> = [];
  private collisionRectangleColliders: Array<Phaser.Physics.Arcade.Collider> = [];

  constructor(@inject('rectangleService') private rectangleService: RectangleServiceInterface) {
    super();
  }

  public create(): void {

  }

  public created(): void {

  }

  public update(time: number): void {
    // Delete last frame's collision.
    for (const collisionRectangle of this.collisionRectangles) {
      collisionRectangle.destroy();
    }
    for (const collisionRectangleCollider of this.collisionRectangleColliders) {
      collisionRectangleCollider.destroy();
    }
    this.collisionRectangles = [];
    this.collisionRectangleColliders = [];

    // Create an array of rectangles and allow other
    // nodes to add to it by listening to and event.
    const rectangles: Array<Rectangle> = [];
    this.scene.events.emit('addRectanglesToMapCollision', rectangles);

    // The bounds to do collision in.
    const cameraBounds = {
      xmin: Math.floor(this.scene.cameras.main.scrollX),
      xmax: Math.floor(this.scene.cameras.main.scrollX + this.scene.width()),
      ymin: Math.floor(this.scene.cameras.main.scrollY),
      ymax: Math.floor(this.scene.cameras.main.scrollY + this.scene.height())
    };

    // Create map collision.
    const negativeRectangles = this.rectangleService.getNegativeSpaceRectangles(cameraBounds, rectangles);
    for (const negativeRectangle of negativeRectangles) {
      const collisionRectangle = this.scene.add.rectangle(negativeRectangle.xmin, negativeRectangle.ymin, negativeRectangle.xmax - negativeRectangle.xmin, negativeRectangle.ymax - negativeRectangle.ymin, 0xffffff, 0.25)
        .setStrokeStyle(1, 0x0000ff)
        .setDepth(1000)
        .setOrigin(0, 0);
        // .setVisible(false);
      this.scene.physics.add.existing(collisionRectangle);
      collisionRectangle.body.checkCollision.right = false;
      collisionRectangle.body.checkCollision.up = false;
      collisionRectangle.body.checkCollision.down = false;
      this.collisionRectangles.push(collisionRectangle);
      // const collisionRectangleCollider = this.scene.physics.add.collider(this.player, collisionRectangle);
      // this.collisionRectangleColliders.push(collisionRectangleCollider);
    }

    // Emit the collison rectanges so stuff can collide with them.
    this.scene.events.emit('calculateMapCollision', this.collisionRectangles);
  }

  public destroy(): void {
    for (const collisionRectangle of this.collisionRectangles) {
      collisionRectangle.destroy();
    }
    this.collisionRectangles = [];
    for (const collisionRectangleCollider of this.collisionRectangleColliders) {
      collisionRectangleCollider.destroy();
    }
    this.collisionRectangleColliders = [];
  }
}
