import { Node, inject, injectable } from 'phaser-node-framework';
import { NodeStateInterface } from '../states/nodeStateInterface';
import { PlayerContext } from '../states/playerStates/playerContext';
import { PlatformNode } from './platformNode';

/**
 * The player sprite.
 */
@injectable()
export class PlayerNode extends Node {
  private state: NodeStateInterface<PlayerContext>;
  private context: PlayerContext;
  private text: Phaser.GameObjects.Text;
  private colliders: Phaser.Physics.Arcade.Collider[] = [];
  private platforms: PlatformNode[] = [];
  private collisionLayer: Phaser.Tilemaps.TilemapLayer;
  private groundParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;

  constructor(
    @inject('playerIdleState') private idleState: NodeStateInterface<PlayerContext>,
    @inject('playerRunningState') private runningState: NodeStateInterface<PlayerContext>,
    @inject('playerDeadState') private deadState: NodeStateInterface<PlayerContext>,
    @inject('playerDashingState') private dashingState: NodeStateInterface<PlayerContext>
  ) {
    super();
  }

  public destroy(): void {
    this.context.player.destroy();
    this.context.shadow.destroy();
    this.groundParticles.destroy();
    this.context.deathAnimation.destroy();
    this.scene.events.off('onMapCollisionCalculated', this.onMapCollisionCalculated, this);
    this.scene.events.off('onMapCreated', this.onMapCreated, this);
    this.scene.events.off('onPlatformCreated', this.onMapCreated, this);
  }

  public init(): void {
    this.state = this.idleState;
  }

  public create(): void {
    // Create player.
    const player = this.scene.physics.add.sprite(56, 1432, 'textures', 'playerIdleSide1').setScale(1);
    player.setSize(4, 4);
    player.setOffset(14, 25);
    player.setDepth(50);

    const playerShadow = this.scene.add.sprite(56, 1432, 'textures', 'playerIdleUp1').setRotation(Math.PI/2).setScale(1).setDepth(48);
    const pipeline = (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.get('characterShadowShader');
    playerShadow.setPipeline(pipeline);
    this.scene.events.on('maskRenderTextureCreated', (mask: Phaser.Display.Masks.BitmapMask) => {
      playerShadow.setMask(mask);
    });

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
    this.groundParticles = this.scene.add.particles('textures', 'darkestPixel').setDepth(49);
    const footsteps = this.groundParticles.createEmitter({
      alpha: 1,
      speed: { max: 10, min: 5 },
      radial: true,
      angle: { min: 240, max: 330 },
      gravityY: 20,
      quantity: 1,
      frequency: -1,
      lifespan: 500,
    });

    // Debug text. One day I'll move this into it's own node.
    this.text = this.scene.add.text(10, 10, 'debug');
    this.text.setScale(1);
    this.text.setScrollFactor(0);
    this.text.setDepth(1000);

    // Create context using all created things for this node. This data is
    // passed to the state to update the player.
    this.context = {
      player: player,
      shadow: playerShadow,
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
      dashStartX: 0,
      dashStartY: 0,
      states: [
        this.idleState,
        this.runningState,
        this.dashingState,
        this.deadState
      ]
    };

    this.scene.events.on('playerStart', (event: Phaser.Types.Tilemaps.TiledObject) => {
      this.context.player.x = event.x + 8;
      this.context.player.y = event.y - 16;
    });

    // This event is emitted every frame when the map borders are calculated.
    // This makes the player collide with the map borders.
    this.scene.events.on('onMapCollisionCalculated', this.onMapCollisionCalculated, this);

    // Keep track of the map's collision layer so that we can calculate
    // if the player is colliding with it.
    this.scene.events.on('onMapCreated', this.onMapCreated, this);

    // We need to keep track of all the platforms in a level in order to
    // figure out if the player is on one or not.
    this.scene.events.on('onPlatformCreated', this.onPlatformCreated, this);
  }

  public created(): void {
    // Emit events for other nodes.
    this.scene.events.emit('playerCreated', this);

    // Platforms listen to this event to know what
    // objects can be attached to them.
    this.scene.events.emit('onAttachableToPlatformCreated', this.context.player);
  }

  public update(time: number, delta: number): void {
    // Update context for next update. Things like collision.
    this.context.isOnPlatform = false;
    for (const platform of this.platforms) {
      if (!platform.isPlatformTransparent()) {
        this.context.isOnPlatform = this.context.isOnPlatform || this.scene.physics.overlap(this.context.player, platform.getSprite());
      }
    }
    this.scene.physics.overlap(this.context.player, this.collisionLayer, (player, map) => {
      // @ts-ignore
      this.context.isOverlappingMap = [2, 3, 13, 11, 1, 12, 22, 4, 5].includes(map.index);
    });

    // Update player based on state.
    this.state = this.state.update(time, delta, this.context);

    // Debug text.
    this.text.setText('FPS: ' + (1000 / delta).toFixed(2) + '\n' + 'Objects: ' + this.scene.sys.displayList.list.length.toString());
  }

  public getSprite(): Phaser.GameObjects.Sprite {
    return this.context.player;
  }

  private onMapCollisionCalculated(rectangles: Phaser.GameObjects.Rectangle[]): void {
    for (const collider of this.colliders) {
      collider.destroy();
    }
    this.colliders = [];

    for (const rectangle of rectangles) {
      if (this.state.getName() !== 'dashing') {
        this.colliders.push(this.scene.physics.add.collider(this.context.player, rectangle));
      }
    }
  }

  private onMapCreated(map: Phaser.Tilemaps.Tilemap): void {
    const collisionLayer = map.getLayer('tiles').tilemapLayer;
    this.collisionLayer = collisionLayer;
  }

  private onPlatformCreated(platform: PlatformNode): void {
    this.platforms.push(platform);
  }
}
