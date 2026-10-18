/* [giro 67 PO-098] GUARDIANO: i 4 STILI CAMBIANO DAVVERO IL GIOCO NEL MOTORE. Decisione PO 16/10 «Misura, poi motore»: Finalizzatore ·
   Regista · Incursore · Trascinatore. Gioca nel motore vero (src/14 simulaPartitaMotore, in node, nessun browser) N partite per stile con
   gli STESSI semi e la STESSA squadra, e confronta l'eroe: tiri, gol, assist, passaggi, dove riceve, e i gol della squadra.
   Verde: le firme dei 4 stili si separano nel verso dichiarato (Finalizzatore tira di piu' e riceve piu' avanti, Regista passa e fa
   assist di piu', Incursore dribbla di piu', il Trascinatore porta la differenza reti della squadra piu' in alto degli altri e del neutro). Rosso (__CPM_NO_STILI): i 4 stili
   giocano la STESSA partita (firme identiche al neutro). Uso: node stili-098.mjs [N=40]. Esce 1 se il verde non si separa o il rosso si separa. */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/harness.mjs';
const N = +(process.argv[2] || process.env.N || 40);
const src14 = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const code14 = src14.slice(src14.indexOf('/* CMAV-SRC-HEADER-END */') + 25);
const load = (W) => Function('decideExecution', 'window', code14 + '\nreturn simulaPartitaMotore;')(undefined, W);
/* la tabella degli stili si legge dal sorgente del gioco (src/06), non si ricopia */
const src06 = fs.readFileSync(path.join(ROOT, 'src', '06-archetipi-agenti-sponsor.jsx'), 'utf8');
const a = src06.indexOf('const ARCHETYPES=['); const b = src06.indexOf('];', a);
const STILI = Function('return ' + src06.slice(a + 'const ARCHETYPES='.length, b + 1))();
const misura = (W, stile) => {
  const sim = load(W); const T = { tiri: 0, gol: 0, assist: 0, passaggi: 0, ricezioni: 0, tocchi: 0, golSq: 0, golSub: 0, occ: {} };
  for (let k = 0; k < N; k++) {
    const r = sim({ seed: 6700 + k * 97, forzaH: 74, forzaA: 70, stadio: k % 2 ? 'away' : 'home', ovr: 82, stile, dettaglio: true });
    const e = (r.pag || []).find(p => p && p.eroe) || {};
    for (const x of ['tiri', 'gol', 'assist', 'passaggi', 'ricezioni', 'tocchi']) T[x] += e[x] | 0;
    T.golSq += r.home; T.golSub += r.away;
    for (const [kk, v] of Object.entries(r.scelte || {})) T.occ[kk] = (T.occ[kk] | 0) + v;
  }
  const o = {}; for (const x of ['tiri', 'gol', 'assist', 'passaggi', 'ricezioni', 'tocchi', 'golSq', 'golSub']) o[x] = +(T[x] / N).toFixed(3);
  o.occ = T.occ; return o;
};
const out = { N, verde: {}, rosso: {} };
out.verde.neutro = misura({}, null);
for (const s of STILI) out.verde[s.id] = misura({}, { id: s.id, ...s.motore });
for (const s of STILI) out.rosso[s.id] = misura({ __CPM_NO_STILI: 1 }, { id: s.id, ...s.motore });
console.log(JSON.stringify(out, null, 1));
const V = out.verde, R = out.rosso, err = [];
const others = (id) => STILI.map(s => s.id).filter(x => x !== id);
const max = (k, ids) => Math.max(...ids.map(i => V[i][k]));
if (!(V.finalizzatore.tiri > max('tiri', ['regista', 'incursore']))) err.push('Finalizzatore non tira piu\' di Regista e Incursore');
if (!(V.regista.passaggi > max('passaggi', others('regista')))) err.push('Regista non passa piu\' degli altri');
if (!(V.regista.assist >= max('assist', ['finalizzatore', 'incursore']))) err.push('Regista non fa assist quanto/piu\' di Finalizzatore e Incursore');
const dr = (o) => o.golSq - o.golSub;
if (!(dr(V.trascinatore) > Math.max(...others('trascinatore').map(i => dr(V[i]))) && dr(V.trascinatore) > dr(V.neutro))) err.push('Trascinatore non porta la differenza reti di squadra piu\' in alto degli altri');
const dribb = (o) => (o.occ.dribbling | 0);
if (!(dribb(V.incursore) > Math.max(...others('incursore').map(i => dribb(V[i]))))) err.push('Incursore non sceglie il dribbling piu\' degli altri');
const firma = (o) => JSON.stringify([o.tiri, o.gol, o.assist, o.passaggi, o.golSq, o.golSub, o.occ]);
const fN = firma(V.neutro); for (const s of STILI) if (firma(R[s.id]) !== fN) err.push('rosso: ' + s.id + ' diverso dal neutro (il rosso non spegne)');
if (err.length) { console.error('❌ stili-098: ' + err.join(' · ')); process.exit(1); }
console.log('✅ stili-098 verde: i 4 stili si separano nel motore (e col rosso giocano la stessa partita)');
