import { Node } from "phaser-node-framework";

export class VignetteNode extends Node {
  public created(): void {
    const vignette = this.scene.add.image(120, 67.5, 'border');
    vignette.setDepth(900);
    vignette.setScrollFactor(0);
  }
}
