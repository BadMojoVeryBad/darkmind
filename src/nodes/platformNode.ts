import { Node, injectable, inject } from 'phaser-node-framework';
import { TilemapStrategyInterface } from '../services/tilemapServiceInterface';
import { Rectangle } from './mapCollisionNode';

type AttachableObject = {
  sprite: Phaser.Physics.Arcade.Sprite,
  isAttached: boolean
};

/**
 * The platforms the player jumps to.
 */
@injectable()
export class PlatformNode extends Node {
  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private sprite: Phaser.Physics.Arcade.Sprite;
  private maskSprite: Phaser.GameObjects.Sprite;
  private x: number;
  private y: number;
  private moveTime = 0;
  private moveX = 0;
  private moveY = 0;
  private lastMovedTime = 0;
  private disappearTime = 0;
  private lastdisappearedTime = 0;
  private isTweening = false;
  private isTransparent = false;
  private prevPosition = new Phaser.Math.Vector2();
  private attachableObjects: AttachableObject[] = [];

  constructor(@inject('tilemapService') private tilemapService: TilemapStrategyInterface) {
    super();
  }

  public init(data: Record<string, unknown>): void {
    this.x = data.x as number + 8;
    this.y = data.y as number - 8;
    this.lastdisappearedTime = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'startOffset', 0);
    this.lastMovedTime = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'startOffset', 0);
    this.disappearTime = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'disappearTime', 0);
    this.moveTime = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'moveTime', 0);
    this.moveX = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'moveX', 0) + 8;
    this.moveY = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'moveY', 0) - 8;
  }

  public create(): void {
    this.sprite = this.scene.physics.add.sprite(this.x, this.y, 'textures', 'platformIdle1');
    this.sprite.body.immovable = true;
    this.sprite.anims.play('platformIdle');
    this.sprite.setDepth(10);
    this.sprite.body.setSize(16, 16);
    this.maskSprite = this.scene.add.sprite(this.x, this.y, 'textures', 'platformIdle1');
    this.maskSprite.anims.play('platformIdleMask');

    const multiplier = (16 * 16) / 128;
    this.particles = this.scene.add.particles('textures', 'darkPixel');
    this.emitter = this.particles.createEmitter({
      alpha: 1,
      speed: { max: 0.5, min: 0.1 },
      gravityY: 3,
      quantity: 0.2 * multiplier,
      frequency: 200,
      lifespan: 3000,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(0, 0, 16, 16),
        quantity: 1,
        stepRate: 0,
        yoyo: false,
        seamless: true,
      },
    });

    this.emitter.setPosition(this.x, this.y);
    this.emitter.start();
    this.particles.setDepth(5);

    // Light mask.
    this.scene.events.on('drawMaskRenderTexture', (mask: Phaser.GameObjects.RenderTexture) => {
      if (!this.isTransparent) {
        mask.draw(this.maskSprite);
      }
    });

    // Collision.
    this.scene.events.on('addRectanglesToMapCollision', (rectangles: Array<Rectangle>) => {
      if (!this.isTransparent) {
        rectangles.push({
          xmin: Math.round(this.sprite.x - 8),
          ymin: Math.round(this.sprite.y - 8),
          xmax: Math.round(this.sprite.x + 8),
          ymax: Math.round(this.sprite.y + 8)
        });
      }
    });

    // Player stick to platform as it moves.
    this.scene.events.on('stickToPlatform', (gameObject: Phaser.Physics.Arcade.Sprite) => {
      this.attachableObjects.push({
        sprite: gameObject,
        isAttached: false
      });
    });
  }

  public update(time: number): void {
    if (this.moveTime && !this.isTweening) {
      if (time > this.lastMovedTime + this.moveTime - 500) {
        this.sprite.anims.play('platformWiggling', true);
        this.maskSprite.anims.play('platformWigglingMask', true);
      }

      if (time > this.lastMovedTime + this.moveTime) {
        this.lastMovedTime = this.lastMovedTime + this.moveTime;
        this.sprite.anims.play('platformIdle', true);
        this.maskSprite.anims.play('platformIdleMask', true);
        this.isTweening = true;
        if (this.x === this.sprite.x && this.y === this.sprite.y) {
          const tween = this.scene.tweens.add({
            targets: [ this.sprite, this.maskSprite ],
            duration: 500,
            x: this.moveX,
            y: this.moveY,
            onComplete: () => {
              this.isTweening = false;
              tween.remove();
            }
          });
        } else {
          const tween = this.scene.tweens.add({
            targets: [ this.sprite, this.maskSprite ],
            duration: 500,
            x: this.x,
            y: this.y,
            onComplete: () => {
              this.isTweening = false;
              tween.remove();
            }
          });
        }
      }
    }

    if (this.disappearTime) {
      if (time > this.lastdisappearedTime + this.disappearTime - 500 && !this.isTransparent) {
        this.sprite.anims.play('platformWiggling', true);
        this.maskSprite.anims.play('platformWigglingMask', true);
      }

      if (time > this.lastdisappearedTime + this.disappearTime) {
        this.lastdisappearedTime = this.lastdisappearedTime + this.disappearTime;
        if (this.isTransparent) {
          this.sprite.anims.play('platformIdle', true);
          this.maskSprite.anims.play('platformIdleMask', true);
        } else {
          this.sprite.anims.stop();
          this.sprite.setTexture('textures', 'platformTransparent');
          this.maskSprite.anims.stop();
        }

        this.isTransparent = !this.isTransparent;
      }
    }

    // Move attached objects.
    if (!this.isTransparent) {
      for (const gameObject of this.attachableObjects) {
        if (gameObject.isAttached) {
          // Move the object with the platform.
          gameObject.sprite.y += this.sprite.y - this.prevPosition.y;
          gameObject.sprite.x += this.sprite.x - this.prevPosition.x;
          const overlap = this.scene.physics.overlap(gameObject.sprite, this.sprite);

          // Detach if the object is not colliding even after
          // moving with the platform.
          if (!overlap) {
            gameObject.isAttached = false;
          }
        } else {
          // Attach the object if it collides with the platform.
          const overlap = this.scene.physics.overlap(gameObject.sprite, this.sprite);
          if (overlap) {
            gameObject.isAttached = true;
          }
        }
      }
    }

    this.prevPosition.x = this.sprite.x;
    this.prevPosition.y = this.sprite.y;

    this.emitter.setPosition(this.sprite.x - 8, this.sprite.y);
  }

  public destroy(): void {
    // TODO: Destroy objects and listeners.
    this.sprite.destroy();
    this.particles.destroy();
  }
}
