#!/usr/bin/env node
// Read-only structural audit of the generated portrait catalog.
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(await readFile(join(root, 'assets/portraits/ai/manifest.json'), 'utf8'));
if (!Array.isArray(manifest)) throw new Error('Manifest non valido');
const ids = new Set();
const hashes = new Map();
const problems = [];
const categories = { giocatore: 0, staff: 0 };
const lots = {};
let white = 0;
let neutral = 0;
let possibleDuplicates = 0;
for (const face of manifest) {
  if (!/^ai-\d{4,}$/.test(face.id) || ids.has(face.id)) problems.push(`ID duplicato o errato: ${face.id}`);
  ids.add(face.id);
  if (!Object.hasOwn(categories, face.categoria)) problems.push(`Categoria errata: ${face.id}`);
  else categories[face.categoria]++;
  lots[face.lotto] = (lots[face.lotto] ?? 0) + 1;
  const expected = `assets/portraits/ai/${face.lotto}/volto-${face.id.slice(3)}.webp`;
  if (face.file !== expected) problems.push(`Percorso inatteso: ${face.id}`);
  const absolute = join(root, ...face.file.split('/'));
  if (!existsSync(absolute)) { problems.push(`File mancante: ${face.id}`); continue; }
  const { width, height, format } = await sharp(absolute).metadata();
  if (width !== 512 || height !== 512 || format !== 'webp') problems.push(`Formato errato: ${face.id}`);
  const hash = createHash('sha256').update(await readFile(absolute)).digest('hex');
  if (hashes.has(hash)) problems.push(`File identico: ${face.id} e ${hashes.get(hash)}`);
  hashes.set(hash, face.id);
  if (face.controlli?.fondaleBianco === true) white++;
  if (face.controlli?.magliaNeutra === true) neutral++;
  if (face.controlli?.possibiliDoppioni?.length) possibleDuplicates++;
}
for (let number = 1; number <= manifest.length; number++) {
  const id = `ai-${String(number).padStart(4, '0')}`;
  if (!ids.has(id)) problems.push(`ID mancante: ${id}`);
}
const result = { volti: manifest.length, categorie: categories, lotti: lots,
  fondaliBianchi: white, maglieNeutre: neutral, conPossibiliDoppioni: possibleDuplicates,
  problemi: problems };
console.log(JSON.stringify(result, null, 2));
if (problems.length) process.exitCode = 1;
