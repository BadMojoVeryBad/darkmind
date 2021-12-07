// @ts-nocheck
const fragShader = `
precision mediump float;
uniform sampler2D uMainSampler[%count%];
uniform float gray;
varying vec2 outTexCoord;
varying float outTexId;
varying vec4 outTint;
varying vec2 fragCoord;
void main()
{
  vec4 texture;
  %forloop%
  gl_FragColor = texture;

  if (gl_FragColor.a > 0.0) {
    gl_FragColor = vec4(0.7843,0.7843,0.7843,1);
  }
}
`;

export class CharacterShadowShader extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  constructor(game) {
    super({
      game: game,
      fragShader,
      uniforms: [
        'uProjectionMatrix',
        'uMainSampler'
      ]
    });
  }
}
