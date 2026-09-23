#!/usr/bin/env node
// Reorders draft portraits to reduce same-looking people in each 2x2 sheet.
// Makes new draft files only; it never changes images, committed files, or API state.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const sourceDir = join(root, 'tools', 'ritratti', 'bozze');
const targetDir = join(root, 'tools', 'ritratti', 'bozze-bilanciate');
const positions = ['Alto sinistra', 'Alto destra', 'Basso sinistra', 'Basso destra'];

function score(candidate, selected, pool) {
  const sameToneLeft = pool.filter((face) => face.carnagione === candidate.carnagione).length;
  return selected.reduce((value, face) => value +
    (face.carnagione === candidate.carnagione ? -100 : 100) +
    (face.barba === candidate.barba ? -12 : 12) +
    (face.capelli === candidate.capelli ? -8 : 8) +
    (face.viso === candidate.viso ? -8 : 8) +
    (Math.abs(face.eta - candidate.eta) < 4 ? -4 : 4) +
    (face.tratto === candidate.tratto ? -3 : 3), 0) +
    sameToneLeft / 1000;
}

function takeBest(pool, selected) {
  if (!pool.length) throw new Error('Profili insufficienti per completare il foglio');
  let index = 0;
  let best = -Infinity;
  for (let i = 0; i < pool.length; i++) {
    const value = selected.length ? score(pool[i], selected, pool) :
      pool.filter((face) => face.carnagione === pool[i].carnagione).length;
    if (value > best || (value === best && pool[i].id < pool[index].id)) {
      best = value;
      index = i;
    }
  }
  return pool.splice(index, 1)[0];
}

const files = (await readdir(sourceDir)).filter((file) => /^lotto-\d{2}\.json$/.test(file)).sort();
if (files.length !== 10) throw new Error(`Attesi 10 lotti di partenza, trovati ${files.length}`);
await mkdir(targetDir, { recursive: true });
let total = 0;
let variedSheets = 0;
for (const file of files) {
  const lot = JSON.parse(await readFile(join(sourceDir, file), 'utf8'));
  const faces = lot.fogli.flatMap((sheet) => sheet.volti);
  const staff = faces.filter((face) => face.categoria === 'staff');
  const staffCount = staff.length;
  const players = faces.filter((face) => face.categoria === 'giocatore');
  const originalIds = new Set(faces.map((face) => face.id));
  if (originalIds.size !== faces.length || faces.length % 4) throw new Error(`${file}: ID o conteggio non validi`);
  const promptPrefix = lot.fogli[0].prompt.split('Alto sinistra:')[0];
  if (!promptPrefix.includes('BIANCO PURO #FFFFFF')) throw new Error(`${file}: prompt non atteso`);
  const sheets = [];
  const sheetCount = faces.length / 4;
  for (let index = 0; index < sheetCount; index++) {
    const selected = [];
    if (index < staffCount) selected.push(staff.shift());
    while (selected.length < 4) selected.push(takeBest(players, selected));
    // Avoid always placing the staff member in the same corner.
    const rotated = selected.slice(index % 4).concat(selected.slice(0, index % 4));
    const prompt = promptPrefix + positions.map((position, i) => {
      const face = rotated[i];
      const woman = face.categoria === 'staff' && face.barba === 'nessuna';
      return `${position}: ${face.categoria === 'staff' ? 'staff sportivo o media, ' : 'calciatore, '}` +
        `${woman ? 'Donna' : 'Uomo'} di ${face.eta} anni, carnagione ${face.carnagione}, ` +
        `capelli ${face.capelli}, ${woman ? 'senza barba' : face.barba}, viso ${face.viso}, ${face.tratto}.`;
    }).join(' ');
    sheets.push({ numero: index + 1, prompt, volti: rotated });
    if (new Set(rotated.map((face) => face.carnagione)).size >= 3) variedSheets++;
  }
  if (staff.length || players.length ||
      new Set(sheets.flatMap((sheet) => sheet.volti.map((face) => face.id))).size !== originalIds.size) {
    throw new Error(`${file}: riordino incompleto`);
  }
  lot.fogli = sheets;
  await writeFile(join(targetDir, file), `${JSON.stringify(lot, null, 2)}\n`,
    { encoding: 'utf8', flag: 'wx' });
  total += faces.length;
  console.log(`${file}: ${sheets.length} fogli con ID conservati`);
}
console.log(`${total} ritratti pianificati; ${variedSheets}/248 fogli con almeno tre carnagioni distinte.`);
console.log('Nessuna chiamata API effettuata.');
