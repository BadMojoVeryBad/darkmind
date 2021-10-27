import { Node, inject, injectable, ControlsInterface } from 'phaser-node-framework';
import { Context } from '../contexts/context';
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

  constructor(
    @inject('controls') private controls: ControlsInterface,
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
      console.log(this.mapCollision);
    });
  }

  public create(): void {
    this.maskRenderTexture = this.scene.add.renderTexture(0, 0, 400, 1600);
    this.maskRenderTexture.setVisible(false);

    this.player = this.scene.physics.add.sprite(160, 1440, 'textures', 'playerIdleSide1').setScale(1).setDepth(20);
    this.player.setSize(4, 4);
    this.player.setOffset(14, 25);
    this.player.setDepth(50);

    this.scene.physics.add.overlap(this.player, this.mapCollision, (arg, arg2: Phaser.GameObjects.GameObject) => {
      if (arg2.index >= 0) {
        this.isOverlappingMap = true;
      } else {
        this.isOverlappingMap = false;
      }
    });

    this.groundLight = this.scene.add.sprite(160, 1440, 'textures', 'groundLight1').setDepth(19);
    this.groundLight.anims.play('groundLight');
    this.groundLight.setDepth(30);

    this.puff = this.scene.add.sprite(0, 0, 'textures', 'puffA1').setDepth(19);
    this.puff.visible = false;

    this.text = this.scene.add.bitmapText(4, 0, 'helloRobotWhite', 'Blah', 12);
    this.text.setScrollFactor(0, 0);
    this.text.setDepth(1001);

    // Player created event.
    this.scene.events.emit('playerCreated', this.player);
    this.scene.events.emit('maskCreated', this.maskRenderTexture);

    const lightParticles = this.scene.add.particles('textures', 'lightestPixel');
    lightParticles.setDepth(40);
    const lightParticlesEmitter = lightParticles.createEmitter({
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
    lightParticlesEmitter.start();
    lightParticlesEmitter.setPosition(0, 0);
    lightParticlesEmitter.setScrollFactor(1);
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

    // Listen to stuff.
    this.scene.events.on('postupdate', () => {
      this.groundLight.x = this.player.x;
      this.groundLight.y = this.player.y + 14;
      this.groundParticles.setPosition(this.player.x, this.player.y + 12);
      lightParticlesEmitter.setPosition(this.player.x, this.player.y);

      this.maskGraphics.clear();
      this.maskGraphics.fillCircle(this.player.x, this.player.y + 4, 20);
      lightParticlesEmitter.setMask(this.maskGraphics.createGeometryMask());
    });

    const mask = this.maskRenderTexture.createBitmapMask();
    mask.invertAlpha = false;
    this.groundLight.setMask(mask);

    const groundParticles = this.scene.add.particles('textures', 'darkestPixel');
    groundParticles.setDepth(40);
    this.groundParticles = groundParticles.createEmitter({
      alpha: 1,
      speed: { max: 10, min: 5 },
      radial: true,
      angle: { min: 240, max: 330 },
      gravityY: 20,
      quantity: 1,
      frequency: -1,
      lifespan: 500,
    });
    this.groundParticles.start();

    this.context = {
      player: this.player,
      currentAngle: 0,
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
  }

  public update(time: number, delta: number): void {
    // Debug for now.
    this.text.setText((1000 / delta).toFixed(2));

    // Update player based on state.
    this.state = this.state.update(time, delta, this.context);
  }

  public destroy(): void {
    this.player.destroy();
    this.text.destroy();
  }
}
