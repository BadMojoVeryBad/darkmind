import { injectable } from 'phaser-node-framework';
import { Direction } from '../characters/characterNode';
import { PlayerCharacterNode } from '../characters/PlayerCharacterNode';
import { CutsceneNode } from './CutsceneNode';

// TODO: A nice way of playing dialogue boxes.
@injectable()
export class TestCutsceneNode extends CutsceneNode {
  private player: PlayerCharacterNode;

  public create(): void {
    super.create();

    this.scene.events.on('playerCharacterCreated', (player: PlayerCharacterNode) => {
      this.player = player;
    });
  }

  public getName(): string {
    return 'test'
  }

  public async playCutscene(): Promise<void> {

    this.player.disableControls();

    await this.sleep(1000);

    this.player.faceDirection(Direction.LEFT);

    await this.sleep(1000);

    this.player.faceDirection(Direction.RIGHT);

    await this.sleep(1000);

    await this.doDialogue('test');

    this.player.enableControls();
  }
}
