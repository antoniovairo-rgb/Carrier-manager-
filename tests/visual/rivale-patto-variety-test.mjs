#!/usr/bin/env node
/* [7.267.0 collaudo PO «questa storia del rivale è un po' noiosa e ripetitiva ed anche il patto con il
   mister dovrebbe essere variabile»]
   GUARDIANO della VARIETÀ dei due archi narrativi ricorrenti della carriera.
   Difetti misurati prima del fix:
     · RIVALE — il capitolo esce ~2 volte a stagione per tutta la carriera (≈30 volte) e il CUORE del testo
       era un solo template: il conto dei gol in CARRIERA. In più le soglie erano ASSOLUTE (40 gol), quindi
       a inizio carriera un dominio 5:1 (34 a 7, screenshot del PO) veniva raccontato come «sei avanti».
     · PATTO — sempre «N GOL in 5 gare», stessa proposta e stesso verdetto: un rifinitore si sentiva
       chiedere gol stagione dopo stagione.
   Asserzioni: (1) il centro del capitolo rivale attinge ad almeno 6 ANGOLI distinti sulla popolazione di
   carriere; (2) nessun angolo domina oltre il 45%; (3) il divario di carriera è RELATIVO (un 5:1 non può
   essere raccontato come equilibrio/«avanti»); (4) il tipo di patto varia (≥3 tipi) e nessuno oltre il 60%;
   (5) la durata del patto non è più una costante; (6) entrambi restano DETERMINISTICI a parità di stato.
   Uso: node rivale-patto-variety-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
function hashStr(x) { let h = 5381; for (let i = 0; i < x.length; i++) { h = ((h << 5) + h) ^ x.charCodeAt(i); h = h >>> 0; } return h; }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const issues = [];

/* ───────────────────────────── RIVALE — estrazione del blocco angoli */
const aFrom = src.indexOf('const _ang=[],_myS=p.goals||0,_rvS=p.rival.goals||0;');
const aTo = src.indexOf('const _mid=_ang[_rvSeed(11)%_ang.length];', aFrom);
if (aFrom < 0 || aTo < 0) { console.log('❌ FAIL — blocco angoli del rivale non trovato'); process.exit(1); }
const angBody = src.slice(aFrom, aTo);
const rivalAngles = new Function('p', '_rvC', 'lh', 'wk', '_myG', '_rvG', '_gp', 'hashStr', '_rvSeed',
  angBody + '\n return _ang;');
const rivAng = (p, lh, wk) => {
  const myG = p.totalGoals || 0, rvG = p.rival.totalGoals || 0;
  const sd = (o) => Math.abs(hashStr((p.rival.name || 'r') + '|' + p.rival.club.n + '|' + (p.season || 1) + '|' + wk + '|' + o));
  return rivalAngles(p, p.rival.club, lh, wk, myG, rvG, myG - rvG, hashStr, sd);
};

const mkRival = (k) => {
  const R = (() => { let s = (k * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; })();
  const sn = 1 + Math.floor(R() * 14), age = 17 + sn, myG = Math.round(sn * (6 + R() * 26));
  const rvG = Math.round(myG * (0.15 + R() * 2.2));
  const st = Array.from({ length: 18 }, (_, q) => ({ id: 'c' + q, n: 'C' + q, pts: 60 - q * 3, gf: 20, ga: 12 }));
  const meIx = Math.floor(R() * 18), rvIx = (meIx + 1 + Math.floor(R() * 17)) % 18;
  st[meIx] = { ...st[meIx], id: 'me', n: 'Mio Club' }; st[rvIx] = { ...st[rvIx], id: 'rv', n: 'Club Rivale' };
  const lh = R() < 0.5 ? [{ opponent: 'Club Rivale', week: 5, goals: R() < 0.5 ? 1 : 0, won: R() < 0.5 }] : [];
  return { p: { season: sn, week: 20, age, ovr: 62 + Math.floor(R() * 32), goals: Math.floor(R() * 22), assists: 4,
      totalGoals: myG, trophies: Array.from({ length: Math.floor(R() * 5) }), standings: st, club: { id: 'me', n: 'Mio Club' },
      rival: { name: 'Rivale Uno', ovr: 62 + Math.floor(R() * 32), age: age + Math.round(R() * 4 - 2), goals: Math.floor(R() * 22),
        totalGoals: rvG, seasons: sn, trophies: Math.floor(R() * 5), relationship: ['rivale', 'rispettato', 'amico'][Math.floor(R() * 3)],
        awards: { palloneOros: Array.from({ length: R() < 0.2 ? 1 + Math.floor(R() * 2) : 0 }) }, club: { id: 'rv', n: 'Club Rivale' } } },
    lh, myG, rvG };
};

/* etichetta dell'angolo: prima parola-chiave riconoscibile (il testo è libero, la CLASSE no) */
const label = (t) => /gol a |gol a$|fotocopia|stagione è lui/.test(t) ? 'stagione'
  : /classifica|°:|°,/.test(t) ? 'classifica'
  : /All'andata/.test(t) ? 'andata'
  : /pagelle|Sulla carta/.test(t) ? 'pagelle'
  : /bacheca|trofei/.test(t) ? 'bacheca'
  : /Trofeo d'Oro/.test(t) ? 'premi'
  : /amicizia|rispetto/.test(t) ? 'rapporto'
  : /stessa annata/.test(t) ? 'generazione'
  : /In carriera|carriera \(|non te lo lascia dimenticare/.test(t) ? 'carriera' : 'altro';

const N = 4000, mid = {}, poolSizes = [];
let ratioBug = 0;
for (let k = 0; k < N; k++) {
  const { p, lh, myG, rvG } = mkRival(k);
  let ang; try { ang = rivAng(p, lh, 20); } catch (e) { issues.push('angoli non valutabili: ' + e.message); break; }
  poolSizes.push(ang.length);
  const seed = Math.abs(hashStr((p.rival.name) + '|' + p.rival.club.n + '|' + p.season + '|20|11'));
  const chosen = ang[seed % ang.length];
  mid[label(chosen)] = (mid[label(chosen)] || 0) + 1;
  // (3) il divario di CARRIERA non può più raccontare un dominio come equilibrio
  const carr = ang[ang.length - 1];
  const rt = (myG + 1) / (rvG + 1);
  if ((rt >= 2 && !/staccato/.test(carr)) || (rt <= 0.5 && !/dall'alto/.test(carr))) ratioBug++;
}
const rows = Object.entries(mid).sort((a, b) => b[1] - a[1]);
console.log(`RIVALE — angoli distinti usati: ${rows.length} · pool medio per gara: ${(poolSizes.reduce((a, b) => a + b, 0) / N).toFixed(1)}`);
rows.forEach(([k, v]) => console.log(`  ${k.padEnd(12)} ${(v / N * 100).toFixed(1)}%`));
if (rows.length < 6) issues.push(`il capitolo del rivale usa solo ${rows.length} angoli distinti (attesi ≥6): resta ripetitivo`);
if (rows[0] && rows[0][1] / N > 0.45) issues.push(`l'angolo «${rows[0][0]}» copre il ${(rows[0][1] / N * 100).toFixed(0)}% dei duelli (max 45%)`);
if (ratioBug) issues.push(`${ratioBug}/${N} duelli raccontano un divario di carriera schiacciante (≥2:1 o ≤1:2) con la formula sbagliata: le soglie sono tornate assolute`);
else console.log(`  divario di carriera RELATIVO: 0/${N} casi raccontati male`);

/* ───────────────────────────── PATTO COL MISTER */
const pFrom = src.indexOf('  const PACT_K={');
const pTo = src.indexOf('  }catch(_e){return null;}};', src.indexOf('const pactView=(p)=>{try{')) + '  }catch(_e){return null;}};'.length;
if (pFrom < 0 || pTo < 0) { console.log('❌ FAIL — pactView non trovata'); process.exit(1); }
const pactSrc = src.slice(pFrom, pTo);
const pactView = new Function('hashStr', 'clamp', pactSrc + '\n return pactView;')(hashStr, clamp);

const mkPact = (k) => {
  const R = (() => { let s = (k * 40503 + 7) >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; })();
  const mp = 5 + Math.floor(R() * 25);
  const hist = Array.from({ length: mp }, (_, q) => ({ week: q + 1, rating: 5.5 + R() * 3, goals: R() < 0.4 ? 1 : 0, assists: R() < 0.3 ? 1 : 0 }));
  hist[hist.length - 1].rating = 7.2 + R() * 1.5; hist[hist.length - 1].simulated = false;
  return { proStatus: 'pro', season: 1 + Math.floor(R() * 10), week: 5 + Math.floor(R() * 22), name: 'Eroe ' + k,
    club: { id: 'c' + Math.floor(R() * 20) }, matches: mp, goals: hist.reduce((s, m) => s + m.goals, 0), assists: hist.reduce((s, m) => s + m.assists, 0),
    stats: { tiro: 60 + Math.floor(R() * 35), passaggio: 60 + Math.floor(R() * 35) }, matchHistory: hist };
};
const kinds = {}, games = {}, targets = {}, ratio = {};
let offers = 0, unfair = 0;
for (let k = 0; k < 6000; k++) {
  const p = mkPact(k); const v = pactView(p);
  if (!v || v.st !== 'offer') continue;
  offers++; kinds[v.kind] = (kinds[v.kind] || 0) + 1; games[v.games] = (games[v.games] || 0) + 1;
  targets[v.kind] = targets[v.kind] || new Set(); targets[v.kind].add(v.target);
  /* (7) EQUITÀ: il patto non deve chiedere molto più del passo reale del giocatore — un pavimento cieco
     rendeva certi obiettivi (gli assist) irraggiungibili di partenza. */
  const mp = Math.max(1, p.matches), gpg = p.goals / mp, apg = p.assists / mp;
  const r7 = p.matchHistory.filter(m => (m.rating || 0) >= 7).length / p.matchHistory.length;
  const rate = { gol: gpg, assist: apg, contributo: gpg + apg, prove: r7 }[v.kind];
  const rt = v.target / Math.max(0.05, rate * v.games);
  (ratio[v.kind] = ratio[v.kind] || []).push(rt);
  if (rt > 1.6) unfair++;
}
const kr = Object.entries(kinds).sort((a, b) => b[1] - a[1]);
console.log(`\nPATTO — offerte generate: ${offers} · tipi: ${kr.length}`);
kr.forEach(([k, v]) => { const a = ratio[k].slice().sort((x, y) => x - y);
  console.log(`  ${k.padEnd(12)} ${(v / offers * 100).toFixed(1)}% · obiettivi distinti: ${[...targets[k]].sort((a, b) => a - b).join('/')} · richiesta/passo reale mediana ${a[a.length >> 1].toFixed(2)} p90 ${a[Math.floor(a.length * 0.9)].toFixed(2)}`); });
console.log(`  patti sproporzionati (oltre 1,6× il passo reale): ${unfair}/${offers}`);
if (unfair / Math.max(1, offers) > 0.02) issues.push(`${(unfair / offers * 100).toFixed(0)}% dei patti chiede oltre 1,6× il rendimento reale: obiettivi irraggiungibili di partenza`);
console.log(`  durata del patto: ${Object.entries(games).map(([g, n]) => g + ' gare ×' + n).join(' · ')}`);
if (!offers) issues.push('nessuna offerta di patto generata: il flusso è rotto');
if (kr.length < 3) issues.push(`il patto propone solo ${kr.length} tipi di obiettivo (attesi ≥3): resta sempre lo stesso`);
if (kr[0] && kr[0][1] / offers > 0.60) issues.push(`il tipo «${kr[0][0]}» copre il ${(kr[0][1] / offers * 100).toFixed(0)}% dei patti (max 60%)`);
if (Object.keys(games).length < 2) issues.push('la durata del patto è ancora una costante');

/* ───────────────────────────── determinismo */
{
  const p = mkPact(3); const a = pactView(p), b = pactView({ ...p });
  if (!a || !b || a.kind !== b.kind || a.target !== b.target || a.games !== b.games) issues.push('il patto NON è deterministico: cambierebbe a ogni render');
  const { p: rp, lh } = mkRival(3);
  const x = rivAng(rp, lh, 20), y = rivAng({ ...rp }, lh, 20);
  if (x.join('|') !== y.join('|')) issues.push('gli angoli del rivale NON sono deterministici');
  console.log('\ndeterminismo (patto + angoli rivale): sì');
}

/* ───────────────────────────── il verdetto del patto parla nell'unità giusta */
if (/Avevi promesso \$\{pv\.pact\.target\} gol/.test(src)) issues.push('il verdetto del patto è ancora cablato sui GOL');
if (!/PACT_K\[pact\.kind\]\|\|PACT_K\.gol/.test(src)) issues.push('i patti già in corso senza `kind` non ricadono su "gol": i save esistenti si romperebbero');
else console.log('save-compat — i patti già in corso (senza kind) valgono come «gol»: sì');

if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — il duello col rivale e il patto col mister raccontano fatti diversi ogni volta');
