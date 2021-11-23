import { Node, injectable } from 'phaser-node-framework';

/**
 * The light particles that follow the player.
 */
@injectable()
export class LightParticles extends Node {
  private follow: Phaser.GameObjects.Sprite;
  private lightParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private lightEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private maskGraphics: Phaser.GameObjects.Graphics;

  public destroy(): void {
    this.scene.events.off('postupdate', this.onPostUpdate, this);
    this.lightParticles.destroy();
    this.maskGraphics.destroy();
  }

  public init(data: Record<string, unknown>): void {
    this.follow = data.follow as Phaser.GameObjects.Sprite;
  }

  public create(): void {
    this.lightParticles = this.scene.add.particles('textures', 'lightestPixel');
    this.lightParticles.setDepth(40);

    this.lightEmitter = this.lightParticles.createEmitter({
      alpha: 1,
      speedX: { min: 0, max: 0 },
      speedY: { min: -10, max: -10 },
      gravityY: 0,
      quantity: 1,
      frequency: 100,
      lifespan: 10000,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-64, -64, 128, 128),
        quantity: 20,
        stepRate: 0,
        yoyo: false,
        seamless: true,
      },
    });

    this.lightEmitter.start();
    this.lightEmitter.setPosition(0, 0);
    this.lightEmitter.setScrollFactor(1);
    this.maskGraphics = this.scene.make.graphics({
      lineStyle: {
        width: 0,
        color: 0xffffff,
        alpha: 1
      },
      fillStyle: {
        color: 0x000000,
        alpha: 1
      },
    });

    this.scene.events.on('postupdate', this.onPostUpdate, this);
  }

  private onPostUpdate() {
    this.lightEmitter.setPosition(this.follow.x, this.follow.y);
    this.maskGraphics.clear();
    this.maskGraphics.fillCircle(this.follow.x, this.follow.y + 4, 20);
    this.lightEmitter.setMask(this.maskGraphics.createGeometryMask());
  }
}
