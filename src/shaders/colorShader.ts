// @ts-nocheck
const fragShader = `
#define SHADER_NAME COLOR_SHADER
precision mediump float;

uniform vec2      uResolution;
uniform sampler2D uMainSampler;
varying vec2      outTexCoord;

void main( void )
{
    // Get pixel.
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // Get pixel color.
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Darkest
    if (color.r == 0.0) {
      // Set color.
      gl_FragColor = vec4(0.101960784313725,0.090196078431373,0.07843137254902,1);
      // gl_FragColor = vec4(0.098039215686275,0.105882352941176,0.101960784313725,1);
      // gl_FragColor = vec4(0.086274509803922,0.094117647058824,0.180392156862745,1);
    }

    // Dark
    if (color.r == 0.392156862745098) {
      // Set color.
      gl_FragColor = vec4(0.219607843137255,0.250980392156863,0.227450980392157,1);
      // gl_FragColor = vec4(0.16078431372549,0.258823529411765,0.341176470588235,1);
      // gl_FragColor = vec4(0.152941176470588,0.192156862745098,0.32156862745098,1);
    }

    // Light
    if (color.r == 0.784313725490196) {
      // Set color.
      gl_FragColor = vec4(0.380392156862745,0.470588235294118,0.317647058823529,1);
      // gl_FragColor = vec4(0.341176470588235,0.611764705882353,0.603921568627451,1);
      // gl_FragColor = vec4(0.231372549019608,0.305882352941176,0.411764705882353,1);
    }

    // Lightest
    if (color.r == 1.0) {
      // Set color.
      gl_FragColor = vec4(0.701960784313725,0.698039215686275,0.509803921568627,1);
      // gl_FragColor = vec4(0.6,0.788235294117647,0.701960784313725,1);
      // gl_FragColor = vec4(0.454901960784314,0.498039215686275,0.650980392156863,1);
    }
}
`;

export class ColorShader extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      renderTarget: true,
      fragShader,
      uniforms: [
          'uMainSampler'
      ]
    });
  }

  onPreRender(): void {
    this.set1f('uResolution', this.renderer.width);
  }
}
