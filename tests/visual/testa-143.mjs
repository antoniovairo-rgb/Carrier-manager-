#!/usr/bin/env node
/* [giro 43 PO-143, taccuino #64/#126 «azione confusionaria con colpo di testa», «una sorta di colpo di testa, scena strana»] GUARDIANO
   GLB-ON (una pagina nuova per scena, via sonda-testa-126.mjs). MISURATO prima: (1) nelle scene di testa del catalogo la costruzione a
   tre mandava il pallone 4-12 u ALL'INDIETRO a un terzo uomo e ritorno prima del cross (beat «scarico»/«rientro»); (2) «Stacco difensivo
   deciso» (esito recupero, #126) diventava un'incornata verso la porta da centrocampo e finiva IN RETE (post-arco in_net, pallone a 99).
   VERDE: nessun beat scarico/rientro su #126 e #64; il recupero di testa riuscito non va in rete e resta sotto x 80 (sul compagno).
   ROSSO A (__CPM_NO_TESTA43): scarico presente. ROSSO B (__CPM_NO_TESTA43B da solo, #126/1): il colpo di testa del recupero MIRA la porta.  Uso: node testa-143.mjs
   [giro 50 PO-271] BRACCIO ROSSO RIPARATO. MISURATO (sonda-testa-126, #126/1 riuscito, 2+2 giri sul commit del giro 43 075e61f e 3 su
   HEAD): spenta la correzione B il pallone non arriva MAI in rete nella finestra osservata (ultimo x 60-82, nessun post-arco): la scena
   d'esito si chiude a tempo reale (sotto cpmtest la precedenza della scena 7.461 e' spenta) mentre il tempo di scena headless scorre
   a meta' o meno, quindi l'arco e' ancora in volo — lo stesso confondente del 7.460. La grandezza deterministica e' il BERSAGLIO
   dell'arco nell'istante in cui viene deciso (__CPM_HDR786.tx, mondo): rosso 41,4-45 (porta, x logico ≥ 90), verde il compagno.
   Il criterio «in rete o oltre x 90» resta valido se l'arco atterra, ma non e' piu' necessario.  (~6 min) */
import { execFileSync } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url)); const CASI = '126:1:success,64:0:success,126:0:success';
const gira = (extra, casi = CASI) => execFileSync(process.execPath, [path.join(DIR, 'sonda-testa-126.mjs')], { env: { ...process.env, CPM_CASI: casi, CPM_EXTRA: extra, CPM_SERIE: '', CPM_WS: '', CPM_BU: '' }, encoding: 'utf8', maxBuffer: 1 << 26 })
  .split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l));
const V = gira(''), R = gira('__CPM_NO_TESTA43'), RB = gira('__CPM_NO_TESTA43B', '126:1:success');/* [giro 50] i due rossi separati: con lo scarico la costruzione si allunga e il colpo di testa non parte nella finestra */
for (const [n, A] of [['verde', V], ['rosso A', R], ['rosso B', RB]]) for (const r of A) console.log(n + ' ' + JSON.stringify({ caso: r.caso, scarico: r.scarico, postarchi: r.postarchi, ultimo: r.ultimo, arretraFila: r.arretraFila, bersaglio: r.hdr && r.hdr.tx }));
const rec = (A) => A.find(r => r.caso === '126:1:success'), g = [];
if (V.length !== 3 || R.length !== 3 || RB.length !== 1) g.push('scene non giocate: verde ' + V.length + ', rosso A ' + R.length + ' su 3, rosso B ' + RB.length + ' su 1');
if (V.some(r => r.scarico)) g.push('verde: beat scarico/rientro ancora nella costruzione di testa');
const rv = rec(V); if (!rv || /in_net/.test(rv.postarchi || '') || !(rv.ultimo && rv.ultimo[0] < 80)) g.push('verde: il recupero di testa va verso la porta ' + JSON.stringify(rv && { pa: rv.postarchi, ultimo: rv.ultimo }));
const tx = r => (r && r.hdr && r.hdr.tx && r.hdr.tx.length) ? r.hdr.tx[0] : null;/* bersaglio del primo colpo di testa, mondo (porta a 46) */
if (!(tx(rv) != null && tx(rv) < 30)) g.push('verde: il colpo di testa del recupero non mira il compagno (bersaglio mondo ' + tx(rv) + ')');
const rr = rec(RB); const portaR = rr && ((/in_net/.test(rr.postarchi || '')) || (rr.ultimo && rr.ultimo[0] > 90) || (tx(rr) != null && tx(rr) >= 40));
console.log('bersaglio del colpo di testa #126/1 (mondo): verde ' + tx(rv) + ' · rosso ' + tx(rr));
if (!R.some(r => r.scarico)) g.push('rosso A: lo scarico non si vede spento');
if (!portaR) g.push('rosso B: il recupero di testa non mira la porta spento (bersaglio ' + tx(rr) + ')');
if (g.length) { console.log('❌ testa-143'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ testa-143 verde (e il rosso si vede)');
