#!/usr/bin/env node
/* [7.266.0 collaudo PO «dovrebbe essere l'Atlético Madrid che principalmente è bianco e rosso,
   il blu è un TERZO colore. fai una verifica massiva»]
   GUARDIANO dell'IDENTITÀ CROMATICA dei club. I due colori sociali `c`/`c2` di ogni club sono la
   sorgente UNICA di maglie (clubKits/kitPatternTex), scudetto (TeamBadge), tifo e coreografie 3D:
   se sbagliano, sbaglia tutto quello che il giocatore vede.
   Due classi di difetto trovate nell'audit dei 252 club:
     (A) `c2` occupato da un TERZO colore (pantaloncino/rifinitura) invece del vero secondo colore
         → Atlético rosso+BLU invece di rosso+bianco, Liverpool/Bayern/United rosso+ORO, Villarreal
           giallo+NERO invece di giallo+blu…
     (B) primario e secondario INVERTITI: `c` deve essere il colore della MAGLIA, non quello dei
         pantaloncini → Tottenham/Fulham/Gladbach/Marsiglia/Siviglia/Rayo/Lipsia sono squadre BIANCHE.
   Il test classifica ogni esadecimale in una FAMIGLIA cromatica (non confronta hex: una futura
   ritaratura di tonalità non deve far fallire il guardiano) e la confronta con una tabella curata
   di club riconoscibili. Più i controlli strutturali su tutti e 252.
   Uso: node club-colors-identity-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const clubs = [];
const RX = /mkT\("([^"]+)","([^"]+)","([^"]+)",(\d+),"([^"]+)","([^"]+)","([^"]*)","([^"]+)"/g;
let m; while ((m = RX.exec(src))) clubs.push({ id: m[1], name: m[2], abbr: m[3], c: m[5], c2: m[6], lg: m[8] });

// ───── classificazione in FAMIGLIA cromatica (hue/lightness/saturazione)
function fam(hex) {
  const h = String(hex).replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return 'invalid';
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), L = (mx + mn) / 2, d = mx - mn;
  const S = d === 0 ? 0 : d / (1 - Math.abs(2 * L - 1));
  if (L >= 0.82 && S < 0.35) return 'white';
  if (L <= 0.18) return 'black';
  if (S < 0.14) return 'grey';
  let H = 0;
  if (d !== 0) { H = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; H *= 60; if (H < 0) H += 360; }
  if (H < 15 || H >= 345) return L > 0.40 ? 'red' : 'claret';
  if (H < 32) return 'orange';
  if (H < 70) return 'yellow';
  if (H < 170) return 'green';
  if (H < 260) return L > 0.58 ? 'sky' : (L < 0.40 ? 'navy' : 'blue');
  if (H < 320) return 'purple';
  return L > 0.60 ? 'pink' : 'claret';
}
const BLUEISH = new Set(['blue', 'navy', 'sky']);
const ok = (f, exp) => exp.some(e => e === f || (e === 'blue*' && BLUEISH.has(f)));

/* Tabella curata: i club che il giocatore RICONOSCE. primary = colore della MAGLIA. */
const IDENT = {
  // Italia
  juve: [['white'], ['black']], inter: [['blue', 'navy'], ['black']], milan: [['red'], ['black']],
  napoli: [['sky', 'blue'], ['white']], roma: [['red', 'claret'], ['yellow', 'orange']], lazio: [['sky'], ['white']],
  fio: [['purple'], ['white']], tor: [['claret'], ['white']], bol: [['red'], ['blue', 'navy']],
  udi: [['white'], ['black']], sas: [['green'], ['black']], cag: [['red'], ['blue', 'navy']],
  gen: [['red'], ['blue', 'navy']], ver: [['yellow'], ['blue', 'navy']], lec: [['yellow'], ['red']],
  ata: [['blue', 'navy'], ['black']], sal: [['claret'], ['white']], pal: [['pink'], ['black']],
  // Inghilterra — le squadre BIANCHE devono avere `c` bianco
  liv: [['red'], ['white']], mun: [['red'], ['white']], ars: [['red'], ['white']], che: [['blue', 'navy'], ['white']],
  mcy: [['sky'], ['navy', 'black', 'blue']], tot: [['white'], ['navy', 'blue']], ful: [['white'], ['black']],
  new: [['black', 'white'], ['white', 'black']], eve: [['blue', 'navy'], ['white']], lei: [['blue'], ['white']],
  wol: [['yellow', 'orange'], ['black']], avl: [['claret'], ['sky']], whu: [['claret'], ['sky']],
  nfo: [['red'], ['white']], bur: [['claret'], ['sky']], nor: [['yellow'], ['green']], lee: [['white'], ['yellow', 'blue*']],
  // Spagna
  rma: [['white'], ['yellow', 'orange', 'purple']], bar: [['blue', 'navy'], ['red', 'claret']],
  atm: [['red'], ['white']], sev: [['white'], ['red']], ray: [['white'], ['red']], ath: [['red'], ['white']],
  bet: [['green'], ['white']], rsoc: [['blue'], ['white']], vill: [['yellow'], ['blue*']], val: [['white'], ['black']],
  esp: [['blue'], ['white']], cel: [['sky'], ['white']],
  // Germania
  bay: [['red'], ['white']], bvb: [['yellow'], ['black']], rbl: [['white'], ['red']], b04: [['red'], ['black']],
  mgb: [['white'], ['black', 'green']], stu: [['white'], ['red']], wer: [['green'], ['white']], kol: [['red'], ['white']],
  s04: [['blue', 'navy'], ['white']], hbu: [['white', 'red'], ['red', 'white']],
  bsc: [['blue*'], ['white']], fra: [['black'], ['red']], fre: [['red'], ['black']], wob: [['green'], ['white']],
  mai: [['red'], ['white']], hof: [['blue*'], ['white']], ber: [['red'], ['white']],
  // Francia
  psg: [['blue', 'navy'], ['red']], marse: [['white'], ['sky', 'blue']], mon: [['red'], ['white']],
  lyon: [['white'], ['blue*', 'red']], len: [['yellow'], ['red']], nan: [['yellow'], ['green']], hac: [['sky'], ['navy']],
  nice: [['red'], ['black']], lille: [['red'], ['white']], ren: [['black', 'red'], ['red', 'black']],
  str: [['blue*'], ['white']], tou: [['purple'], ['white']], lor: [['orange'], ['black']], metz: [['claret'], ['white']],
  // Portogallo / Olanda / Belgio / Turchia
  ben: [['red'], ['white']], por: [['blue', 'navy'], ['white']], spo: [['green'], ['white']],
  ajax: [['red'], ['white']], psv: [['red'], ['white']], feye: [['red'], ['white']],
  and: [['purple'], ['white']], club: [['blue', 'navy'], ['black']],
  gal: [['yellow'], ['red']], fenk: [['yellow'], ['blue', 'navy']], bes: [['black'], ['white']],
};

const issues = [];

// ───── (1) identità cromatica dei club riconoscibili
const byId = Object.fromEntries(clubs.map(c => [c.id, c]));
const wrong = [];
for (const [id, [ep, es]] of Object.entries(IDENT)) {
  const c = byId[id];
  if (!c) { issues.push(`club «${id}» della tabella identità non è più nel database`); continue; }
  const f1 = fam(c.c), f2 = fam(c.c2);
  if (!ok(f1, ep) || !ok(f2, es)) wrong.push(`${id.padEnd(7)} "${c.name}" → ${f1}+${f2} (atteso ${ep.join('/')}+${es.join('/')})`);
}
console.log(`(1) identità cromatica — club verificati: ${Object.keys(IDENT).length} · incoerenti: ${wrong.length}`);
wrong.forEach(w => console.log('    ' + w));
if (wrong.length) issues.push(`${wrong.length} club hanno colori sociali che non sono la loro identità reale`);

// ───── (2) struttura: esadecimali validi, i due colori sempre distinti
const badHex = clubs.filter(c => fam(c.c) === 'invalid' || fam(c.c2) === 'invalid');
const same = clubs.filter(c => c.c.toLowerCase() === c.c2.toLowerCase());
console.log(`(2) struttura — hex non validi: ${badHex.length} · club con c === c2: ${same.length}`);
if (badHex.length) issues.push(`hex non validi: ${badHex.map(c => c.id).join(', ')}`);
if (same.length) issues.push(`club con i due colori sociali IDENTICI (maglia e rifinitura invisibili): ${same.map(c => c.id).join(', ')}`);

// ───── (3) copertura: la tabella deve restare rappresentativa (una svista non deve poter sfuggire
//        semplicemente perché il club non è elencato)
const perLeague = {};
clubs.forEach(c => { perLeague[c.lg] = (perLeague[c.lg] || 0) + (IDENT[c.id] ? 1 : 0); });
const topLeagues = ['Lega A', 'Premier Division', 'Liga Ibérica', 'Deutsche Liga', 'Ligue Nationale'];
const thin = topLeagues.filter(l => (perLeague[l] || 0) < 10);
console.log(`(3) copertura per lega di vertice: ${topLeagues.map(l => l + '=' + (perLeague[l] || 0)).join(' · ')}`);
if (thin.length) issues.push(`copertura insufficiente (<10 club verificati) su: ${thin.join(', ')}`);

// ───── (4) la migrazione deve propagare i colori corretti ai salvataggi già in corso
if (!/_syncClub70[\s\S]{0,1200}c2\s*:/.test(src)) issues.push('la migrazione _syncClub70 non risincronizza i colori: i save esistenti resterebbero coi vecchi');
else console.log('(4) migrazione — i colori vengono risincronizzati per id sui save esistenti: sì');

if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log(`\n✅ PASS — i colori sociali dei ${clubs.length} club rispettano l'identità reale (maglia in c, secondo colore in c2)`);
