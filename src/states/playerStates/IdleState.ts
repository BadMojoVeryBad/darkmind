import { ControlsInterface, inject, injectable } from "phaser-node-framework";
import { NodeStateInterface } from "../NodeStateInterface";
import { PlayerContext } from "./PlayerContext";

@injectable()
export class IdleState implements NodeStateInterface<PlayerContext> {
  constructor(
    @inject('controls') private controls: ControlsInterface
  ) { }

  getName(): string {
    return 'idle';
  }

  update(time: number, delta: number, context: PlayerContext): NodeStateInterface<PlayerContext> {
    const inputVector = new Phaser.Math.Vector2(
      this.easeOutCubic(this.controls.isActive('RIGHT')) - this.easeOutCubic(this.controls.isActive('LEFT')),
      this.easeOutCubic(this.controls.isActive('DOWN')) - this.easeOutCubic(this.controls.isActive('UP'))
    );

    if (inputVector.x || inputVector.y) {
      const runningState = context.states.find((state) => state.getName() === 'running');
      runningState.update(time, delta, context);
      return runningState;
    }

    return this;
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
