// @ts-nocheck
const fragShader = `
#define SHADER_NAME COLOR_SHADER
precision mediump float;

uniform vec2      uResolution;
uniform sampler2D uMainSampler;
varying vec2      outTexCoord;

// Effect parameters
uniform float fadeAmount;

void main( void )
{
    // Get pixel.
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    // Get pixel color.
    vec4 color = texture2D(uMainSampler, outTexCoord);

    // Darkest
    if (fadeAmount >= 0.75) {
      // Set color.
      gl_FragColor = vec4(0.101960784313725,0.090196078431373,0.07843137254902,1);
    }

    // Dark
    if (fadeAmount >= 0.5 && fadeAmount < 0.75) {
      // Set color.
      // Lightest > Dark
      if (color.r <= 1.0 && color.r > 0.784313725490196) {
        gl_FragColor = vec4(0.219607843137255,0.250980392156863,0.227450980392157,1);
      }

      // Light > Darkest
      else if (color.r <= 0.784313725490196) {
        gl_FragColor = vec4(0.101960784313725,0.090196078431373,0.07843137254902,1);
      }
    }

    // Light
    if (fadeAmount >= 0.25 && fadeAmount < 0.5) {
      // Set color.
      // Lightest > Light
      if (color.r <= 1.0 && color.r > 0.784313725490196) {
        gl_FragColor = vec4(0.380392156862745,0.470588235294118,0.317647058823529,1);
      }

      // Light > Dark
      else if (color.r <= 0.784313725490196 && color.r > 0.392156862745098) {
        gl_FragColor = vec4(0.219607843137255,0.250980392156863,0.227450980392157,1);
      }

      // Dark > Darkest
      else if (color.r <= 0.392156862745098) {
        gl_FragColor = vec4(0.101960784313725,0.090196078431373,0.07843137254902,1);
      }
    }

    // Lightest
    if (fadeAmount >= 0.0 && fadeAmount < 0.25) {
      // Set color.
      // Lightest > Lightest
      if (color.r <= 1.0 && color.r > 0.784313725490196) {
        gl_FragColor = vec4(0.701960784313725,0.698039215686275,0.509803921568627,1);
      }

      // Light > Light
      else if (color.r <= 0.784313725490196 && color.r > 0.392156862745098) {
        gl_FragColor = vec4(0.380392156862745,0.470588235294118,0.317647058823529,1);
      }

      // Dark > Dark
      else if (color.r <= 0.392156862745098 && color.r > 0.0) {
        gl_FragColor = vec4(0.219607843137255,0.250980392156863,0.227450980392157,1);
      }

      // Darkest > Darkest
      else if (color.r == 0.0) {
        gl_FragColor = vec4(0.101960784313725,0.090196078431373,0.07843137254902,1);
      }
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

    this.fadeAmount = 0.0;
  }

  onPreRender(): void {
    this.set1f('uResolution', this.renderer.width);
    this.set1f('fadeAmount', this.fadeAmount);
  }

  setFadeAmount(value) {
    this.fadeAmount = value; // 0: no fade, 1: full fade (dark screen).
    return this;
  }
}
