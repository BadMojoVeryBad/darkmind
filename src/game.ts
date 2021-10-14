import 'reflect-metadata';
import { Game } from 'phaser-component-framework';
import { PlayerComponent } from './component/playerComponent';
import { DefaultScene } from './scene/defaultScene';

// Create a game.
const game = Game.create(320, 180);

// Register scenes.
game.registerScene('default', DefaultScene);

// Register components.
game.registerComponent('player', PlayerComponent);

// Register assets.
game.registerAsset('player', 'assets/player.png');

// Register controls.
game.registerControl('UP', 'Keyboard.38', 'Gamepad.R2');

// Start game.
game.start();
