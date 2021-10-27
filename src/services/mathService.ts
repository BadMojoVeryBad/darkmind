import { injectable } from 'inversify';
import { MathServiceInterface } from './mathServiceInterface';

@injectable()
export class MathService implements MathServiceInterface {
  public easing(num: number): number {
    if (num > 1) {
      return 1;
    }

    if (num < 0) {
      return 0;
    }

    return 1 - Math.pow(1 - num, 3);
  }

  vectorToRadians(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): number {
    return Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
  }

  radiansToVector(radians: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.cos(radians),
      Math.sin(radians)
    );
  }

  angleNameFromPoints(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): string {
    return this.angleName(this.vectorToRadians(vector1, vector2));
  }

  angleName(radians: number): string {
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

  velocityFromRotation(rotation: number, speed = 60, vec2: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0)): Phaser.Math.Vector2 {
    return vec2.setToPolar(rotation, speed);
  }
}
