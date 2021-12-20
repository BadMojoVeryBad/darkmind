import { injectable } from 'phaser-node-framework';
import { Direction } from '../characters/characterNode';
import { PlayerCharacterNode } from '../characters/PlayerCharacterNode';
import { CutsceneNode } from './CutsceneNode';

@injectable()
export class PrologueStartCutsceneNode extends CutsceneNode {
  private player: PlayerCharacterNode;

  public create(): void {
    super.create();

    this.scene.events.on('playerCharacterCreated', (player: PlayerCharacterNode) => {
      this.player = player;
    });
  }

  public getName(): string {
    return 'prologue_start'
  }

  public async playCutscene(): Promise<void> {
    // console.log('Starting cutscene.');

    // await this.sleep(1000);

    // this.player.disableControls();

    // this.scene.cameras.main.stopFollow();
    // this.scene.cameras.main.pan(this.player.sprite.x, this.player.sprite.y, 1000, Phaser.Math.Easing.Quadratic.InOut);
    // await this.sleep(1000);
    // this.scene.cameras.main.startFollow(this.player.sprite);
    // this.scene.cameras.main.zoomTo(2, 1000, Phaser.Math.Easing.Quadratic.InOut);

    // await this.sleep(2000);

    // this.player.moveTo(182, 1420);

    // await this.sleep(3000);

    // this.player.faceDirection(Direction.LEFT);

    // await this.sleep(1000);

    // this.scene.cameras.main.stopFollow();
    // this.scene.cameras.main.pan(200, 1430, 1000, Phaser.Math.Easing.Quadratic.InOut);
    // await this.sleep(1000);

    // this.player.enableControls();

    // console.log('Ending cutscene.');
  }
}
