#!/usr/bin/env node
/* [giro 187] GUARDIANO «il minuto di un turno del motore non dipende da quando React ha reso il battito» — `npm run riproduci-187`.
   Difetto (misurato dalla madre nella verifica della 7.999.192, riproduci-175 su «Livio Corradini»): la prima voce del libro mastro
   {"ev":"turn","causa":"motore-contrasto"} usciva col minuto 1 in una ripetizione e 0 nell'altra. Causa misurata (sonda-187): un
   sotto-tick del motore caduto fra il battito del minuto (che apre il minuto nuovo: minBattito161Ref) e il render (che aggiorna
   clockRef in un useEffect) passava al motore il minuto giusto (giro 161) ma setTurn616 annotava clockRef, ancora vecchio. Quanto
   dura quella finestra lo decide il processore: in 1 corsa su 3 a 1,5×. Correzione in src/15: il turno annotato da un sotto-tick
   porta il minuto del passo; rosso __CPM_NO_G187.
   La finestra si PROVOCA (non si aspetta): __CPM_FINESTRA187=n (solo ?cpmtest) fa arrivare clockRef dopo n sotto-tick del minuto.
   A. STATICO: interruttore, minuto del passo in setTurn616 (libro mastro e memoria del Match State), aggancio di prova solo in cpmtest.
   B. Per ogni nome, due partite fermate al FERMA' (2×, in parallelo): senza finestra e con finestra n=6 (su 22 sotto-tick).
      VERDE: libri mastri identici voce per voce fino a FERMA-3' (senza ts/t/npd); GIUDICATO solo se la finestra e' stata davvero
             attraversata (testimone __CPM_W187: sotto-tick nella finestra > 0 e almeno un turno annotato nella finestra DENTRO il tratto confrontato) e le partite
             arrivano al FERMA' senza errori — altrimenti NON GIUDICATO = rosso.
      ROSSO (__CPM_NO_G187): su ogni nome i due libri mastri si separano, altrimenti il guardiano e' cieco.
   Uscita 0 solo con verde giudicato e uguale e rosso separato. Verde e rosso stampati per ultimi. ~5 minuti. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apriCarriera166, apriPrompt166, gioca166, seq166 } from './lib/partita-166.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const E = process.env, NOMI = (E.CPM_G187_NOMI || 'Livio Corradini|Tobia Ferrante').split('|').filter(Boolean);
const FERMA = +(E.CPM_G187_FERMA || 20), N = +(E.CPM_G187_N || 6);
const s15 = fs.readFileSync(path.join(ROOT, 'src/15-live-match.jsx'), 'utf8');
const st = []; const ok = (n, c) => st.push({ n, ok: !!c });
ok('A1 un interruttore', (s15.match(/const _g187=!\(typeof window!=='undefined'&&window\.__CPM_NO_G187\);/g) || []).length === 1);
ok('A2 setTurn616 annota il minuto del passo (libro mastro e memoria)', /const _min187=\(_g187&&minPasso187Ref\.current!=null\)\?\(minPasso187Ref\.current\|0\):\(clockRef\.current\|0\);/.test(s15) && /cpmEv\("turn",\{min:_min187,/.test(s15) && /_mm\.push\(\{min:_min187,ev:"turn"/.test(s15));
ok('A3 il sotto-tick dichiara il suo minuto e lo ritira dopo gli specchi', /minPasso187Ref\.current=_mSub187;const _ev=_M\.tick\(\{min:_mSub187,/.test(s15) && /try\{if\(_vivo966\)_specchi898\(_st,_ev\);\}finally\{minPasso187Ref\.current=null;/.test(s15));
ok('A4 la finestra provocata vive solo sotto ?cpmtest e si richiude dopo il passo', /if\(_CPM_TEST&&\(window\.__CPM_FINESTRA187\|0\)>0&&/.test(s15) && /if\(pend187Ref\.current!=null\)\{clockRef\.current=pend187Ref\.current;pend187Ref\.current=null;\}/.test(s15));

async function partita(nome, init, k) {
  const A = await apriCarriera166({ init, nome, vel: '2', reseed: 1000 + 77 * k });
  let r = { ev: [], note: [] }, w = null;
  try { if (!A.W) throw new Error('nessuna giornata di lega'); await apriPrompt166(A.page); r = await gioca166(A.page, 'intera', { seme: 7300, tetto: 300000, fermaAlMinuto: FERMA }); w = await A.page.evaluate(() => window.__CPM_W187 || null); }
  catch (e) { r.note = [...(r.note || []), String(e.message).slice(0, 120)]; }
  const errs = A.errs.slice(0, 3); await A.b.close(); A.srv.close();
  return { seq: seq166(r.ev || []), minMax: r.minMax || 0, w, errs, note: r.note || [] };
}
const pref = q => { const j = q.findIndex(e => (e.min | 0) > FERMA - 3); return j < 0 ? q : q.slice(0, j); };
const diff = (a, b) => { const A = pref(a), B = pref(b); for (let i = 0; i < Math.max(A.length, B.length); i++) if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) return { i, a: A[i] || null, b: B[i] || null }; return null; };
async function braccio(rosso) {
  const out = [];
  for (const nome of NOMI) {
    const base = rosso ? { __CPM_NO_G187: true } : {};
    const [P0, P1] = await Promise.all([partita(nome, base, 0), partita(nome, { ...base, __CPM_FINESTRA187: N }, 1)]);
    const giud = [P0, P1].every(p => p.minMax >= FERMA && p.errs.length === 0 && pref(p.seq).length >= 20) && !!P1.w && P1.w.finestra > 0 && (P1.w.min || []).some(m => m <= FERMA - 3);
    out.push({ nome, P0, P1, giud, d: diff(P0.seq, P1.seq) });
  }
  return out;
}
const V = await braccio(false), R = await braccio(true);
const riga = x => `${pref(x.P0.seq).length}v/${pref(x.P1.seq).length}v · ${x.P0.minMax}'/${x.P1.minMax}' · testimone finestra ${JSON.stringify(x.P1.w)}${x.d ? ` · prima differenza alla voce ${x.d.i}: ${JSON.stringify(x.d.a).slice(0, 120)} ≠ ${JSON.stringify(x.d.b).slice(0, 120)}` : ''}${x.giud ? '' : ' · NON GIUDICATO ' + JSON.stringify([x.P0.note, x.P0.errs, x.P1.note, x.P1.errs])}`;
console.log('A. STATICO'); for (const x of st) console.log(`  ${x.ok ? '✓' : '✗'} ${x.n}`);
console.log(`B. senza finestra contro finestra provocata (n=${N} sotto-tick), 2×, fino al ${FERMA}' (confronto fino al ${FERMA - 3}')`);
for (const x of V) console.log(`  verde ${x.giud && !x.d ? '✓ uguali' : '✗'} «${x.nome}» — ${riga(x)}`);
for (const x of R) console.log(`  rosso ${x.giud && x.d ? '✓ si separano' : '✗ NON si separano'} «${x.nome}» — ${riga(x)}`);
const passa = st.every(x => x.ok) && V.length >= 2 && V.every(x => x.giud && !x.d);
const cade = R.length >= 2 && R.every(x => x.giud && !!x.d);
console.log(`VERDE: ${passa ? 'PASSA' : 'NON PASSA'}`);
console.log(`ROSSO: ${cade ? 'CADE (come deve): il minuto torna a dipendere dal render' : 'NON CADE come deve — il guardiano e\' cieco'}`);
process.exit(passa && cade ? 0 : 1);
