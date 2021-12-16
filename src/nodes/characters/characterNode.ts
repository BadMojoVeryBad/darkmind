import { inject, injectable, Node } from "phaser-node-framework";
import { IdleState } from "../../states/characterStates/idleState";
import { RunningState } from "../../states/characterStates/runningState";
import { NodeStateInterface } from "../../states/nodeStateInterface";
import { DepthData } from "../depthOrderingNode";

export enum Direction {
  UP = -1.5708,
  RIGHT = 0,
  DOWN = 1.5708,
  LEFT = 3.1415
}

@injectable()
export abstract class CharacterNode extends Node {
  protected currentState: NodeStateInterface<CharacterNode>;

  public states: Array<NodeStateInterface<CharacterNode>>;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public shadow: Phaser.GameObjects.Sprite;
  public angle: number = 0;
  public targetPosition?: Phaser.Math.Vector2;

  public constructor(
    @inject('characterIdleState') private idleState: IdleState,
    @inject('characterRunningState') private runningState: RunningState
  ) {
    super();
  }

  public create(): void {
    // Create the game object.
    this.sprite = this.scene.physics.add.sprite(100, 1430, 'textures', 'playerIdleSide1')
      .setSize(4, 4)
      .setOffset(14, 25)
      .setDepth(50);

    // Set state.
    this.currentState = this.idleState;
    this.states = [
      this.idleState,
      this.runningState
    ];

    // Create the light on the ground that follows around the player.
    this.addNode('characterLight', {
      'follow': this.sprite,
      yOffset: 14,
      depth: 590
    });

    // Create the light particles that follow the player around.
    this.addNode('lightParticles', {
      'follow': this.sprite
    });

    // Create the shadow.
    this.shadow = this.scene.add.sprite(100, 1430, 'textures', 'playerIdleUp1').setRotation(Math.PI/2).setScale(1).setDepth(591);
    const pipeline = (this.scene.renderer as Phaser.Renderer.WebGL.WebGLRenderer).pipelines.get('characterShadowShader');
    this.shadow.setPipeline(pipeline);
    this.scene.events.on('maskRenderTextureCreated', (mask: Phaser.Display.Masks.BitmapMask) => {
      this.shadow.setMask(mask);
    });
  }

  public update(time: number, delta: number): void {
    // Add the character to the depth ordering logic.
    this.scene.events.on('depth-ordering.collect-objects', (gameObjects: DepthData[]) => {
      gameObjects.push(new DepthData(this.sprite, 7, 1));
    });

    // Do state-specific logic.
    this.currentState = this.currentState.update(
      time,
      delta,
      this
    );
  }

  public name(): string {
    throw Error('CharacterNode::name() not implemented.');
  }

  public moveTo(x: number, y: number) {
    this.targetPosition = new Phaser.Math.Vector2(x, y);
  }

  public faceDirection(direction: Direction) {
    this.angle = direction;
  }
}
