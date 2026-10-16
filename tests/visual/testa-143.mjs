#!/usr/bin/env node
/* [giro 43 PO-143, taccuino #64/#126 «azione confusionaria con colpo di testa», «una sorta di colpo di testa, scena strana»] GUARDIANO
   GLB-ON (una pagina nuova per scena, via sonda-testa-126.mjs). MISURATO prima: (1) nelle scene di testa del catalogo la costruzione a
   tre mandava il pallone 4-12 u ALL'INDIETRO a un terzo uomo e ritorno prima del cross (beat «scarico»/«rientro»); (2) «Stacco difensivo
   deciso» (esito recupero, #126) diventava un'incornata verso la porta da centrocampo e finiva IN RETE (post-arco in_net, pallone a 99).
   VERDE: nessun beat scarico/rientro su #126 e #64; il recupero di testa riuscito non va in rete e resta sotto x 80 (sul compagno).
   ROSSO (__CPM_NO_TESTA43 + __CPM_NO_TESTA43B): scarico presente E recupero in rete o oltre x 90.  Uso: node testa-143.mjs (~6 min) */
import { execFileSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url)); const CASI = '126:1:success,64:0:success,126:0:success';
const gira = (extra) => execFileSync(process.execPath, [path.join(DIR, 'sonda-testa-126.mjs')], { env: { ...process.env, CPM_CASI: CASI, CPM_EXTRA: extra, CPM_SERIE: '', CPM_WS: '', CPM_BU: '' }, encoding: 'utf8', maxBuffer: 1 << 26 })
  .split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l));
const V = gira(''), R = gira('__CPM_NO_TESTA43,__CPM_NO_TESTA43B');
for (const [n, A] of [['verde', V], ['rosso', R]]) for (const r of A) console.log(n + ' ' + JSON.stringify({ caso: r.caso, scarico: r.scarico, postarchi: r.postarchi, ultimo: r.ultimo, arretraFila: r.arretraFila }));
const rec = (A) => A.find(r => r.caso === '126:1:success'), g = [];
if (V.length !== 3 || R.length !== 3) g.push('scene non giocate: verde ' + V.length + ', rosso ' + R.length + ' su 3');
if (V.some(r => r.scarico)) g.push('verde: beat scarico/rientro ancora nella costruzione di testa');
const rv = rec(V); if (!rv || /in_net/.test(rv.postarchi || '') || !(rv.ultimo && rv.ultimo[0] < 80)) g.push('verde: il recupero di testa va verso la porta ' + JSON.stringify(rv && { pa: rv.postarchi, ultimo: rv.ultimo }));
const rr = rec(R); if (!(R.some(r => r.scarico) && rr && (/in_net/.test(rr.postarchi || '') || (rr.ultimo && rr.ultimo[0] > 90)))) g.push('rosso: il difetto non si vede spento');
if (g.length) { console.log('❌ testa-143'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testa-143 verde (e il rosso si vede)');
