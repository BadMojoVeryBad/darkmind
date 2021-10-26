import 'reflect-metadata';
import { Game } from 'phaser-node-framework';
import { PlayerNode } from './nodes/playerNode';
import { DefaultScene } from './scenes/defaultScene';
import { Context } from './contexts/context';
import { CameraNode } from './nodes/cameraNode';
import { MapNode } from './nodes/mapNode';
import { IslandParticles } from './nodes/islandParticles';

// Create a game.
const game = Game.create(240, 135, {
  backgroundColor: 0x081820,
  loadingColor: 0x346856,
  // debug: true
});

// Register scenes.
game.registerScene('default', DefaultScene);

// Register components.
game.registerNode('player', PlayerNode);
game.registerNode('camera', CameraNode);
game.registerNode('map', MapNode);
game.registerNode('islandParticles', IslandParticles);

// Register assets.
game.registerAsset('tiles', 'assets/tiles/main.png');
game.registerAsset('debugMap', 'assets/maps/debug.json');
game.registerAsset('textures', 'assets/textures.png', 'assets/textures.json');

// for (let i = 0; i < 200; i++) {
//   game.registerAsset('tiles' + i, 'assets/tiles/main.png');
// }

// Register animations.
game.registerAnimation('textures', 'playerIdleUp', 1, 6, true, 12);
game.registerAnimation('textures', 'playerIdleDiagonalUp', 1, 6, true, 12);
game.registerAnimation('textures', 'playerIdleSide', 1, 6, true, 12);
game.registerAnimation('textures', 'playerIdleDiagonalDown', 1, 6, true, 12);
game.registerAnimation('textures', 'playerIdleDown', 1, 6, true, 12);
game.registerAnimation('textures', 'playerRunningSide', 1, 6, true, 24);
game.registerAnimation('textures', 'playerRunningDiagonalDown', 1, 6, true, 24);
game.registerAnimation('textures', 'playerRunningDiagonalUp', 1, 6, true, 24);
game.registerAnimation('textures', 'playerRunningDown', 1, 6, true, 24);
game.registerAnimation('textures', 'playerRunningUp', 1, 6, true, 24);
game.registerAnimation('textures', 'playerDashUp', 1, 6, false, 24);
game.registerAnimation('textures', 'playerDashDown', 1, 6, false, 24);
game.registerAnimation('textures', 'playerDashSide', 1, 6, false, 24);
game.registerAnimation('textures', 'playerDashDiagonalUp', 1, 6, false, 24);
game.registerAnimation('textures', 'playerDashDiagonalDown', 1, 6, false, 24);
game.registerAnimation('textures', 'groundLight', 1, 12, true, 12);
game.registerAnimation('textures', 'puffA', 1, 7, false, 24);

// Register controls.
game.registerControl('UP', 'Keyboard.38', 'Gamepad.UP', 'Gamepad.STICK_LEFT_UP');
game.registerControl('DOWN', 'Keyboard.40', 'Gamepad.DOWN', 'Gamepad.STICK_LEFT_DOWN');
game.registerControl('LEFT', 'Keyboard.37', 'Gamepad.LEFT', 'Gamepad.STICK_LEFT_LEFT');
game.registerControl('RIGHT', 'Keyboard.39', 'Gamepad.RIGHT', 'Gamepad.STICK_LEFT_RIGHT');
game.registerControl('DASH', 'Keyboard.32', 'Gamepad.A');

// Register services.
game.registerService<Context>('context', Context, true);

// Start game.
game.start();
