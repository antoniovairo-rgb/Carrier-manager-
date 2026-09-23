#!/usr/bin/env node
// Prepares, but never sends, the ten production lots following the 8-face pilot.
// Draft files are exclusive creations: existing files and portrait IDs are untouched.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const draftDir = join(root, 'tools', 'ritratti', 'bozze');
const manifest = JSON.parse(await readFile(join(root, 'assets', 'portraits', 'ai', 'manifest.json'), 'utf8'));
if (!Array.isArray(manifest) || manifest.length !== 8 ||
    manifest.some((face, i) => face.id !== `ai-${String(i + 1).padStart(4, '0')}`)) {
  throw new Error('Il piano richiede il pilota ai-0001…ai-0008 intatto; nessun file creato');
}

const skinTones = ['chiara', 'olivastra', 'ambrata', 'scura'];
const maleHair = ['corti lisci', 'corti mossi', 'ricci corti', 'ricci medi',
  'lunghi raccolti', 'rasati a zero', 'stempiati e corti', 'afro corti'];
const femaleHair = ['corti ondulati', 'caschetto liscio', 'ricci medi',
  'lunghi raccolti', 'lunghi mossi', 'corti ricci'];
const shapes = ['ovale', 'quadrato', 'allungato', 'rotondo', 'triangolare', 'largo'];
const traits = ['naso aquilino', 'naso largo', 'zigomi alti', 'sopracciglia folte',
  'mento pronunciato', 'orecchie leggermente sporgenti', 'lieve asimmetria del sorriso',
  'lentiggini leggere', 'naso leggermente storto', 'occhi infossati',
  'fronte alta', 'guance piene', 'labbra sottili', 'arcata sopracciliare marcata'];
const beards = ['rasato', 'barba corta', 'barba piena curata', 'baffi sottili', 'pizzetto'];

// Stable, local pseudo-random choices; they do not consume API calls.
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const random = rng(20260923);
const pick = (array) => array[Math.floor(random() * array.length)];
const hairColor = (tone, staff) => pick({
  chiara: staff ? ['castani', 'biondi scuri', 'rossi', 'brizzolati'] : ['castani', 'biondi', 'rossi', 'neri'],
  olivastra: staff ? ['neri', 'castani', 'brizzolati'] : ['neri', 'castani', 'castani scuri'],
  ambrata: staff ? ['neri', 'castani scuri', 'brizzolati'] : ['neri', 'castani scuri'],
  scura: staff ? ['neri', 'brizzolati'] : ['neri', 'castani scuri'],
}[tone]);
const seen = new Set(manifest.map((face) =>
  [face.eta, face.carnagione, face.capelli, face.barba, face.viso, face.tratto].join('|')));

function profile(number, staff) {
  for (let attempt = 0; attempt < 2000; attempt++) {
    const female = staff && number % 2 === 0;
    const eta = staff ? 40 + Math.floor(random() * 19) : 18 + Math.floor(random() * 19);
    const carnagione = pick(skinTones);
    const style = pick(female ? femaleHair : maleHair);
    const capelli = `${hairColor(carnagione, staff)} ${style}`;
    const barba = female ? 'nessuna' : eta < 22 ? pick(['rasato', 'baffi sottili']) : pick(beards);
    const viso = pick(shapes);
    const tratto = pick(traits);
    const signature = [eta, carnagione, capelli, barba, viso, tratto].join('|');
    if (seen.has(signature)) continue;
    seen.add(signature);
    return {
      id: `ai-${String(number).padStart(4, '0')}`,
      categoria: staff ? 'staff' : 'giocatore',
      eta, carnagione, capelli, barba, viso, tratto,
      descrizione: `${female ? 'Donna' : 'Uomo'} di ${eta} anni, carnagione ${carnagione}, ` +
        `capelli ${capelli}, ${female ? 'senza barba' : barba}, viso ${viso}, ${tratto}`,
    };
  }
  throw new Error(`Impossibile trovare una combinazione distinta per ai-${number}`);
}

function promptFor(faces) {
  const header = 'Crea UNA fotografia composita quadrata 1024×1024 con ESATTAMENTE quattro ritratti ' +
    '2×2, un volto diverso per ciascun quadrante 512×512, senza bordi o spazi. ' +
    'Ogni persona è adulta, inventata, non somigliante a persone reali o famose. ' +
    'Sfondo di ogni quadrante BIANCO PURO #FFFFFF, uniforme e senza ombre: mai grigio, avorio o sfumato. ' +
    'Testa e spalle, viso centrato e completamente visibile, sguardo in camera; stessa distanza, ' +
    'inquadratura e luce morbida frontale. Fotografia naturale, anatomia credibile, pelle reale, ' +
    'aspetto ordinario con imperfezioni naturali: non tutti fotomodelli. ' +
    'Abbigliamento semplice grigio chiaro neutro: maglia sportiva girocollo per i giocatori, ' +
    'polo o camicia per lo staff. Niente testo, loghi, stemmi, numeri, sponsor, cornici o filigrane. ' +
    'I quattro volti devono differire chiaramente per occhi, naso, sopracciglia, mascella e forma della testa. ';
  return header + ['Alto sinistra', 'Alto destra', 'Basso sinistra', 'Basso destra']
    .map((position, i) => `${position}: ${faces[i].categoria === 'staff' ? 'staff sportivo o media, ' : 'calciatore, '}${faces[i].descrizione}.`)
    .join(' ');
}

await mkdir(draftDir, { recursive: true });
let nextId = 9;
let players = 0;
let staff = 0;
for (let lotNumber = 1; lotNumber <= 10; lotNumber++) {
  const count = lotNumber === 10 ? 92 : 100;
  const staffCount = lotNumber === 10 ? 5 : 7;
  const staffPositions = new Set(Array.from({ length: staffCount }, (_, j) =>
    Math.floor(((j + 0.5) * count) / staffCount)));
  const faces = Array.from({ length: count }, (_, index) => {
    const isStaff = staffPositions.has(index);
    isStaff ? staff++ : players++;
    return profile(nextId++, isStaff);
  });
  const sheets = [];
  for (let index = 0; index < faces.length; index += 4) {
    const four = faces.slice(index, index + 4);
    sheets.push({
      numero: sheets.length + 1,
      prompt: promptFor(four),
      volti: four.map(({ descrizione, ...metadata }) => metadata),
    });
  }
  const lotName = `lotto-${String(lotNumber).padStart(2, '0')}`;
  const lot = { lotto: lotName, modello: 'gpt-image-1-mini',
    qualita: 'medium', dimensione: '1024x1024', fogli: sheets };
  const path = join(draftDir, `${lotName}.json`);
  await writeFile(path, `${JSON.stringify(lot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  console.log(`${lotName}: ${sheets.length} fogli, ${count - staffCount} giocatori, ${staffCount} staff`);
}
if (nextId !== 1001 || players !== 924 || staff !== 68) {
  throw new Error(`Conteggio errato: ID finale ${nextId - 1}, giocatori ${players}, staff ${staff}`);
}
console.log('Piano condizionato all’approvazione degli 8 volti pilota: 1000 totali = 930 giocatori + 70 staff.');
console.log('Nessuna chiamata API effettuata.');
