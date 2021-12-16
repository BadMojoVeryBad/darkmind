import { Node, injectable } from 'phaser-node-framework';

@injectable()
export class CutsceneNode extends Node {
  public getName(): string {
    throw new Error('CutsceneNode::getName() must be overridden by child!');
  }

  public async playCutscene(): Promise<void> {
    throw new Error('CutsceneNode::playCutscene() must be overridden by child!');
  }

  public create(): void {
    this.scene.events.on('cutscene.play.' + this.getName(), () => {
      this.playCutscene();
    });
  }

  public async sleep(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time));
  }
}
