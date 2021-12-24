import { Node, injectable } from 'phaser-node-framework';

@injectable()
export class TextNode extends Node {
  private text: Phaser.GameObjects.BitmapText;
  private textString = '';
  private typedString = '';
  private nextTypeTime = 0;

  public create(): void {
    this.text = this.scene.add.bitmapText(0, 0, 'pixelFont', 'Test.')
      .setScrollFactor(0)
      .setDepth(1001)
      .setScale(0.5);
  }

  public update(time: number, delta: number): void {
    if (time > this.nextTypeTime && this.typedString.length !== this.textString.length) {
      this.nextTypeTime = time + 25;
      this.typedString = this.textString.slice(0, this.typedString.length  + 1);
    }

    this.text.setText(this.typedString);
  }

  public getText() {
    return this.text;
  }

  public getTextToWrite() {
    return this.textString;
  }

  public setText(text: string) {
    this.textString = text;
    this.typedString = '';
    this.nextTypeTime = 0
  }

  public getProgress(): number {
    return this.textString.length / this.typedString.length;
  }

  public showFullText(): void {
    this.text.setText(this.textString);
    this.typedString = this.textString;
  }
}
