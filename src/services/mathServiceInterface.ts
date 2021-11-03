export interface MathServiceInterface {
  easing(num: number): number;

  vectorToRadians(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): number;

  angleName(radians: number): string;

  angleNameFromPoints(vector1: Phaser.Math.Vector2, vector2: Phaser.Math.Vector2): string;

  velocityFromRotation(rotation: number, speed?: number, vec2?: Phaser.Math.Vector2): Phaser.Math.Vector2;

  radiansToVector(radians: number): Phaser.Math.Vector2;

  closestMultiple(number: number, multiple: number): number;
}
