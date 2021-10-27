import { NodeStateInterface } from '../nodeStateInterface';

export type PlayerContext = {
  player: {
    sprite: Phaser.Physics.Arcade.Sprite,
    footsteps: Phaser.GameObjects.Particles.ParticleEmitter,
    hasStepped: boolean,
    isOverlappingMap: boolean,
    angle: number
  },
  dash: {
    time: number,
    vector: Phaser.Math.Vector2,
  },
  states: Array<NodeStateInterface<PlayerContext>>
};
