/* [7.999.161 PO-228 guardiano] PASSAGGI E CROSS VERSO IL REALE, IL RESTO FERMO (decisione PO 12/10, docs/governo/DECISIONI.md).
   Banco Node, niente browser: carica il motore da src/14-motore-possesso.jsx e gioca N partite con simulaPartitaMotore (la stessa
   funzione della simulazione rapida: 22 decisioni al minuto, ripresa dal centro), sugli stessi semi in due bracci:
     verde = motore com'e' · rosso = __CPM_NO_PASS228 (il motore di prima, che fa da base per le tolleranze).
   VERDE se: passaggi a partita (due squadre) in 800-950 · cross in 20-30 · tiri entro ±5 % della base · gol entro ±8 % · xG entro ±6 % ·
   possesso della squadra dell'eroe entro ±5 %. Le tolleranze sono larghe quanto il rumore del campione: su 300 partite l'errore
   standard dei gol a partita e' ~3 %, dei tiri ~1,5 %; i semi sono fissi, quindi l'esito e' deterministico finche' il motore non cambia.
   MISURATO alla consegna (1.500 partite, tre serie di semi): passaggi 429,5 -> 814,2 · cross 42,8 -> 28,4 · tiri 22,94 -> 22,43 ·
   gol 2,18 -> 2,12 · xG 2,20 -> 2,11 · possesso eroe 49,4 -> 48,0 %.
   Uso: node statistiche-228.mjs            (N=300, ~1 minuto)
        CPM_ROSSO=1 node statistiche-228.mjs  (solo il braccio rosso: deve dare passaggi sotto 500, ed esce 0 se e' cosi')
        N=500 SEED0=777 node statistiche-228.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = fs.readFileSync(path.join(ROOT, 'src', '14-motore-possesso.jsx'), 'utf8');
const CODE = SRC.slice(SRC.indexOf('/* CMAV-SRC-HEADER-END */') + 26);
const ROSSO = process.env.CPM_ROSSO === '1';
const N = Math.max(20, +(process.env.N || 300)); const SEED0 = +(process.env.SEED0 || 1000);

function braccio(rosso) {
  const W = rosso ? { __CPM_NO_PASS228: true } : {};
  const sim = Function('decideExecution', 'window', CODE + '\nreturn simulaPartitaMotore;')(undefined, W);
  const S = { passaggi: 0, cross: 0, tiri: 0, gol: 0, xg: 0, poss: 0 };
  for (let k = 0; k < N; k++) {
    const r = sim({ seed: (SEED0 + k * 7919) >>> 0, forzaH: 60 + ((k * 7) % 21), forzaA: 60 + ((k * 13) % 21), stadio: k % 2 ? 'away' : 'home', ovr: 70 });
    const T = r.tab; for (const s of ['home', 'away']) { S.passaggi += T[s].passaggi; S.cross += T[s].cross; S.tiri += T[s].tiri; S.gol += T[s].gol; S.xg += +T[s].xg || 0; }
    const pt = (T.home.possesso || 0) + (T.away.possesso || 0); S.poss += pt > 0 ? 100 * T.home.possesso / pt : 50;
  }
  for (const k in S) S[k] /= N; return S;
}
const f = (x, d = 2) => x.toFixed(d).replace('.', ',');
const riga = (n, S) => console.log(`${n.padEnd(6)} passaggi ${f(S.passaggi, 1)} · cross ${f(S.cross, 1)} · tiri ${f(S.tiri)} · gol ${f(S.gol)} · xG ${f(S.xg)} · possesso eroe ${f(S.poss, 1)} %`);
const t0 = Date.now();
const R = braccio(true); riga('rosso', R);
if (ROSSO) {
  const ok = R.passaggi < 500;
  console.log(ok ? `✅ ROSSO come atteso: senza PO-228 i passaggi tornano a ${f(R.passaggi, 1)} (< 500) · ${N} partite in ${((Date.now() - t0) / 1000).toFixed(0)} s`
    : `❌ il rosso non riproduce il motore di prima: passaggi ${f(R.passaggi, 1)} (atteso < 500)`);
  process.exit(ok ? 0 : 1);
}
const V = braccio(false); riga('verde', V);
const fails = []; const d = (a, b) => 100 * (a - b) / b;
if (V.passaggi < 800 || V.passaggi > 950) fails.push(`passaggi ${f(V.passaggi, 1)} fuori da 800-950`);
if (V.cross < 20 || V.cross > 30) fails.push(`cross ${f(V.cross, 1)} fuori da 20-30`);
for (const [k, tol] of [['tiri', 5], ['gol', 8], ['xg', 6], ['poss', 5]]) { const x = d(V[k], R[k]); console.log(`  ${k.padEnd(5)} ${x >= 0 ? '+' : ''}${f(x, 1)} % (tolleranza ±${tol} %)`); if (Math.abs(x) > tol) fails.push(`${k} ${f(x, 1)} % oltre ±${tol} %`); }
console.log(`${N} partite per braccio in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
console.log(fails.length ? '❌ FAIL statistiche-228\n  ' + fails.join('\n  ') : '✅ PASS statistiche-228'); process.exit(fails.length ? 1 : 0);
