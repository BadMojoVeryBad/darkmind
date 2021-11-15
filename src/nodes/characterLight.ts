import { Node, injectable } from 'phaser-node-framework';

/**
 * The light that follows the player around.
 */
@injectable()
export class CharacterLight extends Node {
  private follow: Phaser.GameObjects.Sprite;
  private groundLight: Phaser.GameObjects.Sprite;

  constructor() {
    super();
  }

  public init(data: Record<string, unknown>): void {
    this.follow = data.follow as Phaser.GameObjects.Sprite;
  }

  public create(): void {
    this.groundLight = this.scene.add.sprite(0, 0, 'textures', 'groundLight1');
    this.groundLight.anims.play('groundLight');
    this.groundLight.setDepth(30);

    this.scene.events.on('maskRenderTextureCreated', this.onMaskCreated, this);
    this.scene.events.on('postupdate', this.onPostUpdate, this);
  }

  public destroy(): void {
    // TODO: Destroy objects properly.
    this.scene.events.off('maskCreated', this.onMaskCreated, this);
    this.scene.events.off('postupdate', this.onPostUpdate, this);
  }

  private onMaskCreated(mask: Phaser.Display.Masks.BitmapMask): void {
    this.groundLight.setMask(mask);
  }

  private onPostUpdate(): void {
    this.groundLight.x = this.follow.x;
    this.groundLight.y = this.follow.y + 14;
  }
}
