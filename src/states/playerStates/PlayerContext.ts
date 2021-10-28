import { NodeStateInterface } from '../nodeStateInterface';

export type PlayerContext = {
  player: Phaser.Physics.Arcade.Sprite,
  footsteps: Phaser.GameObjects.Particles.ParticleEmitter,
  hasStepped: boolean,
  isOverlappingMap: boolean,
  angle: number
  dashTime: number,
  dashVector: Phaser.Math.Vector2,
  states: Array<NodeStateInterface<PlayerContext>>
};
