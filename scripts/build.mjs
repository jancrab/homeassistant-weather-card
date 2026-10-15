import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
await build({
    entryPoints: ['homeassistant-weather-card.js'],
    outfile: 'dist/homeassistant-weather-card.js',
    bundle: true, format: 'esm', target: 'es2022', minify: true,
    legalComments: 'eof',
    banner: { js: `/*! Home Assistant Weather Card v${version} | GPL-3.0 | Derived from hazymorning/origami_weather. See LICENSE and docs/upstream.md. */` }
});
