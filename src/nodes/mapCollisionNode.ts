import { Node, injectable, inject } from 'phaser-node-framework';
import { CONSTANTS } from '../constants';
import { Rectangle, RectangleServiceInterface } from '../services/rectangleServiceInterface';

/**
 * The collision for the level.
 */
@injectable()
export class MapCollisionNode extends Node {
  private debugRectangles: Array<Phaser.GameObjects.Rectangle> = [];
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
    for (const collisionRectangle of this.debugRectangles) {
      collisionRectangle.destroy();
    }
    for (const collisionRectangle of this.collisionRectangles) {
      collisionRectangle.destroy();
    }
    for (const collisionRectangleCollider of this.collisionRectangleColliders) {
      collisionRectangleCollider.destroy();
    }
    this.collisionRectangles = [];
    this.collisionRectangleColliders = [];
    this.debugRectangles = [];

    // Create an array of rectangles and allow other
    // nodes to add to it by listening to and event.
    const rectangles: Array<Rectangle> = [];
    this.scene.events.emit('addRectanglesToMapCollision', rectangles);

    // The bounds to do collision in.
    const cameraBounds = {
      xmin: Math.round(this.scene.cameras.main.scrollX),
      xmax: Math.round(this.scene.cameras.main.scrollX + this.scene.width()),
      ymin: Math.round(this.scene.cameras.main.scrollY),
      ymax: Math.round(this.scene.cameras.main.scrollY + this.scene.height())
    };

    for (const rectangle of rectangles) {
      // this.scene.add.rectangle(negativeRectangle.xmin, negativeRectangle.ymin, negativeRectangle.xmax - negativeRectangle.xmin, negativeRectangle.ymax - negativeRectangle.ymin, 0xffffff, 0.25)
    }

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
      collisionRectangle.body.checkCollision.left = false;

      for (const rectangle of rectangles) {
        // Collide right.
        if ((rectangle.xmin === negativeRectangle.xmax) &&
          (negativeRectangle.ymax > rectangle.ymin && negativeRectangle.ymin < rectangle.ymax)) {
          collisionRectangle.body.checkCollision.right = true;
          this.debugRectangles.push(this.scene.add.rectangle(negativeRectangle.xmax, negativeRectangle.ymin, 2, negativeRectangle.ymax - negativeRectangle.ymin, 0x00ff00, 1).setDepth(1001).setOrigin(0, 0));
        }

        // Collide left.
        if ((rectangle.xmax === negativeRectangle.xmin) &&
          (negativeRectangle.ymax > rectangle.ymin && negativeRectangle.ymin < rectangle.ymax)) {
          collisionRectangle.body.checkCollision.left = true;
          this.debugRectangles.push(this.scene.add.rectangle(negativeRectangle.xmin, negativeRectangle.ymin, 2, negativeRectangle.ymax - negativeRectangle.ymin, 0x00ff00, 1).setDepth(1001).setOrigin(0, 0));
        }

        // Collide up.
        if ((rectangle.ymax === negativeRectangle.ymin) &&
          (negativeRectangle.xmax > rectangle.xmin && negativeRectangle.xmin < rectangle.xmax)) {
          collisionRectangle.body.checkCollision.up = true;
          this.debugRectangles.push(this.scene.add.rectangle(negativeRectangle.xmin, negativeRectangle.ymin, negativeRectangle.xmax - negativeRectangle.xmin, 2, 0x00ff00, 1).setDepth(1001).setOrigin(0, 0));
        }

        // Collide down.
        if ((rectangle.ymin === negativeRectangle.ymax) &&
          (negativeRectangle.xmax > rectangle.xmin && negativeRectangle.xmin < rectangle.xmax)) {
          collisionRectangle.body.checkCollision.down = true;
          this.debugRectangles.push(this.scene.add.rectangle(negativeRectangle.xmin, negativeRectangle.ymax, negativeRectangle.xmax - negativeRectangle.xmin, 2, 0x00ff00, 1).setDepth(1001).setOrigin(0, 0));
        }
      }

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
