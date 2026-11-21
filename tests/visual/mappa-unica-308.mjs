#!/usr/bin/env node
/* [giro 308 PO-527] MAPPA UNICA — guardiano statico (niente browser, < 1 s).
   Legge CATENE e MAPPA di ci-runner.mjs SENZA eseguirlo (sabbiera vm sul solo tratto dichiarativo, come ci-parti-303.mjs) e pretende:
     1. una sola riga per gruppo di file (nessuna espressione della MAPPA ripetuta);
     2. nessun guardiano ripetuto dentro una riga;
     3. la mirata prende l'UNIONE delle righe che toccano un file (MAPPA.filter), mai la prima soltanto (MAPPA.find);
     4. ogni voce della MAPPA, delle sentinelle e del nucleo ha il suo script npm;
     5. per ogni file di src/ l'elenco che la mirata calcola coincide con l'unione di tutte le righe che lo toccano.
   Braccio rosso: lo stesso controllo sulla mappa VECCHIA (ci-runner.mjs di lavoro/200, 1cbc414b) deve fallire.
   Uso: node mappa-unica-308.mjs            → verde sul file attuale E rosso sulla mappa vecchia (esce 0 solo se entrambi)
        node mappa-unica-308.mjs <file>     → giudica solo quel file */
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm'; const QUI = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(QUI, '../..');
const script = JSON.parse(fs.readFileSync(path.join(QUI, 'package.json'), 'utf8')).scripts;
function giudica(testo) {
  const L = testo.split('\n'), dif = [];
  const a = L.findIndex(l => l.startsWith('const CATENE = {')), m = L.findIndex(l => l.startsWith('const MAPPA = ['));
  const z = L.findIndex((l, i) => i > m && l.startsWith('];'));
  if (a < 0 || m < 0 || z < 0) return ['non trovo CATENE/MAPPA'];
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(L.slice(a, z + 1).join('\n').replace('const CATENE', 'var CATENE').replace('const MAPPA', 'var MAPPA'), ctx);
  const { CATENE, MAPPA } = ctx, visti = new Map();
  for (const [re, l] of MAPPA) {
    visti.set(re.source, (visti.get(re.source) || 0) + 1);
    const d = l.filter((n, i) => l.indexOf(n) !== i && !CATENE.completa.includes(n)); if (d.length) dif.push(`riga ${re.source}: guardiani ripetuti ${[...new Set(d)].slice(0, 5).join(', ')}`);
  }
  const rip = [...visti].filter(([, k]) => k > 1);
  if (rip.length) dif.push(`${rip.length} gruppi di file con piu' righe: ` + rip.map(([s, k]) => `${s} ×${k}`).join(' · ') + ` (${MAPPA.length} righe per ${visti.size} gruppi)`);
  if (/MAPPA\.find\(/.test(testo)) dif.push('la mirata usa MAPPA.find: conta solo la prima riga che tocca un file');
  if (!/MAPPA\.filter\(/.test(testo)) dif.push('la mirata non prende l\'unione delle righe (manca MAPPA.filter)');
  const nomi = new Set([...MAPPA.flatMap(r => r[1]), ...(CATENE.sentinelle || []), ...(CATENE.nucleo || [])]);
  const senza = [...nomi].filter(n => !script[n]); if (senza.length) dif.push(`${senza.length} voci senza script npm: ${senza.slice(0, 8).join(', ')}`);
  /* 5: per file. Si rifà il calcolo della mirata nel modo in cui il testo lo fa (find o filter) e lo si confronta con l'unione */
  const usaFind = /MAPPA\.find\(/.test(testo); let persi = 0; const esempi = [];
  for (const f of fs.readdirSync(path.join(ROOT, 'src')).map(x => 'src/' + x)) {
    const tutte = MAPPA.filter(([re]) => re.test(f)); if (!tutte.length) continue;
    const unione = new Set(tutte.flatMap(r => r[1])), mirata = new Set(usaFind ? tutte[0][1] : tutte.flatMap(r => r[1]));
    const mancano = [...unione].filter(n => !mirata.has(n)); if (mancano.length) { persi += mancano.length; esempi.push(`${f}: ${mancano.length} (${mancano.slice(0, 3).join(', ')}…)`); }
  }
  if (persi) dif.push(`la mirata perde ${persi} guardiani: ` + esempi.slice(0, 6).join(' · '));
  return dif;
}
const stampa = (titolo, dif) => { console.log(`${dif.length ? '❌' : '✅'} ${titolo}`); for (const d of dif) console.log('   - ' + d); };
if (process.argv[2]) { const d = giudica(fs.readFileSync(process.argv[2], 'utf8')); stampa(process.argv[2], d); process.exit(d.length ? 1 : 0); }
const verde = giudica(fs.readFileSync(path.join(QUI, 'ci-runner.mjs'), 'utf8'));
stampa('verde — ci-runner.mjs attuale', verde);
/* il braccio rosso legge la copia ferma della mappa vecchia (fixtures/), non la storia git: sul runner il clone e' corto (taratura
   44882036931: «commit 1cbc414b non disponibile») e lo sono anche le sessioni cloud. */
let rosso = null; const FIX = path.join(QUI, 'fixtures/ci-runner-1cbc414b.mjs.txt');
if (fs.existsSync(FIX)) { rosso = giudica(fs.readFileSync(FIX, 'utf8')); stampa('rosso — mappa vecchia (1cbc414b, 7.999.199) [atteso ❌]', rosso); }
else console.log('⚠️ braccio rosso non giudicato: manca ' + FIX + ' — vale come rosso del guardiano');
const ok = !verde.length && rosso && rosso.length > 0;
console.log(ok ? '✅ mappa-unica: verde col verde, rosso con la mappa vecchia' : '❌ mappa-unica'); process.exit(ok ? 0 : 1);
