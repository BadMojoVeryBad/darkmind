import { Node, injectable, inject } from 'phaser-node-framework';
import { TilemapStrategyInterface } from '../services/tilemapServiceInterface';
import { PlayerCharacterNode } from './characters/PlayerCharacterNode';

@injectable()
export class TriggerNode extends Node {
  private x = 0;
  private y = 0;
  private width = 0;
  private height = 0;
  private event = '';
  private triggered = false;
  private zone: Phaser.GameObjects.Zone;
  private player: Phaser.Physics.Arcade.Sprite;

  constructor(@inject('tilemapService') private tilemapService: TilemapStrategyInterface) {
    super();
  }

  public init(data: Record<string, unknown>): void {
    this.x = data.x as number;
    this.y = data.y as number;
    this.width = data.width as number;
    this.height = data.height as number;
    this.event = this.tilemapService.getProperty(data.obj as Phaser.Types.Tilemaps.TiledObject, 'event', '');
  }

  public create(): void {
    this.zone = this.scene.add.zone(0, 0, 0, 0);
    this.zone.setPosition((this.x + this.width * 0.5), (this.y - this.height * 0.5));
    this.zone.setSize(this.width, this.height);
    this.scene.physics.add.existing(this.zone, true);

    this.scene.events.on('playerCharacterCreated', (player: PlayerCharacterNode) => {
      this.player = player.getSprite();
    });
  }

  public update(): void {
    if (!this.triggered && this.player && this.scene.physics.overlap(this.player, this.zone)) {
      this.scene.events.emit(this.event);
      this.triggered = true;
    }
  }
}
