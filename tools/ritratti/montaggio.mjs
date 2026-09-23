#!/usr/bin/env node
// Create a review sheet without changing the portraits or their manifest.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const [lotName, outputFile] = process.argv.slice(2);
if (!/^[a-z0-9-]+$/.test(lotName ?? '') || !outputFile || process.argv.length !== 4) {
  throw new Error('Uso: node tools/ritratti/montaggio.mjs <lotto> <anteprima.jpg>');
}
const output = resolve(outputFile);
if (existsSync(output)) throw new Error(`Anteprima già presente: ${output}`);
const manifest = JSON.parse(await readFile(join(repoRoot, 'assets/portraits/ai/manifest.json'), 'utf8'));
const faces = manifest.filter((face) => face.lotto === lotName);
if (!faces.length) throw new Error(`Nessun volto nel lotto ${lotName}`);
const columns = Math.min(12, faces.length);
const cellWidth = 160;
const imageHeight = 160;
const labelHeight = 28;
const cellHeight = imageHeight + labelHeight;
const rows = Math.ceil(faces.length / columns);
const overlays = [];
for (let index = 0; index < faces.length; index++) {
  const face = faces[index];
  const source = join(repoRoot, ...face.file.split('/'));
  if (!existsSync(source)) throw new Error(`${face.id}: file mancante`);
  const left = (index % columns) * cellWidth;
  const top = Math.floor(index / columns) * cellHeight;
  overlays.push({ input: await sharp(source).resize(cellWidth, imageHeight).toBuffer(), left, top });
  const label = `<svg width="${cellWidth}" height="${labelHeight}"><rect width="100%" height="100%" fill="#20242a"/><text x="8" y="19" fill="white" font-family="Arial" font-size="17">${face.id}</text></svg>`;
  overlays.push({ input: Buffer.from(label), left, top: top + imageHeight });
}
await sharp({ create: { width: columns * cellWidth, height: rows * cellHeight, channels: 3, background: '#ffffff' } })
  .composite(overlays).jpeg({ quality: 86 }).toFile(output);
console.log(`${faces.length} volti nel montaggio: ${output}`);
