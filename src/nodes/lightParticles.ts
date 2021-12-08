import { Node, injectable } from 'phaser-node-framework';

/**
 * The light particles that follow the player.
 */
@injectable()
export class LightParticles extends Node {
  private follow: Phaser.GameObjects.Sprite;
  private lightParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private lightEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  public destroy(): void {
    this.scene.events.off('postupdate', this.onPostUpdate, this);
    this.lightParticles.destroy();
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
      frequency: 400,
      lifespan: 1000,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-20, -10, 40, 20),
        quantity: 20,
        stepRate: 0,
        yoyo: false,
        seamless: true,
      },
    });

    this.lightEmitter.start();
    this.lightEmitter.setPosition(0, 0);
    this.lightEmitter.setScrollFactor(1);

    this.scene.events.on('postupdate', this.onPostUpdate, this);
  }

  private onPostUpdate() {
    this.lightEmitter.setPosition(this.follow.x, this.follow.y + 10);
  }
}
