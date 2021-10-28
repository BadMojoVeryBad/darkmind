import { Node, inject, injectable } from 'phaser-node-framework';
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

  constructor(
    @inject('playerIdleState') private idleState: NodeStateInterface<PlayerContext>,
    @inject('playerRunningState') private runningState: NodeStateInterface<PlayerContext>,
    @inject('playerDashingState') private dashingState: NodeStateInterface<PlayerContext>
  ) {
    super();
  }

  public init() {
    this.state = this.idleState;
  }

  public create(): void {
    // Create player.
    const player = this.scene.physics.add.sprite(160, 1440, 'textures', 'playerIdleSide1').setScale(1).setDepth(20);
    player.setSize(4, 4);
    player.setOffset(14, 25);
    player.setDepth(50);

    // TODO: Death and respawn.
    // this.puff = this.scene.add.sprite(0, 0, 'textures', 'puffA1').setDepth(19);
    // this.puff.visible = false;

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

    // Create context using all created things for this node.
    this.context = {
      player: player,
      footsteps: footsteps,
      hasStepped: true,
      isOverlappingMap: false,
      angle: 0,
      dashTime: 0,
      dashVector: new Phaser.Math.Vector2(0, 0),
      mapCollider: null,
      states: [
        this.idleState,
        this.runningState,
        this.dashingState
      ]
    };

    // Set map collision stuff when the map gets created.
    this.scene.events.on('mapCreated', (map: Phaser.Tilemaps.Tilemap) => {
      const collisionLayer = map.getLayer('collision').tilemapLayer;
      this.context.mapCollider = this.scene.physics.add.collider(player, collisionLayer);
      this.scene.physics.add.overlap(player, collisionLayer, (player, map) => {
        // This property exists. You just have to trust me.
        // @ts-ignore
        this.context.player.isOverlappingMap = map.index >= 0;
      });
    });
  }

  public created(): void {
    // Emit events for other nodes.
    this.scene.events.emit('playerCreated', this.context.player);
  }

  public update(time: number, delta: number): void {
    // Update player based on state.
    this.state = this.state.update(time, delta, this.context);
  }

  public destroy(): void {
    this.player.destroy();
  }
}
