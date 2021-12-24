import { Node, injectable, inject, ControlsInterface } from 'phaser-node-framework';
import { CONSTANTS } from '../constants';
import { Dialogue } from '../services/dialogue/dialogue';
import { DialogueFactoryInterface } from '../services/dialogue/dialogueFactoryInterface';

@injectable()
export class DialogueNode extends Node {
  private dialogueBackground: Phaser.GameObjects.Image;
  private text: Phaser.GameObjects.BitmapText;
  private text2: Phaser.GameObjects.BitmapText;
  private portrait: Phaser.GameObjects.Sprite;
  private active: boolean = false;
  private canContinue = true;
  private canContinueTime = 0;
  private currentDialogConfig: Dialogue[] = [];
  private currentDialogConfigIndex: number = 0;
  private changedTime = 0;

  constructor(
    @inject('controls') private controls: ControlsInterface,
    @inject('dialogueFactory') private dialogueFactory: DialogueFactoryInterface,
  ) {
    super();
  }

  public create(): void {
    this.dialogueBackground = this.scene.add.image(0, 0, 'textures', 'dialogueBackground')
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(0, 0);

    this.text = this.scene.add.bitmapText(0, 0, 'pixelFont', 'Hello there! It\'s been')
      .setScrollFactor(0)
      .setDepth(1001)
      .setPosition(72, 94)
      .setScale(0.5);

    this.text2 = this.scene.add.bitmapText(0, 0, 'pixelFont', 'a while!')
      .setScrollFactor(0).setDepth(1001)
      .setPosition(72, 108)
      .setScale(0.5);

    this.portrait = this.scene.add.sprite(0, 0, 'textures', 'playerPortraitHappy')
      .setScrollFactor(0).setDepth(1001).setOrigin(0, 0)
      .setPosition(16, 80)
      .setScale(1);

    this.endDialog();

    // On an event, start a dialogue.
    this.scene.events.on('dialogue.start', (name: string) => {
      this.startDialog(name);
    });
  }

  public update(time: number, delta: number): void {
    // If the action button is pressed, do the next dialog thing.
    if (this.active) {
      const config = this.currentDialogConfig[this.currentDialogConfigIndex];

      // Continue manually.
      if (this.controls.isActive(CONSTANTS.CONTROL_ACTIVATE) && this.canContinue && !config.progressAutomatically) {
        this.canContinue = false;
        this.canContinueTime = time + 500;
        this.nextDialog();
        this.changedTime = time;
      }

      // Continue automatically.
      if (config.progressAutomatically && this.changedTime + config.progressAutomaticallyAfter < time) {
        this.canContinue = false;
        this.canContinueTime = time + 500;
        this.nextDialog();
        this.changedTime = time;
      }

      // This prevents the user holding down the action key
      // to progress heaps.
      if (time > this.canContinueTime) {
        this.canContinue = true;
      }
    }
  }

  private startDialog(name: string) {
    this.active = true;
    this.currentDialogConfig = this.dialogueFactory.create(name);
    this.currentDialogConfigIndex = -1;

    this.dialogueBackground.setVisible(true);
    this.text.setVisible(true);
    this.text2.setVisible(true);
    this.portrait.setVisible(true);

    this.nextDialog();
  }

  private endDialog() {
    this.active = false;
    this.currentDialogConfig = [];
    this.currentDialogConfigIndex = -1;

    this.dialogueBackground.setVisible(false);
    this.text.setVisible(false);
    this.text2.setVisible(false);
    this.portrait.setVisible(false);
  }

  private nextDialog() {
    this.currentDialogConfigIndex++;

    // End the dialogue if there's no more lines.
    if (this.currentDialogConfigIndex >= this.currentDialogConfig.length) {
      this.endDialog();
      return;
    }

    // Start the next one.
    const config = this.currentDialogConfig[this.currentDialogConfigIndex];

    // Change portrait.
    this.portrait.setTexture('textures', config.character + 'Portrait' + this.capitalizeFirstLetter(config.portrait));

    // Change text.
    this.text.setText(config.text[0]);
    if (config.text.length > 1) {
      this.text2.setText(config.text[1]);
    } else {
      this.text2.setText('');
    }
  }

  private capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
