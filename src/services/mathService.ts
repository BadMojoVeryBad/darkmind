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

  public vectorToRadians(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): number {
    return Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x);
  }

  public radiansToVector(radians: number): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(
      Math.cos(radians),
      Math.sin(radians)
    );
  }

  public angleNameFromPoints(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): string {
    return this.angleName(this.vectorToRadians(vector1, vector2));
  }

  public angleName(radians: number): string {
    const multiple = Math.PI / 4;
    const animationAngle = this.closestMultiple(radians, multiple);

    if (animationAngle === Math.PI / 2 * -1) {
      return 'Up';
    }

    if (animationAngle === Math.PI / 2) {
      return 'Down';
    }

    if (animationAngle === Math.PI || animationAngle === 0 || animationAngle === Math.PI * -1) {
      return 'Side';
    }

    if (animationAngle === Math.PI / 4 || animationAngle === (Math.PI / 4) * 3) {
      return 'DiagonalDown';
    }

    if (animationAngle === (Math.PI / 4) * -1 || animationAngle === (Math.PI / 4) * -3) {
      return 'DiagonalUp';
    }

    return 'Side';
  }

  public velocityFromRotation(rotation: number, speed = 60, vec2: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0)): Phaser.Math.Vector2 {
    return vec2.setToPolar(rotation, speed);
  }

  public closestMultiple(number: number, multiple: number): number {
    return Math.round(number / multiple) * multiple;
  }
}
