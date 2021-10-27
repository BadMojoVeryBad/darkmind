import { injectable } from "inversify";
import { ControlsInterface, inject } from "phaser-node-framework";
import { NodeStateInterface } from "../NodeStateInterface";
import { PlayerContext } from "./PlayerContext";

@injectable()
export class RunningState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('controls') private controls: ControlsInterface
  ) { }

  getName(): string {
    return 'running';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    // Get player input.
    const inputVector = new Phaser.Math.Vector2(
      this.easeOutCubic(this.controls.isActive('RIGHT')) - this.easeOutCubic(this.controls.isActive('LEFT')),
      this.easeOutCubic(this.controls.isActive('DOWN')) - this.easeOutCubic(this.controls.isActive('UP'))
    );

    // Transition to idle state if not moving.
    if (!inputVector.x && !inputVector.y) {
      const idleState = context.states.find((state) => state.getName() === 'idle');
      idleState.update(time, delta, context);
      return idleState;
    }

    // Set the velocity.
    const playerSpeed = Math.min(1, inputVector.length()) * 60;
    const playerAngle = this.getAngle(inputVector, new Phaser.Math.Vector2(0, 0));
    const playerVector = this.velocityFromRotation(playerAngle, playerSpeed);
    context.player.setVelocity(playerVector.x, playerVector.y);

    // Set running animation.
    const currentAngle = this.getAngleName(inputVector, new Phaser.Math.Vector2(0, 0));
    context.player.anims.play(`playerRunning${currentAngle}`);

    return this;
  }

  private velocityFromRotation(rotation: number, speed = 60, vec2: Phaser.Math.Vector2 = new Phaser.Math.Vector2()): Phaser.Math.Vector2 {
    return vec2.setToPolar(rotation, speed);
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
