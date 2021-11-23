import { Node, injectable } from 'phaser-node-framework';

export type Rectangle = {
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number
};

export type CollisionRectangle = {
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  direction: 'left'|'right'|'up'|'down'
};

/**
 * The collision for the level.
 */
@injectable()
export class MapCollisionNode extends Node {
  private collisionRectangles: Array<Phaser.GameObjects.Rectangle> = [];

  public destroy(): void {
    this.collisionRectangles.forEach(rectangle => rectangle.destroy());
    this.collisionRectangles = [];
  }

  public update(): void {
    // Delete last frame's collision.
    this.collisionRectangles.forEach(rectangle => rectangle.destroy());
    this.collisionRectangles = [];

    // Create an array of rectangles and allow other
    // nodes to add to it by listening to and event.
    const rectangles: Array<Rectangle> = [];
    this.scene.events.emit('onMapCollisionRectanglesCreated', rectangles);

    // This giant loop goes through all the rectangles that require collision
    // around them. It checks if any are touching each other and creates edges
    // accordingly. That is, if two rectangles are touching to form a larger
    // shape, it will create collision around that larger shape.
    //
    // We also check to see which direction each edge should collide on. The
    // collision directions face inwards to the rectangles. E.g. The left side
    // of a rectangle will collide right.
    let collisionRectangles: CollisionRectangle[] = [];
    for (const rectangle of rectangles) {
      let tempCollisionRectangles: CollisionRectangle[] = [];

      const collisionAll = {
        up: false,
        down: false,
        left: false,
        right: false
      };

      const coveredLength = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
      };

      for (const comparisonRectangle of rectangles) {
        const collision = {
          up: false,
          down: false,
          left: false,
          right: false
        };

        // Do simple checks first for efficiency.
        collision.left = ((rectangle.xmin === comparisonRectangle.xmax) && (comparisonRectangle.ymax > rectangle.ymin && comparisonRectangle.ymin < rectangle.ymax));
        collision.right = ((rectangle.xmax === comparisonRectangle.xmin) && (comparisonRectangle.ymax > rectangle.ymin && comparisonRectangle.ymin < rectangle.ymax));
        collision.down = ((rectangle.ymax === comparisonRectangle.ymin) && (comparisonRectangle.xmax > rectangle.xmin && comparisonRectangle.xmin < rectangle.xmax));
        collision.up = ((rectangle.ymin === comparisonRectangle.ymax) && (comparisonRectangle.xmax > rectangle.xmin && comparisonRectangle.xmin < rectangle.xmax));

        // Add to all collisions.
        collisionAll.left = collisionAll.left || collision.left;
        collisionAll.right = collisionAll.right || collision.right;
        collisionAll.up = collisionAll.up || collision.up;
        collisionAll.down = collisionAll.down || collision.down;

        // If there is a collision. create collision rectangles for partial edges.
        if (collision.left) {
          if (comparisonRectangle.ymax - rectangle.ymax > 0) {
            coveredLength.right += comparisonRectangle.ymax - rectangle.ymax;
            tempCollisionRectangles.push({
              xmin: rectangle.xmin - 2,
              xmax: rectangle.xmin,
              ymin: rectangle.ymin,
              ymax: comparisonRectangle.ymin,
              direction: 'right'
            });
          }

          if (rectangle.ymin - comparisonRectangle.ymin > 0) {
            coveredLength.right += rectangle.ymin - comparisonRectangle.ymin;
            tempCollisionRectangles.push({
              xmin: rectangle.xmin - 2,
              xmax: rectangle.xmin,
              ymin: comparisonRectangle.ymax,
              ymax: rectangle.ymax,
              direction: 'right'
            });
          }
        }

        if (collision.right) {
          if (comparisonRectangle.ymax - rectangle.ymax > 0) {
            coveredLength.left += comparisonRectangle.ymax - rectangle.ymax;
            tempCollisionRectangles.push({
              xmin: rectangle.xmax,
              xmax: rectangle.xmax + 2,
              ymin: rectangle.ymin,
              ymax: comparisonRectangle.ymin,
              direction: 'left'
            });
          }

          if (rectangle.ymin - comparisonRectangle.ymin > 0) {
            coveredLength.left += rectangle.ymin - comparisonRectangle.ymin;
            tempCollisionRectangles.push({
              xmin: rectangle.xmax,
              xmax: rectangle.xmax + 2,
              ymin: comparisonRectangle.ymax,
              ymax: rectangle.ymax,
              direction: 'left'
            });
          }
        }

        if (collision.up) {
          if (rectangle.xmin - comparisonRectangle.xmin > 0) {
            coveredLength.down += rectangle.xmin - comparisonRectangle.xmin;
            tempCollisionRectangles.push({
              xmin: comparisonRectangle.xmax,
              xmax: rectangle.xmax,
              ymin: rectangle.ymin - 2,
              ymax: rectangle.ymin,
              direction: 'down'
            });
          }

          if (comparisonRectangle.xmin - rectangle.xmin > 0) {
            coveredLength.down += comparisonRectangle.xmin - rectangle.xmin;
            tempCollisionRectangles.push({
              xmin: rectangle.xmin,
              xmax: comparisonRectangle.xmin,
              ymin: rectangle.ymin - 2,
              ymax: rectangle.ymin,
              direction: 'down'
            });
          }
        }

        if (collision.down) {
          if (rectangle.xmin - comparisonRectangle.xmin > 0) {
            coveredLength.up += rectangle.xmin - comparisonRectangle.xmin;
            tempCollisionRectangles.push({
              xmin: comparisonRectangle.xmax,
              xmax: rectangle.xmax,
              ymin: rectangle.ymax,
              ymax: rectangle.ymax + 2,
              direction: 'up'
            });
          }

          if (comparisonRectangle.xmin - rectangle.xmin > 0) {
            coveredLength.up += comparisonRectangle.xmin - rectangle.xmin;
            tempCollisionRectangles.push({
              xmin: rectangle.xmin,
              xmax: comparisonRectangle.xmin,
              ymin: rectangle.ymax,
              ymax: rectangle.ymax + 2,
              direction: 'up'
            });
          }
        }
      }

      // If the partial collisions add up to a full collision, remove all the collision
      // rectangle for that side.
      if (coveredLength.down === rectangle.ymax - rectangle.ymin) {
        tempCollisionRectangles = tempCollisionRectangles.filter(rec => rec.direction !== 'down');
      }

      if (coveredLength.up === rectangle.ymax - rectangle.ymin) {
        tempCollisionRectangles = tempCollisionRectangles.filter(rec => rec.direction !== 'up');
      }

      if (coveredLength.left === rectangle.xmax - rectangle.xmin) {
        tempCollisionRectangles = tempCollisionRectangles.filter(rec => rec.direction !== 'left');
      }

      if (coveredLength.right === rectangle.xmax - rectangle.xmin) {
        tempCollisionRectangles = tempCollisionRectangles.filter(rec => rec.direction !== 'right');
      }

      // If there's no collisions at all, create a collision rectangle for the full edge.
      if (!collisionAll.left) {
        tempCollisionRectangles.push({
          xmin: rectangle.xmin - 2,
          xmax: rectangle.xmin,
          ymin: rectangle.ymin,
          ymax: rectangle.ymax,
          direction: 'right'
        });
      }

      if (!collisionAll.right) {
        tempCollisionRectangles.push({
          xmin: rectangle.xmax,
          xmax: rectangle.xmax + 2,
          ymin: rectangle.ymin,
          ymax: rectangle.ymax,
          direction: 'left'
        });
      }

      if (!collisionAll.up) {
        tempCollisionRectangles.push({
          xmin: rectangle.xmin,
          xmax: rectangle.xmax,
          ymin: rectangle.ymin - 2,
          ymax: rectangle.ymin,
          direction: 'down'
        });
      }

      if (!collisionAll.down) {
        tempCollisionRectangles.push({
          xmin: rectangle.xmin,
          xmax: rectangle.xmax,
          ymin: rectangle.ymax,
          ymax: rectangle.ymax + 2,
          direction: 'up'
        });
      }

      collisionRectangles.push(...tempCollisionRectangles);
    }

    // Now we create a physics object for each one. Phaser's typings aren't
    // great with physics bodies, so we ts-ignore some stuff in here.
    for (const collisionRectangle of collisionRectangles) {
      let collisionRectangleSprite = this.scene.add.rectangle(collisionRectangle.xmin, collisionRectangle.ymin, collisionRectangle.xmax - collisionRectangle.xmin, collisionRectangle.ymax - collisionRectangle.ymin, 0x00ff00, 1).setDepth(1001).setOrigin(0, 0).setVisible(false);
      collisionRectangleSprite = this.scene.physics.add.existing(collisionRectangleSprite, true);
      // @ts-ignore
      collisionRectangleSprite.body.checkCollision.down = collisionRectangle.direction === 'down';
      // @ts-ignore
      collisionRectangleSprite.body.checkCollision.up = collisionRectangle.direction === 'up';
      // @ts-ignore
      collisionRectangleSprite.body.checkCollision.left = collisionRectangle.direction === 'left';
      // @ts-ignore
      collisionRectangleSprite.body.checkCollision.right = collisionRectangle.direction === 'right';
      this.collisionRectangles.push(collisionRectangleSprite);
    }

    // Emit the collison rectanges so stuff can collide with them.
    this.scene.events.emit('onMapCollisionCalculated', this.collisionRectangles);
  }
}
