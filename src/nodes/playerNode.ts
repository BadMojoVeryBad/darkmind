import { Node, inject, injectable, ControlsInterface } from 'phaser-node-framework';
import { CONSTANTS } from '../constants';
import { MathServiceInterface } from '../services/mathServiceInterface';
import { NodeStateInterface } from '../states/nodeStateInterface';
import { PlayerContext } from '../states/playerStates/playerContext';

/**
 * The player sprite.
 */
@injectable()
export class PlayerNode extends Node {
  private player: Phaser.Physics.Arcade.Sprite;
  private state: NodeStateInterface<PlayerContext>;
  private context: PlayerContext;
  private text: Phaser.GameObjects.Text;
  private colliders: Phaser.Physics.Arcade.Collider[] = [];
  private platforms: Phaser.Physics.Arcade.Sprite[] = [];
  private collisionLayer: Phaser.Tilemaps.TilemapLayer;

  constructor(
    @inject('playerIdleState') private idleState: NodeStateInterface<PlayerContext>,
    @inject('playerRunningState') private runningState: NodeStateInterface<PlayerContext>,
    @inject('playerDeadState') private deadState: NodeStateInterface<PlayerContext>,
    @inject('playerDashingState') private dashingState: NodeStateInterface<PlayerContext>,
    @inject('controls') private controls: ControlsInterface,
    @inject('mathService') private mathService: MathServiceInterface
  ) {
    super();
  }

  public init(): void {
    this.state = this.idleState;
  }

  public create(): void {
    // Create player.
    const player = this.scene.physics.add.sprite(56, 1431, 'textures', 'playerIdleSide1').setScale(1).setDepth(20);
    player.setSize(4, 4);
    player.setOffset(14, 25);
    player.setDepth(50);

    // Death and respawn 'poof'.
    const puff = this.scene.add.sprite(0, 0, 'textures', 'puffA1').setDepth(19);
    puff.visible = false;

    // Create the light on the ground that follows around the player.
    this.addNode('characterLight', {
      'follow': player
    });

    // Create the light particles that follow the player around.
    this.addNode('lightParticles', {
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

    // Debug text.
    this.text = this.scene.add.text(10, 10, 'debug');
    this.text.setScrollFactor(0);
    this.text.setDepth(1000);

    // Create context using all created things for this node.
    this.context = {
      player: player,
      lastSafePosition: new Phaser.Math.Vector2(160, 1440),
      deathAnimation: puff,
      footsteps: footsteps,
      hasStepped: true,
      isOverlappingMap: true,
      isOnPlatform: false,
      angle: 0,
      dashTime: 0,
      deadTime: 0,
      dashVector: new Phaser.Math.Vector2(0, 0),
      states: [
        this.idleState,
        this.runningState,
        this.dashingState,
        this.deadState
      ]
    };

    // Set map collision stuff when the map gets created.
    this.scene.events.on('calculateMapCollision', (rectangles: Phaser.GameObjects.Rectangle[]) => {
      this.colliders.forEach(collider => collider.destroy());
      this.colliders = [];

      for (const rectangle of rectangles) {
        if (this.state.getName() !== 'dashing') {
          this.colliders.push(this.scene.physics.add.collider(player, rectangle));
        }
      }
    });

    this.scene.events.on('mapCreated', (map: Phaser.Tilemaps.Tilemap) => {
      const collisionLayer = map.getLayer('tiles').tilemapLayer;
      this.collisionLayer = collisionLayer;
    });

    this.scene.events.on('platformCreated', (platform: Phaser.Physics.Arcade.Sprite) => {
      this.platforms.push(platform);
    });
  }

  public created(): void {
    // Emit events for other nodes.
    this.scene.events.emit('playerCreated', this.context.player);
    this.scene.events.emit('stickToPlatform', this.context.player);
  }

  public update(time: number, delta: number): void {
    // Update context for next update.
    this.context.isOnPlatform = false;
    for (const platform of this.platforms) {
      if (!platform.getData('isTransparent')) {
        this.context.isOnPlatform = this.context.isOnPlatform || this.scene.physics.overlap(this.context.player, platform);
      }
    }
    this.scene.physics.overlap(this.context.player, this.collisionLayer, (player, map) => {
      // This property exists. You just have to trust me.
      // @ts-ignore
      this.context.isOverlappingMap = [2, 3, 13, 11, 1, 12, 22, 4, 5].includes(map.index);
    });

    // Update player based on state.
    this.state = this.state.update(time, delta, this.context);

    // Debug text.
    this.text.setText('Delta: ' + delta.toFixed(2) + '\n' + 'Objects: ' + this.scene.sys.displayList.list.length.toString() + '\n' + this.context.isOverlappingMap);
  }

  public destroy(): void {
    // TODO: Destroy the player properly.
    this.player.destroy();
  }
}
