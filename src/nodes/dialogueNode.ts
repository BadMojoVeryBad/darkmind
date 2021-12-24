import { Node, injectable, inject, ControlsInterface } from 'phaser-node-framework';
import { CONSTANTS } from '../constants';
import { Dialogue } from '../services/dialogue/dialogue';
import { DialogueFactoryInterface } from '../services/dialogue/dialogueFactoryInterface';
import { TextNode } from './textNode';

class States {
  private states: Array<Function> = [];
  private names: Array<string> = [];
  private currentIndex = 0;

  add (name: string, fn: Function) {
    this.names.push(name);
    this.states.push(fn);
  }

  getState(): string {
    return this.names[this.currentIndex];
  }

  run(): void {
    const name = this.states[this.currentIndex]();
    this.setState(name);
  }

  setState(name: string): void {
    for (let i = 0; i < this.names.length; i++) {
      if (name === this.names[i]) {
        this.currentIndex = i;
      }
    }
  }
}

@injectable()
export class DialogueNode extends Node {
  private dialogueBackground: Phaser.GameObjects.Image;
  private textNode: TextNode;
  private textNode2: TextNode;
  private portrait: Phaser.GameObjects.Sprite;
  private arrow: Phaser.GameObjects.Sprite;
  private currentDialogConfig: Dialogue[] = [];
  private currentDialogConfigIndex: number = -1;
  private currentDialogConfigName = '';
  private active = false;
  private activatePressedLastFrame = 0;
  private typedTime = 0;
  private states: States = new States();

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

    this.textNode = this.addNode('text', {}) as TextNode;
    this.textNode2 = this.addNode('text', {}) as TextNode;

    this.portrait = this.scene.add.sprite(0, 0, 'textures', 'playerPortraitHappy')
      .setScrollFactor(0).setDepth(1001).setOrigin(0, 0)
      .setPosition(16, 80)
      .setScale(1);

    this.arrow = this.scene.add.sprite(0, 0, 'textures', 'arrow')
      .setScrollFactor(0).setDepth(1001).setOrigin(0, 0)
      .setPosition(210, 114)
      .setScale(1);
    this.arrow.anims.play('arrow');

    this.states.add('hidden', () => {
      this.dialogueBackground.setVisible(false);
      this.textNode.getText().setVisible(false);
      this.textNode2.getText().setVisible(false);
      this.portrait.setVisible(false);
      this.arrow.setVisible(false);

      if (this.active) {
        return 'new_line';
      }

      return 'hidden';
    });

    this.states.add('new_line', () => {
      this.arrow.setVisible(false);
      this.typedTime = 0;
      this.currentDialogConfigIndex++;
      const config = this.currentDialogConfig[this.currentDialogConfigIndex];

      // Change portrait.
      this.portrait.setTexture('textures', config.character + 'Portrait' + this.capitalizeFirstLetter(config.portrait));

      // Change text.
      this.textNode.setText(config.text[0]);
      this.textNode2.setText('');

      return 'typing';
    });

    this.states.add('line_break', () => {
      const config = this.currentDialogConfig[this.currentDialogConfigIndex];
      this.textNode2.setText(config.text[1]);
      return 'typing';
    });

    this.states.add('typing', () => {
      this.dialogueBackground.setVisible(true);
      this.textNode.getText().setVisible(true);
      this.textNode2.getText().setVisible(true);
      this.portrait.setVisible(true);

      const config = this.currentDialogConfig[this.currentDialogConfigIndex];

      // If activate button is pressed, go to "typed" state.
      if (!this.activatePressedLastFrame && this.controls.isActive(CONSTANTS.CONTROL_ACTIVATE)) {
        return 'typed';
      }

      // If there's a second line, start typing it.
      if (this.textNode.getProgress() === 1 && config.text.length > 1 && this.textNode2.getTextToWrite() === '') {
        return 'line_break';
      }

      // If the text is done typing go to "typed" state.
      const has2Lines = config.text.length > 1;
      const isDone = (has2Lines) ? this.textNode2.getProgress() === 1 && this.textNode.getProgress() === 1 : this.textNode.getProgress() === 1;
      if (isDone) {
        return 'typed';
      }

      return 'typing';
    });

    this.states.add('typed', () => {
      const config = this.currentDialogConfig[this.currentDialogConfigIndex];
      this.arrow.setVisible(!config.progressAutomatically);

      if (this.typedTime === 0) {
        this.typedTime = this.scene.game.getTime();
      }

      // Display all text.
      this.textNode.showFullText();
      if (this.currentDialogConfig[this.currentDialogConfigIndex].text.length > 1) {
        this.textNode2.setText(this.currentDialogConfig[this.currentDialogConfigIndex].text[1]);
        this.textNode2.showFullText();
      }

      // If activate button is pressed, got to "typing" and progress
      // line. If there's no more lines, return hidden.
      if (!this.activatePressedLastFrame && this.controls.isActive(CONSTANTS.CONTROL_ACTIVATE)) {
        if (this.currentDialogConfigIndex >= this.currentDialogConfig.length - 1) {
          this.active = false;
          this.scene.events.emit('dialogue.end', this.currentDialogConfigName);
          return 'hidden';
        } else {
          return 'new_line';
        }
      }

      // If the automatic timer is up, go to next line.
      if (config.progressAutomatically && this.typedTime + config.progressAutomaticallyAfter < this.scene.game.getTime()) {
        if (this.currentDialogConfigIndex >= this.currentDialogConfig.length - 1) {
          this.active = false;
          this.scene.events.emit('dialogue.end', this.currentDialogConfigName);
          return 'hidden';
        } else {
          return 'new_line';
        }
      }

      return 'typed';
    });

    this.states.setState('hidden');

    // On an event, start a dialogue.
    this.scene.events.on('dialogue.start', (name: string) => {
      this.currentDialogConfig = this.dialogueFactory.create(name);
      this.currentDialogConfigName = name;
      this.currentDialogConfigIndex = -1;
      this.active = true;
    });
  }

  created(): void {
    this.textNode.getText()
      .setPosition(72, 94);

    this.textNode2.getText()
      .setPosition(72, 108);
  }

  public update(time: number, delta: number): void {
    this.states.run();
    this.activatePressedLastFrame = this.controls.isActive(CONSTANTS.CONTROL_ACTIVATE);
  }

  private capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
