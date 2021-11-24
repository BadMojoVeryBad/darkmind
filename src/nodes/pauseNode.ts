import { Node, injectable } from 'phaser-node-framework';

/**
 * Pauses the game on blur.
 */
@injectable()
export class PauseNode extends Node {
  public create(): void {
    this.scene.game.events.on('blur', () => {
      this.scene.events.emit('pause');
      this.scene.scene.pause();
    });

    this.scene.game.events.on('focus', () => {
      this.scene.events.emit('unpause');
      this.scene.scene.resume();
    });
  }
}
