import { Node } from "phaser-node-framework";

export class DepthData {
  constructor(
    public obj: (Phaser.GameObjects.Components.Depth & Phaser.GameObjects.Components.Transform),
    public offset: number = 0,
    public layer: number = 0
  ) {}
}

export class DepthOrderingNode extends Node {
  private gameObjects: DepthData[] = [];

  public update(): void {
    this.gameObjects = [];
    this.scene.events.emit('depth-ordering.collect-objects', this.gameObjects);

    this.gameObjects.sort((a, b): number => {
      return (a.obj.y + a.offset) - (b.obj.y + b.offset);
    });

    // Level 1.
    let depth = 500;
    for (const data of this.gameObjects.filter(data => data.layer === 0)) {
      data.obj.setDepth(depth++);
    }

    // Level 2.
    depth = 600;
    for (const data of this.gameObjects.filter(data => data.layer === 1)) {
      data.obj.setDepth(depth++);
    }

    // Level 3.
    depth = 700;
    for (const data of this.gameObjects.filter(data => data.layer === 2)) {
      data.obj.setDepth(depth++);
    }
  }
}
