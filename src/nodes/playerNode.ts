import { Node, inject, injectable, ControlsInterface } from 'phaser-node-framework';
import { Context } from '../contexts/context';
import { NodeStateInterface } from '../states/NodeStateInterface';
import { PlayerContext } from '../states/playerStates/PlayerContext';

/**
 * The player sprite.
 */
@injectable()
export class PlayerNode extends Node {
  private player: Phaser.Physics.Arcade.Sprite;
  private groundLight: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.BitmapText;
  private currentAngle: string = 'Side';
  private maskRenderTexture: Phaser.GameObjects.RenderTexture;
  private groundParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  private needsFootstep: boolean = true;
  private maskGraphics: Phaser.GameObjects.Graphics;
  private dashTime: number = 0;
  private mapCollision: Phaser.Tilemaps.TilemapLayer;
  private isOverlappingMap = false;
  private isDashing = false;
  private puff: Phaser.GameObjects.Sprite;
  private state: NodeStateInterface<PlayerContext>;
  constructor(
    @inject('controls') private controls: ControlsInterface,
    @inject('context') private context: Context,
    @inject('playerIdleState') private idleState: NodeStateInterface<PlayerContext>,
    @inject('playerRunningState') private runningState: NodeStateInterface<PlayerContext>,
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
  }

  public update(time: number, delta: number): void {
    /*// Get variables.
    const inputVector = new Phaser.Math.Vector2(
      this.easeOutCubic(this.controls.isActive('RIGHT')) - this.easeOutCubic(this.controls.isActive('LEFT')),
      this.easeOutCubic(this.controls.isActive('DOWN')) - this.easeOutCubic(this.controls.isActive('UP'))
    );

    if (this.controls.isActive('DASH') && this.dashTime + 800 < time) {
      this.dashTime = time;
      this.player.anims.setProgress(0);
    }

    if (this.dashTime + 200 > time) {
      this.isDashing = true;
      this.scene.events.emit('playerMapCollider', false);
    } else {
      if (this.isDashing && this.isOverlappingMap) {
        console.log('DEAD!');
        this.player.visible = false;
        this.puff.visible = true;
        this.puff.setPosition(this.player.x, this.player.y);
        this.puff.anims.play('puffA');
      }
      this.isDashing = false;
      this.scene.events.emit('playerMapCollider', true);
    }

    if (this.puff.anims.getProgress() === 1) {
      this.puff.visible = false;
    }

    const moveSpeed = 60;
    let playerSpeed = inputVector.length() ? Math.min(1, inputVector.length()) * moveSpeed : 0;
    playerSpeed = (this.dashTime + 200 > time) ? 120 : playerSpeed;
    const playerAngle = this.getAngle(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.velocityFromRotation(playerAngle, playerSpeed);

    // Set velocity.
    this.player.setVelocity(playerVector.x, playerVector.y);

    // Debug for now.
    this.text.setText((1000 / delta).toFixed(2));

    // Player flip.
    if (this.player.body.velocity.x < 0) {
      this.player.flipX = true;
    } else if (this.player.body.velocity.x > 0) {
      this.player.flipX = false;
    }

    // Set animation based on velocity and angle.
    let animation = `playerIdle${this.currentAngle}`;
    if (this.player.body.velocity.x || this.player.body.velocity.y) {
      this.currentAngle = this.getAngleName(inputVector, new Phaser.Math.Vector2(0, 0));

      if (this.dashTime + 200 > time) {
        animation = `playerDash${this.currentAngle}`;
      } else {
        animation = `playerRunning${this.currentAngle}`;
      }

      if (this.player.anims.currentFrame.index === 1 && this.needsFootstep) {
        this.needsFootstep = false;
        this.groundParticles.explode(10, this.player.x, this.player.y + 12);
      } else if (this.player.anims.currentFrame.index !== 1) {
        this.needsFootstep = true;
      }
    }

    const current = this.player.anims.getName();
    if (current !== animation) {
      const progress = this.player.anims.getProgress();
      this.player.anims.play(animation, true);
      this.player.anims.setProgress(progress);
    }

    // console.log(this.mapCollision.getTileAtWorldXY(this.player.x, this.player.y));
    // if (this.mapCollision.getTileAtWorldXY(this.player.x, this.player.y)) {
    //   const overlap = this.scene.physics.world.overlapTiles(this.player, [this.mapCollision.getTileAtWorldXY(this.player.x, this.player.y)]);
    //   const overlap2 = this.scene.physics.world.overlap(this.player, this.mapCollision);
    //   console.log(overlap2);
    // }
    // console.log(overlap);*/

    this.state = this.state.update(time, delta, {
      player: this.player,
      states: [
        this.idleState,
        this.runningState
      ]
    });
  }

  public destroy(): void {
    this.player.destroy();
    this.text.destroy();
  }

  private getAngle(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): number {
    return Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
  }

  private getAngleName(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): string {
    const radians = Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
    const margin = Math.PI / 8;

    if (radians >= (margin * -4) - margin && radians <= (margin * -4) + margin) {
      return 'Up';
    }

    if (radians >= (margin * -2) - margin && radians <= (margin * -2) + margin ||
      radians >= (margin * -6) - margin && radians <= (margin * -6) + margin) {
      return 'DiagonalUp';
    }

    if (radians >= (margin * 0) - margin && radians <= (margin * 0) + margin ||
      radians >= (margin * 8) - margin && radians <= (margin * 8) + margin) {
      return 'Side';
    }

    if (radians >= (margin * 2) - margin && radians <= (margin * 2) + margin ||
      radians >= (margin * 6) - margin && radians <= (margin * 6) + margin) {
      return 'DiagonalDown';
    }

    if (radians >= (margin * 4) - margin && radians <= (margin * 4) + margin) {
      return 'Down';
    }

    return 'Side';
  }

  private velocityFromRotation(rotation: number, speed = 60, vec2: Phaser.Math.Vector2 = new Phaser.Math.Vector2()): Phaser.Math.Vector2 {
    return vec2.setToPolar(rotation, speed);
  }

  private easeOutCubic(x: number): number {
    if (x > 1) {
      return 1;
    }

    if (x < 0) {
      return 0;
    }

    return 1 - Math.pow(1 - x, 3);
  }
}
