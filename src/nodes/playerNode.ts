import { Node, inject, injectable } from 'phaser-node-framework';
import { NodeStateInterface } from '../states/nodeStateInterface';
import { PlayerContext } from '../states/playerStates/playerContext';

/**
 * The player sprite.
 */
@injectable()
export class PlayerNode extends Node {
  private player: Phaser.Physics.Arcade.Sprite;
  private groundLight: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.BitmapText;
  private currentAngle = 'Side';
  private maskRenderTexture: Phaser.GameObjects.RenderTexture;
  private groundParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  private needsFootstep = true;
  private maskGraphics: Phaser.GameObjects.Graphics;
  private dashTime = 0;
  private mapCollision: Phaser.Tilemaps.TilemapLayer;
  private isOverlappingMap = false;
  private isDashing = false;
  private puff: Phaser.GameObjects.Sprite;
  private state: NodeStateInterface<PlayerContext>;
  private context: PlayerContext;

  private mapMask: Phaser.Display.Masks.BitmapMask;

  constructor(
    @inject('playerIdleState') private idleState: NodeStateInterface<PlayerContext>,
    @inject('playerRunningState') private runningState: NodeStateInterface<PlayerContext>,
    @inject('playerDashingState') private dashingState: NodeStateInterface<PlayerContext>
  ) {
    super();
  }

  public init() {
    this.state = this.idleState;
    this.scene.events.on('mapCreated', (map: Phaser.Tilemaps.Tilemap) => {
      this.mapCollision = map.getLayer('collision').tilemapLayer;
      this.mapCollision.setCollision([6]);
    });
  }

  public create(): void {
    // Create player.
    const player = this.scene.physics.add.sprite(160, 1440, 'textures', 'playerIdleSide1').setScale(1).setDepth(20);
    player.setSize(4, 4);
    player.setOffset(14, 25);
    player.setDepth(50);

    // TODO: Redo jumping between platforms.
    // Collision event.
    this.scene.physics.add.overlap(player, this.mapCollision, (player, map) => {
      // This property exists. You just have to trust me.
      // @ts-ignore
      this.context.player.isOverlappingMap = map.index >= 0;
    });

    // this.puff = this.scene.add.sprite(0, 0, 'textures', 'puffA1').setDepth(19);
    // this.puff.visible = false;



    // this.scene.events.emit('maskCreated', this.maskRenderTexture);

    // TODO: Create a light particle node. Or add it to character light.
    // const lightParticles = this.scene.add.particles('textures', 'lightestPixel');
    // lightParticles.setDepth(40);
    // const lightParticlesEmitter = lightParticles.createEmitter({
    //   alpha: 1,
    //   speedX: { min: 0, max: 0 },
    //   speedY: { min: -10, max: -10 },
    //   gravityY: 0,
    //   quantity: 1,
    //   frequency: 100,
    //   lifespan: 10000,
    //   emitZone: {
    //     type: 'random',
    //     source: new Phaser.Geom.Rectangle(-64, -64, 128, 128),
    //     quantity: 20,
    //     stepRate: 0,
    //     yoyo: false,
    //     seamless: true,
    //   },
    // });
    // lightParticlesEmitter.start();
    // lightParticlesEmitter.setPosition(0, 0);
    // lightParticlesEmitter.setScrollFactor(1);
    // this.maskGraphics = this.scene.make.graphics({
    //   lineStyle: {
    //     width: 0,
    //     color: 0xffffff,
    //     alpha: 1
    //   },
    //   fillStyle: {
    //     color: 0x000000,
    //     alpha: 1
    //   },
    // });

    // Create the light on the ground that follows around the player.
    this.addNode('characterLight', {
      'follow': player
    });

    // Create the footsteps particle emitter.
    const groundParticles = this.scene.add.particles('textures', 'darkestPixel').setDepth(40);
    const footsteps = groundParticles.createEmitter({
      alpha: 1,
      speed: { max: 10, min: 5 },
      radial: true,
      angle: { min: 240, max: 330 },
      gravityY: 20,
      quantity: 1,
      frequency: -1,
      lifespan: 500,
    });

    // Create context using all created things for this node.
    // TODO: Flatten this.
    this.context = {
      player: {
        sprite: player,
        footsteps: footsteps,
        hasStepped: true,
        isOverlappingMap: false,
        angle: 0,
      },
      dash: {
        time: 0,
        vector: new Phaser.Math.Vector2(0, 0)
      },
      states: [
        this.idleState,
        this.runningState,
        this.dashingState
      ]
    };

    // Emit events for other nodes.
    this.scene.events.emit('playerCreated', player);
  }

  public update(time: number, delta: number): void {
    // Update player based on state.
    this.state = this.state.update(time, delta, this.context);
  }

  public destroy(): void {
    this.player.destroy();
    this.text.destroy();
  }
}
