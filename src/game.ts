import 'reflect-metadata';
import { Game } from 'phaser-component-framework';
import { PlayerComponent } from './components/playerComponent';
import { DefaultScene } from './scenes/defaultScene';
import { Context } from './contexts/context';

// Create a game.
const game = Game.create(240, 135, {
  backgroundColor: 0x081820,
  loadingColor: 0x346856
});

// Register scenes.
game.registerScene('default', DefaultScene);

// Register components.
game.registerComponent('player', PlayerComponent);

// Register assets.
game.registerAsset('playerSprite', 'assets/player.png');

// Register controls.
game.registerControl('UP', 'Keyboard.38', 'Gamepad.UP', 'Gamepad.STICK_LEFT_UP');
game.registerControl('DOWN', 'Keyboard.40', 'Gamepad.DOWN', 'Gamepad.STICK_LEFT_DOWN');
game.registerControl('LEFT', 'Keyboard.37', 'Gamepad.LEFT', 'Gamepad.STICK_LEFT_LEFT');
game.registerControl('RIGHT', 'Keyboard.39', 'Gamepad.RIGHT', 'Gamepad.STICK_LEFT_RIGHT');

// Register services.
game.registerService<Context>('context', Context, true);

// Start game.
game.start();
