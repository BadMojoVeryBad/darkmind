import { NodeStateInterface } from '../nodeStateInterface';

export type PlayerContext = {
  player: Phaser.Physics.Arcade.Sprite,
  currentAngle: number,
  dash: {
    time: number,
    vector: Phaser.Math.Vector2,
  },
  states: Array<NodeStateInterface<PlayerContext>>
};
