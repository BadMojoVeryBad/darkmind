import { Node, injectable } from 'phaser-node-framework';

/**
 * The camera that follows the player in-game.
 */
@injectable()
export class IslandParticles extends Node {
  private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor() {
    super();
  }

  public init(data: Record<string, string>) {
    this.x = Number.parseInt(data.x);
    this.y = Number.parseInt(data.y);
    this.width = Number.parseInt(data.width);
    this.height = Number.parseInt(data.height);
  }

  public create(): void {
    const multiplier = (this.width * this.height) / 128;
    this.particles = this.scene.add.particles('textures', 'darkPixel');
    const emitter = this.particles.createEmitter({
      alpha: 1,
      speed: { max: 0.5, min: 0.1 },
      gravityY: 3,
      quantity: 0.2 * multiplier,
      frequency: 200,
      lifespan: 3000,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
        quantity: 1,
        stepRate: 0,
        yoyo: false,
        seamless: true,
      },
    });

    emitter.setPosition(this.x, this.y - this.height);
    emitter.start();
    this.particles.setDepth(5);
  }

  public destroy(): void {
    this.particles.destroy();
  }
}
