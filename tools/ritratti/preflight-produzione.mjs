#!/usr/bin/env node
// Read-only budget and consent check for a single proposed paid portrait lot.
// This program never sends API requests or changes any file.
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const file = process.argv[2];
if (!file || process.argv.length !== 3) {
  console.error('Uso: node tools/ritratti/preflight-produzione.mjs <lotto.json>');
  process.exit(2);
}
const lot = JSON.parse(await readFile(resolve(file), 'utf8'));
const root = resolve('assets/portraits/ai');
const manifest = JSON.parse(await readFile(join(root, 'manifest.json'), 'utf8'));
const consents = await readFile('tools/ritratti/CONSENSI.md', 'utf8');
const rawBase = process.env.RITRATTI_RAW_BASE ? resolve(process.env.RITRATTI_RAW_BASE) :
  join(homedir(), 'ritratti-grezzi');
const problems = [];
if (!/^lotto-\d{2}$/.test(lot.lotto) || lot.modello !== 'gpt-image-1-mini' ||
    lot.qualita !== 'medium' || lot.dimensione !== '1024x1024') {
  problems.push('Identificativo, modello, qualità o dimensione fuori dal piano approvabile');
}
if (!Array.isArray(lot.fogli) || lot.fogli.length < 1 || lot.fogli.length > 25) {
  problems.push('Numero di fogli fuori dal limite 1–25');
}
const ids = new Set();
for (const sheet of lot.fogli ?? []) {
  if (!Number.isInteger(sheet.numero) || sheet.numero < 1 ||
      !Array.isArray(sheet.volti) || sheet.volti.length !== 4 ||
      typeof sheet.prompt !== 'string' || sheet.prompt.length < 200 ||
      !sheet.prompt.includes('BIANCO PURO #FFFFFF')) {
    problems.push(`Foglio ${sheet.numero ?? '?'} non conforme`);
    continue;
  }
  for (const face of sheet.volti) {
    if (!/^ai-\d{4,}$/.test(face.id ?? '') || ids.has(face.id) ||
        manifest.some((old) => old.id === face.id && old.lotto !== lot.lotto)) {
      problems.push(`ID duplicato o fuori schema: ${face.id ?? '?'}`);
    }
    ids.add(face.id);
  }
}
const consentCode = lot.lotto.toUpperCase();
const hasConsent = consents.includes(`Risposta esatta di Antonio: AUTORIZZO ${consentCode}`);
if (!hasConsent) problems.push(`Manca il consenso esplicito AUTORIZZO ${consentCode}`);

let usedSheets = 0;
let inputTokens = 0;
let unresolved = 0;
if (existsSync(rawBase)) {
  for (const dirent of await readdir(rawBase, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const folder = join(rawBase, dirent.name);
    for (const filename of await readdir(folder)) {
      if (filename.endsWith('.requested.json')) {
        const stem = filename.replace(/(?:\.retry-\d+)?\.requested\.json$/, '');
        const imagePath = join(folder, `${stem}.png`);
        if (!existsSync(imagePath) || (await stat(imagePath)).size === 0) unresolved++;
      }
      if (!filename.endsWith('.usage.json')) continue;
      const usage = JSON.parse(await readFile(join(folder, filename), 'utf8'));
      if (usage.modello !== 'gpt-image-1-mini' || usage.qualita !== 'medium' ||
          usage.dimensione !== '1024x1024') {
        problems.push(`Prezzo non coperto dal calcolo: ${dirent.name}/${filename}`);
        continue;
      }
      usedSheets++;
      inputTokens += usage.usage?.input_tokens ?? 0;
    }
  }
}
if (unresolved) problems.push(`${unresolved} richiesta/e API senza immagine finale: verificare il billing`);
const missing = (lot.fogli ?? []).filter((sheet) =>
  !existsSync(join(rawBase, lot.lotto, `foglio-${String(sheet.numero).padStart(3, '0')}.png`)));
const missingSheets = missing.length;
const alreadyPresent = (lot.fogli?.length ?? 0) - missingSheets;
const missingPromptChars = missing.reduce((total, sheet) => total + sheet.prompt.length, 0);
// The published per-image medium price is conservative relative to output-token-only arithmetic.
const spentUsdEstimate = usedSheets * 0.011 + inputTokens * 2 / 1_000_000;
const newUsdEstimate = missingSheets * 0.011 + missingPromptChars / 2 * 2 / 1_000_000;
const operationalCapUsd = 4.00; // margin under the user's EUR 5 budget; billing is authoritative.
if (spentUsdEstimate + newUsdEstimate > operationalCapUsd) {
  problems.push('La stima supera la soglia operativa di 4 USD: fermarsi e verificare il billing');
}
console.log(JSON.stringify({
  lotto: lot.lotto, file: basename(file), fogli: lot.fogli?.length ?? 0,
  volti: ids.size, fogliGiaPresenti: alreadyPresent, fogliNuovi: missingSheets,
  consensoRegistrato: hasConsent, costoGiaStimatoUsd: +spentUsdEstimate.toFixed(4),
  costoNuovoStimatoUsd: +newUsdEstimate.toFixed(4),
  sogliaOperativaUsd: operationalCapUsd, problemi: problems,
}, null, 2));
if (problems.length) process.exitCode = 1;
