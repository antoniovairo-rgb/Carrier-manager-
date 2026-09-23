#!/usr/bin/env node
// Requires sharp (npm install --no-save sharp). The source PNGs stay outside Git.
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); }
catch { throw new Error('Manca sharp: installa la dipendenza con npm install --no-save sharp'); }

const lotFile = process.argv[2];
if (!lotFile || process.argv.length !== 3) {
  console.error('Uso: node tools/ritratti/ritaglia.mjs tools/ritratti/lotti/pilota.json');
  process.exit(2);
}
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const lot = JSON.parse(await readFile(resolve(lotFile), 'utf8'));
if (!/^[a-z0-9-]+$/.test(lot.lotto) || !Array.isArray(lot.fogli)) throw new Error('Lotto non valido');
const rawBase = process.env.RITRATTI_RAW_BASE ? resolve(process.env.RITRATTI_RAW_BASE) : join(homedir(), 'ritratti-grezzi');
const rawRoot = join(rawBase, lot.lotto);
const outputDir = join(repoRoot, 'assets', 'portraits', 'ai', lot.lotto);
const manifestPath = join(repoRoot, 'assets', 'portraits', 'ai', 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(await readFile(manifestPath, 'utf8')) : [];
if (!Array.isArray(manifest)) throw new Error('Il manifest deve essere un array');
const positions = ['alto-sinistra', 'alto-destra', 'basso-sinistra', 'basso-destra'];
const today = new Date().toISOString().slice(0, 10);
await mkdir(outputDir, { recursive: true });

for (const sheet of lot.fogli) {
  if (!Number.isInteger(sheet.numero) || !Array.isArray(sheet.volti) || sheet.volti.length !== 4) {
    throw new Error('Foglio o lista dei quattro volti non valida');
  }
  const rawPath = join(rawRoot, `foglio-${String(sheet.numero).padStart(3, '0')}.png`);
  if (!existsSync(rawPath)) throw new Error(`Foglio grezzo mancante: ${rawPath}`);
  const image = sharp(rawPath);
  const { width, height } = await image.metadata();
  if (width !== 1024 || height !== 1024) throw new Error(`${rawPath}: atteso 1024x1024, trovato ${width}x${height}`);
  for (let index = 0; index < 4; index++) {
    const face = sheet.volti[index];
    if (!/^ai-\d{4,}$/.test(face.id)) throw new Error(`ID non valido: ${face.id}`);
    const relativeFile = `assets/portraits/ai/${lot.lotto}/volto-${face.id.slice(3)}.webp`;
    const target = join(repoRoot, ...relativeFile.split('/'));
    const previous = manifest.find((entry) => entry.id === face.id);
    if (previous && (previous.file !== relativeFile || previous.lotto !== lot.lotto || previous.foglio !== sheet.numero || previous.posizione !== positions[index])) {
      throw new Error(`${face.id}: ID già assegnato a un altro volto`);
    }
    if (!existsSync(target)) {
      const left = (index % 2) * 512;
      const top = Math.floor(index / 2) * 512;
      await sharp(rawPath).extract({ left, top, width: 512, height: 512 })
        .webp({ quality: 80 }).toFile(target);
      console.log(`${face.id}: ritagliato`);
    } else {
      const output = await sharp(target).metadata();
      if (output.width !== 512 || output.height !== 512 || output.format !== 'webp') {
        throw new Error(`${face.id}: file esistente non conforme, non sovrascritto`);
      }
      console.log(`${face.id}: già presente, saltato`);
    }
    if (!previous) {
      manifest.push({
        id: face.id, categoria: face.categoria, eta: face.eta,
        carnagione: face.carnagione, capelli: face.capelli, barba: face.barba,
        viso: face.viso, tratto: face.tratto, file: relativeFile,
        lotto: lot.lotto, foglio: sheet.numero, posizione: positions[index], data: today,
        controlli: { fondaleBianco: null, magliaNeutra: null, possibiliDoppioni: [] },
      });
    }
  }
}
manifest.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
await mkdir(dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Manifest: ${manifest.length} volti`);
