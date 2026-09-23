#!/usr/bin/env node
// Run without --execute to validate a lot without making paid API calls.
import { readFile, mkdir, writeFile, link, unlink, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const [lotFile, ...flags] = process.argv.slice(2);
const execute = flags.includes('--execute');
if (!lotFile || flags.some((flag) => flag !== '--execute')) {
  console.error('Uso: node tools/ritratti/genera.mjs tools/ritratti/lotti/pilota.json [--execute]');
  process.exit(2);
}

const lot = JSON.parse(await readFile(resolve(lotFile), 'utf8'));
if (!/^[a-z0-9-]+$/.test(lot.lotto) || !Array.isArray(lot.fogli) || !lot.fogli.length) {
  throw new Error('Lotto o lista fogli non valida');
}
if (lot.dimensione !== '1024x1024' || !lot.modello || !lot.qualita) {
  throw new Error('Modello, qualità e dimensione 1024x1024 sono obbligatori');
}
const numbers = new Set();
const ids = new Set();
for (const sheet of lot.fogli) {
  if (!Number.isInteger(sheet.numero) || sheet.numero < 1 || numbers.has(sheet.numero)) {
    throw new Error('Numeri foglio non unici o non validi');
  }
  numbers.add(sheet.numero);
  if (typeof sheet.prompt !== 'string' || sheet.prompt.length < 200 || /\{volto[1-4]\}/.test(sheet.prompt)) {
    throw new Error(`Prompt mancante o incompleto nel foglio ${sheet.numero}`);
  }
  if (!Array.isArray(sheet.volti) || sheet.volti.length !== 4) {
    throw new Error(`Il foglio ${sheet.numero} deve descrivere quattro volti`);
  }
  for (const face of sheet.volti) {
    if (!/^ai-\d{4,}$/.test(face.id) || ids.has(face.id)) throw new Error(`ID duplicato/non valido: ${face.id}`);
    ids.add(face.id);
    for (const field of ['categoria', 'eta', 'carnagione', 'capelli', 'barba', 'viso', 'tratto']) {
      if (face[field] === undefined || face[field] === '') throw new Error(`${face.id}: manca ${field}`);
    }
  }
}

const rawBase = process.env.RITRATTI_RAW_BASE ? resolve(process.env.RITRATTI_RAW_BASE) : join(homedir(), 'ritratti-grezzi');
const rawRoot = resolve(rawBase, lot.lotto);
const insideRepo = relative(repoRoot, rawRoot);
if (insideRepo === '' || (insideRepo !== '..' && !insideRepo.startsWith(`..${sep}`) && !isAbsolute(insideRepo))) {
  throw new Error('I fogli grezzi devono restare fuori dal repository');
}
console.log(`${lot.lotto}: ${lot.fogli.length} fogli, ${ids.size} volti, ${lot.modello} ${lot.qualita} ${lot.dimensione}`);
console.log(`Fogli grezzi: ${rawRoot}`);
if (!execute) {
  console.log('Solo verifica: nessuna richiesta API eseguita. Aggiungi --execute dopo il consenso del lotto.');
  process.exit(0);
}
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY non impostata; nessuna richiesta inviata');
await mkdir(rawRoot, { recursive: true });

for (const sheet of lot.fogli) {
  const stem = `foglio-${String(sheet.numero).padStart(3, '0')}`;
  const target = join(rawRoot, `${stem}.png`);
  if (existsSync(target) && (await stat(target)).size > 0) {
    console.log(`${stem}: già presente, saltato`);
    continue;
  }
  const requestedPath = join(rawRoot, `${stem}.requested.json`);
  if (existsSync(requestedPath)) {
    throw new Error(`${stem}: richiesta precedente senza PNG finale; controlla il billing prima di riprovare`);
  }
  await writeFile(requestedPath, JSON.stringify({
    startedAt: new Date().toISOString(), modello: lot.modello,
    dimensione: lot.dimensione, qualita: lot.qualita,
  }, null, 2), { flag: 'wx' });
  console.log(`${stem}: richiesta di una immagine in corso`);
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: lot.modello,
      size: lot.dimensione,
      quality: lot.qualita,
      output_format: 'png',
      n: 1,
      prompt: sheet.prompt,
    }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`${stem}: API HTTP ${response.status}: ${body.error?.message || 'risposta non disponibile'}`);
  }
  const body = await response.json();
  const encoded = body.data?.[0]?.b64_json;
  if (!encoded) throw new Error(`${stem}: risposta senza immagine; verifica il billing prima di riprovare`);
  const image = Buffer.from(encoded, 'base64');
  if (image.length < 10_000) throw new Error(`${stem}: immagine troppo piccola; verifica prima di riprovare`);
  const temporary = join(rawRoot, `.${stem}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, image, { flag: 'wx' });
    await link(temporary, target); // exclusive: never replace a previously generated sheet
  } finally {
    await unlink(temporary).catch(() => {});
  }
  await writeFile(join(rawRoot, `${stem}.usage.json`), JSON.stringify({
    modello: lot.modello, dimensione: lot.dimensione, qualita: lot.qualita,
    created: body.created ?? null, usage: body.usage ?? null,
  }, null, 2));
  console.log(`${stem}: salvato fuori dal repository`);
}
