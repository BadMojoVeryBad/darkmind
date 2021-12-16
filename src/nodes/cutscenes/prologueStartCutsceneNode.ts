import { injectable } from 'phaser-node-framework';
import { PlayerNode } from '../playerNode';
import { CutsceneNode } from './CutsceneNode';

@injectable()
export class PrologueStartCutsceneNode extends CutsceneNode {
  private player: PlayerNode;

  public create(): void {
    super.create();

    this.scene.events.on('playerCreated', (player: PlayerNode) => {
      this.player = player;
    });
  }

  public getName(): string {
    return 'prologue_start'
  }

  public async playCutscene(): Promise<void> {
    console.log('Starting cutscene.');

    this.scene.events.emit('player.disable_controls');

    this.scene.events.emit('camera.zoom', 2);

    this.scene.events.emit('camera.move_to', 10, 10);

    this.scene.events.emit('player.move_to', 10, 10);

    this.scene.events.emit('player.fall_down');

    await this.sleep(2000);

    this.scene.events.emit('player.get_up');

    this.scene.events.emit('camera.follow', this.player.getSprite());

    this.scene.events.emit('camera.zoom', 1);

    this.scene.events.emit('player.disable_controls');

    console.log('Ending cutscene.');
  }
}
