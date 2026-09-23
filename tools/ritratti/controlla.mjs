#!/usr/bin/env node
// Automated triage only: a person must still review face identity and anatomy.
import { createRequire } from 'node:module';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { throw new Error('Manca sharp: installa la dipendenza con npm install --no-save sharp'); }

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const lotName = process.argv[2];
if (!/^[a-z0-9-]+$/.test(lotName || '') || process.argv.length !== 3) {
  console.error('Uso: node tools/ritratti/controlla.mjs pilota');
  process.exit(2);
}
const manifestPath = join(repoRoot, 'assets', 'portraits', 'ai', 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!Array.isArray(manifest)) throw new Error('Il manifest deve essere un array');
const newFaces = manifest.filter((face) => face.lotto === lotName);
if (!newFaces.length) throw new Error(`Nessun volto nel lotto ${lotName}`);

// A 63-bit perceptual DCT hash; independent of exact JPEG/WebP bytes.
const cosine = Array.from({ length: 8 }, (_, u) =>
  Array.from({ length: 32 }, (_, x) => Math.cos(((2 * x + 1) * u * Math.PI) / 64)));
async function perceptualHash(input) {
  const { data } = await sharp(input).resize(32, 32).greyscale().raw().toBuffer({ resolveWithObject: true });
  const coefficients = [];
  for (let v = 0; v < 8; v++) {
    for (let u = 0; u < 8; u++) {
      if (u === 0 && v === 0) continue;
      let sum = 0;
      for (let y = 0; y < 32; y++) {
        for (let x = 0; x < 32; x++) sum += data[y * 32 + x] * cosine[u][x] * cosine[v][y];
      }
      coefficients.push(sum);
    }
  }
  const sorted = [...coefficients].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  let hash = 0n;
  for (const coefficient of coefficients) hash = (hash << 1n) | BigInt(coefficient >= median);
  return hash;
}
// The shared white background and identical pose make a face-only pHash noisy.
// Confirm a hash match with colour pixels from the central face before flagging.
async function facePixels(input) {
  const normalized = await sharp(input).resize(512, 512).toBuffer();
  return sharp(normalized).extract({ left: 105, top: 30, width: 302, height: 350 })
    .resize(64, 64).removeAlpha().raw().toBuffer();
}
function faceDistance(a, b) {
  let sum = 0;
  for (let index = 0; index < a.length; index++) sum += Math.abs(a[index] - b[index]);
  return sum / a.length / 255;
}
function hamming(a, b) {
  let value = a ^ b;
  let count = 0;
  while (value) { value &= value - 1n; count++; }
  return count;
}
async function appearanceChecks(input) {
  const { data, info } = await sharp(input).resize(128, 128).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgb = (x, y) => {
    const offset = (y * info.width + x) * info.channels;
    return [data[offset], data[offset + 1], data[offset + 2]];
  };
  let backgroundTotal = 0;
  let backgroundWhite = 0;
  let shirtNeutral = 0;
  for (let y = 0; y < 128; y++) {
    for (let x = 0; x < 128; x++) {
      const [r, g, b] = rgb(x, y);
      const maximum = Math.max(r, g, b);
      const minimum = Math.min(r, g, b);
      const nearWhite = minimum >= 235 && maximum - minimum <= 20;
      const backgroundSample = (y < 19 && (x < 26 || x > 101)) ||
        (y >= 26 && y < 83 && (x < 9 || x > 118));
      if (backgroundSample) { backgroundTotal++; if (nearWhite) backgroundWhite++; }
      // Broad lower band: the former higher/outer samples included neck skin.
      const shirtSample = y >= 106 && x >= 20 && x < 108;
      if (shirtSample && maximum > 65 && maximum < 248 &&
          (maximum - minimum) / maximum <= 0.18) shirtNeutral++;
    }
  }
  return {
    fondaleBianco: backgroundWhite / backgroundTotal >= 0.9,
    magliaNeutra: shirtNeutral >= 350,
  };
}

const references = [];
for (const face of manifest) {
  const imagePath = join(repoRoot, ...face.file.split('/'));
  if (!existsSync(imagePath)) continue;
  references.push({ id: face.id, hash: await perceptualHash(imagePath), pixels: await facePixels(imagePath) });
}
const castDir = join(repoRoot, 'assets', 'portraits');
for (const filename of (await readdir(castDir)).filter((name) => /^cast-.*\.jpe?g$/i.test(name))) {
  const imagePath = join(castDir, filename);
  const { width, height } = await sharp(imagePath).metadata();
  if (!width || !height) continue;
  const halfWidth = Math.floor(width / 2);
  const halfHeight = Math.floor(height / 2);
  for (let quadrant = 0; quadrant < 4; quadrant++) {
    const left = (quadrant % 2) * halfWidth;
    const top = Math.floor(quadrant / 2) * halfHeight;
    const crop = await sharp(imagePath).extract({ left, top, width: halfWidth, height: halfHeight }).toBuffer();
    references.push({ id: `${filename}#${quadrant + 1}`, hash: await perceptualHash(crop), pixels: await facePixels(crop) });
  }
}

let flagged = 0;
for (const face of newFaces) {
  const imagePath = join(repoRoot, ...face.file.split('/'));
  if (!existsSync(imagePath)) throw new Error(`${face.id}: immagine mancante`);
  const hash = references.find((reference) => reference.id === face.id)?.hash ?? await perceptualHash(imagePath);
  const pixels = references.find((reference) => reference.id === face.id)?.pixels ?? await facePixels(imagePath);
  const checks = await appearanceChecks(imagePath);
  const possibleDuplicates = references.filter((reference) => reference.id !== face.id &&
    hamming(hash, reference.hash) <= 8 && faceDistance(pixels, reference.pixels) <= 0.04)
    .map((reference) => reference.id).sort();
  face.controlli = { ...checks, possibiliDoppioni: possibleDuplicates };
  if (!checks.fondaleBianco || !checks.magliaNeutra || possibleDuplicates.length) flagged++;
  console.log(`${face.id}: fondale=${checks.fondaleBianco} maglia=${checks.magliaNeutra} possibiliDoppioni=${possibleDuplicates.length}`);
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`${newFaces.length} volti controllati; ${flagged} da rivedere manualmente`);
