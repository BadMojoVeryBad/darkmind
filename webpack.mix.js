let mix = require('laravel-mix');

mix.ts('src/game.ts', 'dist/')
    .copy('src/index.html', 'dist/')
    .copy('assets', 'dist/assets')
    .setPublicPath('dist/')
    .sourceMaps()
    .version();
