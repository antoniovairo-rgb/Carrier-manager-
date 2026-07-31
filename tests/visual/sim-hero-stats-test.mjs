#!/usr/bin/env node
/* [7.261.0 collaudo PO «non essere severo con le simulazioni, l'eroe spesso non fa assist e gol»]
   GUARDIANO della generosità delle statistiche personali nelle partite SIMULATE.
   Estrae _pSimStats VERA dal file di gioco (nessun browser: è una funzione pura) e misura la
   distribuzione su decine di migliaia di gare simulate, confrontandola con la curva STORICA
   (7.260 e precedenti) e con soglie calcistiche. Fallisce se la curva torna severa o se
   qualche invariante salta (gol dell'eroe > gol della squadra, squadra a secco = eroe a secco,
   determinismo a parità di seed).
   Uso: node sim-hero-stats-test.mjs */
import fs from 'node:fs';
import { ROOT } from './lib/harness.mjs';

const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');
const m = src.match(/function _pSimStats\(sim,ovr,archId,rng\)\{[\s\S]*?\n\}/);
if (!m) { console.log('❌ FAIL — _pSimStats non trovata nel file'); process.exit(1); }
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const _pSimStats = new Function('clamp', `${m[0]}; return _pSimStats;`)(clamp);

// curva STORICA (pre-7.261) per il confronto prima→dopo
function _oldStats(sim, ovr, archId, rng) {
  const R = rng || Math.random; const tg = sim.homeScore || 0; if (tg === 0) return { goals: 0, assists: 0 };
  const o = ovr || 65;
  const gL = clamp((o - 50) / 100 + (['bomber', 'centravanti'].includes(archId) ? 0.12 : 0) + (sim.won ? 0.06 : 0), 0.04, 0.65);
  const aL = clamp((o - 50) / 90 + (['trequartista', 'fantasista'].includes(archId) ? 0.08 : 0), 0.02, 0.40);
  const r1 = R(), r2 = R(); const pe = x => Math.exp(-x);
  const g = r1 < pe(gL) ? 0 : r1 < pe(gL) * (1 + gL) ? 1 : 2;
  const a = r2 < pe(aL) ? 0 : r2 < pe(aL) * (1 + aL) ? 1 : 2;
  return { goals: Math.min(g, tg), assists: Math.min(a, Math.max(0, tg - g)) };
}

const mulberry = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const N = 20000;
// distribuzione realistica dei gol di squadra (una gara su cinque finisce a secco)
const teamGoals = i => [0, 1, 1, 1, 2, 2, 2, 3, 3, 4][i % 10];

const measure = (fn, ovr, arch) => {
  let gTot = 0, aTot = 0, anyG = 0, anyA = 0, involved = 0, dry = 0, over = 0;
  for (let i = 0; i < N; i++) {
    const tg = teamGoals(i), won = tg >= 2;
    const sim = { homeScore: tg, awayScore: won ? 0 : tg, won, drew: !won && tg > 0 };
    const r = fn(sim, ovr, arch, mulberry(i * 7919 + ovr));
    gTot += r.goals; aTot += r.assists;
    if (r.goals > 0) anyG++; if (r.assists > 0) anyA++;
    if (r.goals > 0 || r.assists > 0) involved++;
    if (tg === 0 && (r.goals || r.assists)) dry++;
    if (r.goals > tg || r.goals + r.assists > tg) over++;
  }
  return { gpg: gTot / N, apg: aTot / N, pG: anyG / N, pA: anyA / N, pInv: involved / N, dry, over };
};

const issues = [];
const rows = [];
for (const [ovr, arch, label] of [[62, '', 'giovane 62'], [71, '', 'titolare 71 (il caso del PO)'], [80, 'bomber', 'bomber 80'], [88, 'bomber', 'star 88']]) {
  const nw = measure(_pSimStats, ovr, arch), old = measure(_oldStats, ovr, arch);
  rows.push({ label, nw, old });
  console.log(`${label.padEnd(28)} gol/gara ${old.gpg.toFixed(2)}→${nw.gpg.toFixed(2)} · assist/gara ${old.apg.toFixed(2)}→${nw.apg.toFixed(2)} · coinvolto ${(old.pInv * 100).toFixed(0)}%→${(nw.pInv * 100).toFixed(0)}%`);
  if (nw.dry) issues.push(`${label}: ${nw.dry} gare con squadra a secco ma gol/assist all'eroe`);
  if (nw.over) issues.push(`${label}: ${nw.over} gare con G+A dell'eroe oltre i gol della squadra`);
  if (nw.gpg <= old.gpg) issues.push(`${label}: la curva NON è più generosa (${old.gpg.toFixed(2)}→${nw.gpg.toFixed(2)})`);
}
// soglie calcistiche: un titolare deve essere coinvolto in ~metà delle gare in cui la squadra segna
const mid = rows[1].nw;
if (mid.pInv < 0.40) issues.push(`titolare 71: coinvolto solo nel ${(mid.pInv * 100).toFixed(0)}% delle gare (atteso ≥40%)`);
if (rows[3].nw.pInv < 0.55) issues.push(`star 88: coinvolta solo nel ${(rows[3].nw.pInv * 100).toFixed(0)}% (atteso ≥55%)`);
if (rows[0].nw.gpg > 0.55) issues.push(`giovane 62: ${rows[0].nw.gpg.toFixed(2)} gol/gara — troppo generoso`);
if (rows[3].nw.gpg > 1.15) issues.push(`star 88: ${rows[3].nw.gpg.toFixed(2)} gol/gara — troppo generoso`);
// monotonia sull'OVR
const gs = [62, 71, 80, 88].map(o => measure(_pSimStats, o, '').gpg);
for (let i = 1; i < gs.length; i++) if (gs[i] <= gs[i - 1]) issues.push(`la produzione non cresce con l'OVR: ${gs.join(' → ')}`);
// determinismo a parità di seed
const s1 = _pSimStats({ homeScore: 3, won: true }, 78, 'bomber', mulberry(12345));
const s2 = _pSimStats({ homeScore: 3, won: true }, 78, 'bomber', mulberry(12345));
if (s1.goals !== s2.goals || s1.assists !== s2.assists) issues.push('non deterministico a parità di seed');

// ───── VOTO: la qualità deve contare anche su pari e sconfitta. ATTENZIONE: il voto di una
//        VITTORIA è generoso (6.2+) per CHIUNQUE da sempre — proprietà preesistente del motore,
//        NON toccata qui. Perciò si misura il DELTA introdotto dalla release, non un assoluto:
//        la star deve guadagnare, la riserva NON deve guadagnare (il bonus resta negativo sotto
//        la media), e nessun profilo deve subire inflazione oltre +0.35 di media stagionale.
const ratSrc = src.match(/const _ovrMod=[^;]+;/);
if (!ratSrc) { console.log('❌ FAIL — formula _ovrMod non trovata'); process.exit(1); }
const ovrMod = new Function('clamp', 'playerOvr', '_m', `${ratSrc[0]} return _ovrMod;`);
const ovrModOld = (c, ovr, m) => m > 0 ? c((ovr - 65) / 200, -0.1, 0.3) : 0;// pre-7.261: zero su pari/sconfitta
const ratOf = (mod, ovr, m, r) => {
  const base = m > 0 ? (6.2 + Math.min(m * 0.25, 0.8)) : (m === 0 ? 5.8 : (5.5 - Math.min(-m * 0.18, 0.5)));
  return Math.round(clamp(base + mod(clamp, ovr, m) + (r - 0.5) * 0.4, 4.0, 9.5) * 10) / 10;
};
const seasonRating = (mod, stats, ovr, arch) => {// 34 gare: 45% vinte · 27% pari · 28% perse
  const rnd = mulberry(ovr * 31 + 7); let tot = 0;
  for (let i = 0; i < 34; i++) {
    const m = i % 100 < 45 ? 1 + (i % 3 === 0 ? 1 : 0) : (i % 100 < 72 ? 0 : -1);
    const tg = m > 0 ? m + 1 : 1;
    const ps = stats({ homeScore: tg, awayScore: tg - m, won: m > 0, drew: m === 0 }, ovr, arch, mulberry(i * 977 + ovr));
    tot += clamp(ratOf(mod, ovr, m, rnd()) + ps.goals * 0.4 + ps.assists * 0.2, 4.0, 9.5);
  }
  return tot / 34;
};
console.log('');
for (const [ovr, arch, label] of [[55, '', 'riserva 55'], [65, '', 'giovane 65'], [71, '', 'titolare 71'], [88, 'bomber', 'star 88']]) {
  const nw = seasonRating(ovrMod, _pSimStats, ovr, arch), old = seasonRating(ovrModOld, _oldStats, ovr, arch);
  const d = nw - old;
  console.log(`voto medio stagione simulata — ${label.padEnd(14)} ${old.toFixed(2)} → ${nw.toFixed(2)} (${d >= 0 ? '+' : ''}${d.toFixed(2)})`);
  if (d > 0.35) issues.push(`${label}: voto medio +${d.toFixed(2)} — inflazione oltre il consentito`);
  if (ovr <= 55 && ovrMod(clamp, 55, 0) > 0) issues.push(`riserva 55: il bonus di qualità è POSITIVO su un pareggio (dovrebbe penalizzare chi è sotto la media)`);
  if (ovr >= 88 && ovrMod(clamp, 88, 0) <= 0) issues.push(`star 88: la qualità non conta ancora sul pareggio`);
}

// ───── SEED: ogni competizione deve avere il PROPRIO stream, e lo stesso incontro deve dare lo
//        stesso esito personale da «Simula» e da «Avanza». xorshift32 ha il primo output quasi
//        identico per seed vicini (0.09504 vs 0.09486…): con offset +5/+6/+8 le tre competizioni
//        della stessa settimana davano lo STESSO gol/assist nel 72% dei casi. Guardiano permanente.
function hashStr(x) { let h = 5381; for (let i = 0; i < x.length; i++) { h = ((h << 5) + h) ^ x.charCodeAt(i); h = h >>> 0; } return h; }
function standingsSeed(c, se, w) { return (hashStr(String(c || 'club')) + (se || 1) * 100003 + (w || 1) * 9973) >>> 0; }
function xorshift(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
{
  const seedExprs = [...src.matchAll(/_pSimStats\(sim,p\.ovr\|\|65,[^)]*?,seededRng\(([^)]*(?:\)[^)]*)?)\)\)/g)].map(x => x[1]);
  const tagged = seedExprs.filter(e => /hashStr\("psim\|/.test(e)).length;
  if (tagged < 6) issues.push(`solo ${tagged}/6 rami coppa/Europa usano uno stream seed dedicato (hashStr "psim|…") — rischio esiti clonati tra competizioni`);
  let same = 0, diverge = 0, tot = 0;
  for (let se = 1; se <= 8; se++) for (let w = 1; w <= 38; w++) {
    const base = standingsSeed('sal', se, w);// SIMULA e AVANZA calcolano lo stesso standingsSeed
    const sim = { homeScore: 2, awayScore: 1, won: true, drew: false };
    const draw = t => _pSimStats(sim, 78, 'bomber', xorshift(hashStr('psim|' + t + '|' + base) >>> 0));
    const lg = _pSimStats(sim, 78, 'bomber', xorshift((base + 2) >>> 0));
    const eg = draw('eg'), ek = draw('ek'), cp = draw('cp'), egAvanza = draw('eg');
    tot++;
    if (lg.goals === eg.goals && eg.goals === ek.goals && ek.goals === cp.goals && lg.assists === eg.assists && eg.assists === ek.assists && ek.assists === cp.assists) same++;
    if (eg.goals !== egAvanza.goals || eg.assists !== egAvanza.assists) diverge++;
  }
  console.log(`\nstream seed — 4 competizioni con esito identico: ${(same / tot * 100).toFixed(1)}% · divergenza Simula↔Avanza: ${(diverge / tot * 100).toFixed(1)}%`);
  if (same / tot > 0.15) issues.push(`esito personale clonato tra competizioni nel ${(same / tot * 100).toFixed(0)}% delle settimane (seed correlati)`);
  if (diverge) issues.push(`la stessa gara dà G/A diversi da «Simula» e da «Avanza» nel ${(diverge / tot * 100).toFixed(1)}% dei casi`);
}
// ───── ANTI-FARM: la proprietà da difendere NON è «ignora le simulate» (provata e scartata: era più
//        severa, ×1.00→×1.21 su un profilo misto) ma «SIMULARE NON RENDE PIÙ DURE LE PARTITE GIOCATE».
//        Con l'aggregato vale per costruzione, perché il gpg simulato è più basso di quello dal vivo.
{
  const ad = src.match(/function adaptiveDifficulty\(player\)\{[\s\S]*?\n\}/);
  if (!ad) issues.push('adaptiveDifficulty non trovata');
  else {
    const f = new Function('clamp', `${ad[0]} return adaptiveDifficulty;`)(clamp);
    const live = Array.from({ length: 17 }, () => ({ goals: 1, simulated: false }));
    const simd = Array.from({ length: 17 }, () => ({ goals: 0, simulated: true }));
    const soloLive = f({ goals: 19, matches: 17, matchHistory: live });
    const conSim = f({ goals: 19 + 6, matches: 34, matchHistory: [...live, ...simd] });
    console.log(`anti-farm — 17 gare dal vivo: ×${soloLive.toFixed(2)} · aggiungendo 17 simulate: ×${conSim.toFixed(2)} (non deve salire)`);
    if (conSim > soloLive + 0.001) issues.push(`simulare INDURISCE le partite giocate (×${soloLive.toFixed(2)} → ×${conSim.toFixed(2)}) — l'opposto della richiesta del proprietario`);
  }
}


console.log(`\nmonotonia OVR (gol/gara): ${gs.map(g => g.toFixed(2)).join(' → ')} · determinismo ok`);
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — simulazioni non più severe, invarianti calcistici intatti');
