import { inject, injectable } from "inversify";
import { PlayerDashingState } from "../../states/playerCharacterStates/playerDashingState";
import { PlayerDeadState } from "../../states/playerCharacterStates/playerDeadState";
import { PlayerIdleState } from "../../states/playerCharacterStates/playerIdleState";
import { PlayerRunningState } from "../../states/playerCharacterStates/playerRunningState";
import { PlatformNode } from "../platformNode";
import { CharacterNode } from "./characterNode";

@injectable()
export class PlayerCharacterNode extends CharacterNode {
  private controlsDisabledCount = 0;

  public dashTime = 0;
  public dashVector = new Phaser.Math.Vector2();
  public dashStart = new Phaser.Math.Vector2();
  public deadTime = 0;
  public deathAnimation;
  public isOnPlatform = false;
  public isOverlappingMap = false;
  public lastSafePosition = new Phaser.Math.Vector2();
  public groundParticles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  public groundParticlesEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  public hasStepped = false;

  private colliders: Phaser.Physics.Arcade.Collider[] = [];
  private platforms: PlatformNode[] = [];
  private collisionLayer: Phaser.Tilemaps.TilemapLayer;

  public constructor(
    @inject('playerCharacterIdleState') idleState: PlayerIdleState,
    @inject('playerCharacterRunningState') runningState: PlayerRunningState,
    @inject('playerCharacterDashingState') private dashingState: PlayerDashingState,
    @inject('playerCharacterDeadState') private deadState: PlayerDeadState
  ) {
    super(idleState, runningState);
  }

  public create(): void {
    super.create();
    this.states.push(this.dashingState);
    this.states.push(this.deadState);

    // Death and respawn 'poof'.
    this.deathAnimation = this.scene.add.sprite(0, 0, 'textures', 'puff1').setDepth(19);
    this.deathAnimation.visible = false;

    // Create the footsteps particle emitter.
    this.groundParticles = this.scene.add.particles('textures', 'darkPixel').setDepth(592);
    this.groundParticlesEmitter = this.groundParticles.createEmitter({
      alpha: 1,
      speed: { max: 10, min: 5 },
      radial: true,
      angle: { min: 240, max: 330 },
      gravityY: 20,
      quantity: 1,
      frequency: -1,
      lifespan: 500,
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
    this.scene.events.emit('playerCharacterCreated', this);

    this.scene.events.emit('cutscene.play.prologue_start');

    // Platforms listen to this event to know what
    // objects can be attached to them.
    this.scene.events.emit('onAttachableToPlatformCreated', this.sprite);
  }

  public update(time: number, delta: number): void {
    // Update context for next update. Things like collision.
    this.isOnPlatform = false;
    for (const platform of this.platforms) {
      if (!platform.isPlatformTransparent()) {
        this.isOnPlatform = this.isOnPlatform || this.scene.physics.overlap(this.sprite, platform.getSprite());
      }
    }
    this.scene.physics.overlap(this.sprite, this.collisionLayer, (player, map) => {
      // @ts-ignore
      this.isOverlappingMap = [2, 3, 13, 11, 1, 12, 22, 4, 5].includes(map.index);
    });

    super.update(time, delta);
  }

  public name(): string {
    return 'player';
  }

  public disableControls(): void {
    this.controlsDisabledCount++;
  }

  public enableControls(): void {
    this.controlsDisabledCount--;
  }

  public controlsEnabled(): boolean {
    return this.controlsDisabledCount === 0;
  }

  private onMapCollisionCalculated(rectangles: Phaser.GameObjects.Rectangle[]): void {
    for (const collider of this.colliders) {
      collider.destroy();
    }
    this.colliders = [];

    for (const rectangle of rectangles) {
      if (this.currentState.getName() !== 'playerDashing') {
        this.colliders.push(this.scene.physics.add.collider(this.sprite, rectangle));
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
