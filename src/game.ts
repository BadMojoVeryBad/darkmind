import 'reflect-metadata';
import { Game } from 'phaser-node-framework';
import { PlayerNode } from './nodes/playerNode';
import { DefaultScene } from './scenes/defaultScene';
import { Context } from './contexts/context';
import { CameraNode } from './nodes/cameraNode';
import { MapNode } from './nodes/mapNode';
import { IslandParticles } from './nodes/islandParticles';
import { NodeStateInterface } from './states/nodeStateInterface';
import { PlayerContext } from './states/playerStates/playerContext';
import { IdleState } from './states/playerStates/idleState';
import { RunningState } from './states/playerStates/runningState';
import { MathServiceInterface } from './services/mathServiceInterface';
import { MathService } from './services/mathService';
import { DashingState } from './states/playerStates/dashingState';
import { CONSTANTS } from './constants';
import { CharacterLight } from './nodes/characterLight';
import { LightParticles } from './nodes/lightParticles';
import { DeadState } from './states/playerStates/deadState';
import { PlatformNode } from './nodes/platformNode';
import { TilemapStrategyInterface } from './services/tilemapServiceInterface';
import { TilemapService } from './services/tilemapService';
import { MapCollisionNode } from './nodes/mapCollisionNode';
import { MapMaskNode } from './nodes/mapMaskNode';
import { PauseNode } from './nodes/pauseNode';
import { CharacterShadowShader } from './shaders/characterShadowShader';

// Create a game.
const game = Game.create(CONSTANTS.GAME_WIDTH, CONSTANTS.GAME_HEIGHT, {
  backgroundColor: CONSTANTS.COLOR_DARKEST_HEX,
  loadingColor: CONSTANTS.COLOR_DARK_HEX,
  // debug: true
});

// Register scenes.
game.registerScene('default', DefaultScene);

// Register components.
game.registerNode('pause', PauseNode);
game.registerNode('player', PlayerNode);
game.registerNode('characterLight', CharacterLight);
game.registerNode('camera', CameraNode);
game.registerNode('map', MapNode);
game.registerNode('mapCollision', MapCollisionNode);
game.registerNode('mapMask', MapMaskNode);
game.registerNode('islandParticles', IslandParticles);
game.registerNode('lightParticles', LightParticles);
game.registerNode('platform', PlatformNode);

// Register assets.
game.registerAsset('tiles', 'assets/tiles/main.png');
game.registerAsset('debugMap', 'assets/maps/debug.json');
game.registerAsset('textures', 'assets/textures.png', 'assets/textures.json');

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
game.registerAnimation('textures', 'puff', 1, 7, false, 24);
game.registerAnimation('textures', 'platformIdle', 1, 8, true, 12);
game.registerAnimation('textures', 'platformWiggling', 1, 2, true, 12);
game.registerAnimation('textures', 'platformIdleMask', 1, 8, true, 12);
game.registerAnimation('textures', 'platformWigglingMask', 1, 2, true, 12);

// Register controls.
game.registerControl('UP', 'Keyboard.38', 'Gamepad.UP', 'Gamepad.STICK_LEFT_UP');
game.registerControl('DOWN', 'Keyboard.40', 'Gamepad.DOWN', 'Gamepad.STICK_LEFT_DOWN');
game.registerControl('LEFT', 'Keyboard.37', 'Gamepad.LEFT', 'Gamepad.STICK_LEFT_LEFT');
game.registerControl('RIGHT', 'Keyboard.39', 'Gamepad.RIGHT', 'Gamepad.STICK_LEFT_RIGHT');
game.registerControl(CONSTANTS.CONTROL_DASH, 'Keyboard.32', 'Gamepad.A');

// Register services.
game.registerService<Context>('context', Context, true);
game.registerService<MathServiceInterface>('mathService', MathService);
game.registerService<TilemapStrategyInterface>('tilemapService', TilemapService);
game.registerService<NodeStateInterface<PlayerContext>>('playerIdleState', IdleState);
game.registerService<NodeStateInterface<PlayerContext>>('playerDashingState', DashingState);
game.registerService<NodeStateInterface<PlayerContext>>('playerRunningState', RunningState);
game.registerService<NodeStateInterface<PlayerContext>>('playerDeadState', DeadState);

// WebGL pipelines.
game.registerPipeline('characterShadowShader', CharacterShadowShader);

// Start game.
game.start();
