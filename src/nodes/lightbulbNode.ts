import { Node, injectable, inject, ControlsInterface } from 'phaser-node-framework';
import { CONSTANTS } from '../constants';
import { DepthData } from './depthOrderingNode';
import { PlayerNode } from './playerNode';

export class LightbulbContext {
  public sprite: Phaser.Types.Physics.Arcade.SpriteWithStaticBody;
  public playerCollider: Phaser.Physics.Arcade.Collider;
  public lightParticlesManager: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public lightParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  public lightParticlesManager2: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public lightParticles2: Phaser.GameObjects.Particles.ParticleEmitter;
  public isActive = false;
  public switchRectangle: Phaser.GameObjects.Rectangle;
}

@injectable()
export class LightbulbNode extends Node {
  private x: number = 0;
  private y: number = 0;
  private context: LightbulbContext;
  private player: PlayerNode;
  private mask: Phaser.Display.Masks.BitmapMask;

  public constructor(
    @inject('controls') private controls: ControlsInterface,
  ) {
    super();
  }

  public init(data: Record<string, unknown>): void {
    this.x = data.x as number + 8;
    this.y = data.y as number - 14;
    this.context = new LightbulbContext();
  }

  public create() {
    this.context.sprite = this.scene.physics.add.staticSprite(this.x, this.y, 'textures', 'lightbulb');
    this.context.sprite.setDepth(1001);
    this.context.sprite.setSize(5, 4);
    this.context.sprite.setOffset(14, 18);

    const rectangle = this.scene.add.rectangle(this.context.sprite.x, this.context.sprite.y + 4, 64, 64, 0xff0000);
    rectangle.setVisible(false);
    this.scene.physics.add.existing(rectangle, true);
    (rectangle.body as Phaser.Physics.Arcade.Body).setCircle(32);
    this.context.switchRectangle = rectangle;

    this.context.lightParticlesManager = this.scene.add.particles('textures', 'lightestPixel');
    this.context.lightParticlesManager.setPosition(this.x, this.y).setDepth(1000);
    this.context.lightParticles = this.context.lightParticlesManager.createEmitter({
      alpha: 1,
      speedX: { min: -10, max: 10 },
      speedY: { min: 0, max: 0 },
      gravityY: -20,
      quantity: 3,
      frequency: 100,
      lifespan: 3000,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-8, -8, 16, 16),
        quantity: 20,
        stepRate: 0,
        yoyo: false,
        seamless: true,
      },
    });
    // this.context.lightParticles.setPosition(this.x, this.y);
    this.context.lightParticles.stop();

    this.context.lightParticlesManager2 = this.scene.add.particles('textures', 'darkPixel');
    this.context.lightParticlesManager2.setPosition(this.x, this.y).setDepth(1000);
    this.context.lightParticles2 = this.context.lightParticlesManager2.createEmitter({
      alpha: 1,
      speedX: { min: -5, max: 5 },
      speedY: { min: 0, max: 0 },
      gravityY: -5,
      quantity: 1,
      frequency: 500,
      lifespan: 3000,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Rectangle(-8, -8, 8, 8),
        quantity: 20,
        stepRate: 0,
        yoyo: false,
        seamless: true,
      },
    });
    // this.context.lightParticles2.setPosition(this.x, this.y);
    this.context.lightParticles2.start();

    this.scene.events.on('playerCreated',  (player: PlayerNode) => {
      this.context.playerCollider = this.scene.physics.add.collider(player.getSprite(), this.context.sprite);
      this.player = player;
    });

    this.scene.events.on('maskRenderTextureCreated', (mask: Phaser.Display.Masks.BitmapMask) => {
      this.mask = mask;
    });

    this.scene.events.on('depth-ordering.collect-objects', (gameObjects: DepthData[]) => {
      gameObjects.push(new DepthData(this.context.sprite, 0, 1));
      gameObjects.push(new DepthData(this.context.lightParticlesManager, -1, 1));
      gameObjects.push(new DepthData(this.context.lightParticlesManager2, -1, 1));
    })
  }

  public update() {
    if (this.controls.isActive(CONSTANTS.CONTROL_ACTIVATE) && !this.context.isActive && this.scene.physics.overlap(this.player.getSprite(), this.context.switchRectangle)) {
      this.context.isActive = true;

      this.context.lightParticles2.stop();
      this.context.lightParticles.start();
      this.context.sprite.setTexture('textures', 'lightbulbOn');

      this.addNode('characterLight', {
        follow: this.context.sprite,
        yOffset: 7,
        depth: 31,
        mask: this.mask
      });

      this.scene.events.emit('onLightbulbActivated');
    }
  }
}
