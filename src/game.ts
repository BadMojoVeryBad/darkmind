import 'reflect-metadata';
import { Game } from 'phaser-component-framework';
import { PlayerComponent } from './components/playerComponent';
import { DefaultScene } from './scenes/defaultScene';
import { Context } from './contexts/context';
import { CameraComponent } from './components/cameraComponent';

// Create a game.
const game = Game.create(240, 135, {
  backgroundColor: 0xe0f8d0,
  loadingColor: 0x346856
});

// Register scenes.
game.registerScene('default', DefaultScene);

// Register components.
game.registerComponent('player', PlayerComponent);
game.registerComponent('camera', CameraComponent);

// Register assets.
game.registerAsset('playerSprite', 'assets/player.png');
game.registerAsset('textures', 'assets/textures.png', 'assets/textures.json');

// Register animations.
game.registerAnimation('textures', 'playerIdleUp', 1, 6);
game.registerAnimation('textures', 'playerIdleDiagonalUp', 1, 6);
game.registerAnimation('textures', 'playerIdleSide', 1, 6);
game.registerAnimation('textures', 'playerIdleDiagonalDown', 1, 6);
game.registerAnimation('textures', 'playerIdleDown', 1, 6);
game.registerAnimation('textures', 'playerRunningSide', 1, 6);
game.registerAnimation('textures', 'playerRunningDiagonalDown', 1, 6);
game.registerAnimation('textures', 'playerRunningDiagonalUp', 1, 6);
game.registerAnimation('textures', 'playerRunningDown', 1, 6);
game.registerAnimation('textures', 'playerRunningUp', 1, 6);

// Register controls.
game.registerControl('UP', 'Keyboard.38', 'Gamepad.UP', 'Gamepad.STICK_LEFT_UP');
game.registerControl('DOWN', 'Keyboard.40', 'Gamepad.DOWN', 'Gamepad.STICK_LEFT_DOWN');
game.registerControl('LEFT', 'Keyboard.37', 'Gamepad.LEFT', 'Gamepad.STICK_LEFT_LEFT');
game.registerControl('RIGHT', 'Keyboard.39', 'Gamepad.RIGHT', 'Gamepad.STICK_LEFT_RIGHT');

// Register services.
game.registerService<Context>('context', Context, true);

// Start game.
game.start();
