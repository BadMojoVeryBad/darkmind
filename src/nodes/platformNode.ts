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
  private startOffset: number;
  private idleTime: number;
  private unpaused = false;
  private tween: Phaser.Tweens.Tween;

  public destroy(): void {
    this.sprite.destroy();
    this.particles.destroy();
    this.maskSprite.destroy();
    this.scene.events.off('onMaskGroupCreated', this.onMaskGroupCreated, this);
    this.scene.events.off('onMapCollisionRectanglesCreated', this.onMapCollisionRectanglesCreated, this);
    this.scene.events.off('onAttachableToPlatformCreated', this.onAttachableToPlatformCreated, this);
    this.scene.events.off('onMapMaskCreated', this.onMapMaskCreated, this);
  }

  constructor(@inject('tilemapService') private tilemapService: TilemapStrategyInterface) {
    super();
  }

  public init(data: Record<string, unknown>): void {
    this.x = data.x as number + 8;
    this.y = data.y as number - 8;
    this.idleTime = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'idleTime', 2000);
    this.startOffset = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'startOffset', 0);
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
    this.scene.events.on('onMaskGroupCreated', this.onMaskGroupCreated, this);

    // Collision.
    this.scene.events.on('onMapCollisionRectanglesCreated', this.onMapCollisionRectanglesCreated, this);

    // Player stick to platform as it moves.
    this.scene.events.on('onAttachableToPlatformCreated', this.onAttachableToPlatformCreated, this);

    // Hide behind map.
    this.scene.events.on('onMapMaskCreated', this.onMapMaskCreated, this);

    this.scene.events.on('unpause', () => {
      this.unpaused = true;
    });
  }

  public created(): void {
    this.scene.events.emit('onPlatformCreated', this);
  }

  public update(time: number): void {
    if (this.unpaused) {
      this.sprite.x = this.x;
      this.sprite.y = this.y;
      this.maskSprite.x = this.x;
      this.maskSprite.y = this.y;
      this.isTweening = false;
      if (this.tween) {
        this.tween.remove();
      }
      this.lastMovedTime = time + this.startOffset;
      this.lastdisappearedTime = time + this.startOffset;
      this.unpaused = false;
    }

    if (this.moveTime && !this.isTweening) {
      if (time > this.lastMovedTime + this.idleTime - 500) {
        this.sprite.anims.play('platformWiggling', true);
        this.maskSprite.anims.play('platformWigglingMask', true);
      }

      if (time > this.lastMovedTime + this.idleTime) {
        this.lastMovedTime = this.lastMovedTime + this.idleTime + this.moveTime;
        this.sprite.anims.play('platformIdle', true);
        this.maskSprite.anims.play('platformIdleMask', true);
        this.isTweening = true;
        if (this.x === this.sprite.x && this.y === this.sprite.y) {
          this.tween = this.scene.tweens.add({
            targets: [ this.sprite, this.maskSprite ],
            duration: this.moveTime,
            x: this.moveX,
            y: this.moveY,
            onComplete: () => {
              this.isTweening = false;
              this.tween.remove();
            }
          });
        } else {
          this.tween = this.scene.tweens.add({
            targets: [ this.sprite, this.maskSprite ],
            duration: this.moveTime,
            x: this.x,
            y: this.y,
            onComplete: () => {
              this.isTweening = false;
              this.tween.remove();
            }
          });
        }
      }
    }

    if (this.disappearTime) {
      const offsetAmount = (this.isTransparent) ? this.disappearTime : this.idleTime;

      if (time > this.lastdisappearedTime + this.idleTime - 500 && !this.isTransparent) {
        this.sprite.anims.play('platformWiggling', true);
        this.maskSprite.anims.play('platformWigglingMask', true);
      }

      if (time > this.lastdisappearedTime + offsetAmount) {
        this.lastdisappearedTime = this.lastdisappearedTime + offsetAmount;

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

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  public isPlatformTransparent(): boolean {
    return this.isTransparent;
  }

  public isPlatformMoving(): boolean {
    return this.isTweening;
  }

  private onMaskGroupCreated(group: Phaser.GameObjects.Group): void {
    if (!this.isTransparent) {
      group.add(this.maskSprite);
    }
  }

  private onMapCollisionRectanglesCreated(rectangles: Array<Rectangle>): void {
    if (!this.isTransparent) {
      rectangles.push({
        xmin: Math.round(this.sprite.x - 8),
        ymin: Math.round(this.sprite.y - 8),
        xmax: Math.round(this.sprite.x + 8),
        ymax: Math.round(this.sprite.y + 8)
      });
    }
  }

  private onAttachableToPlatformCreated(gameObject: Phaser.Physics.Arcade.Sprite): void {
    this.attachableObjects.push({
      sprite: gameObject,
      isAttached: false
    });
  }

  private onMapMaskCreated(mask: Phaser.Display.Masks.BitmapMask): void {
    mask.invertAlpha = true;
    this.sprite.setMask(mask);
  }
}
