import { NodeStateInterface } from "../NodeStateInterface";

export type PlayerContext = {
  player: Phaser.Physics.Arcade.Sprite,
  states: Array<NodeStateInterface<PlayerContext>>
};
