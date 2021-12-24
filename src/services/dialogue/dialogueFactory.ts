import { injectable } from 'inversify';
import dialogueTest from '../../dialogues/dialogueTest.json';
import { Dialogue } from './dialogue';
import { DialogueFactoryInterface } from './dialogueFactoryInterface';

@injectable()
export class DialogueFactory implements DialogueFactoryInterface {
  public create(name: string): Dialogue[] {
    const map = this.getDialogMap();
    const config = map[name];

    const dialogues = [];
    for (const line of config) {
      dialogues.push(new Dialogue(line));
    }

    return dialogues;
  }

  private getDialogMap(): Record<string, string[]> {
    return {
      'test': dialogueTest as string[]
    };
  }
}
