export class Dialogue {
  public character: string = '';
  public portrait: string = '';
  public progressAutomatically: boolean = false;
  public progressAutomaticallyAfter: number = 0;
  public text: string[] = [];

  constructor(config: string) {
    const exploded = config.split('|');
    this.character = exploded.shift();
    this.portrait = exploded.shift();
    const progressType = exploded.shift();
    this.progressAutomatically = progressType !== 'manual';
    if (this.progressAutomatically) {
      this.progressAutomaticallyAfter = Number.parseInt(progressType.split(':').pop());
    }
    this.text = exploded;
  }
}
