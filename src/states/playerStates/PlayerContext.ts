import { NodeStateInterface } from '../nodeStateInterface';

export type PlayerContext = {
  player: Phaser.Physics.Arcade.Sprite
  shadow: Phaser.GameObjects.Sprite
  footsteps: Phaser.GameObjects.Particles.ParticleEmitter
  lastSafePosition: Phaser.Math.Vector2
  hasStepped: boolean
  isOverlappingMap: boolean
  isOnPlatform: boolean
  angle: number
  dashTime: number
  deadTime: number
  dashVector: Phaser.Math.Vector2
  states: Array<NodeStateInterface<PlayerContext>>
  deathAnimation: Phaser.GameObjects.Sprite
};
