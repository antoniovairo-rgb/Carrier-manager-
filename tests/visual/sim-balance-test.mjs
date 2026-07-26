#!/usr/bin/env node
/* [7.200.0 collaudo PO «le partite simulate le perdo o pareggio quasi sempre: troppa severità, deve essere
   realistica anche la simulazione»] MISURA il bilanciamento di `simulateMatch` sui profili veri:
   per ogni scenario gioca l'intero calendario di lega (andata+ritorno vs tutti i club del pool) e riporta
   W/D/L, gol fatti/subiti e punti stagionali. Un club di vertice deve fare una stagione da vertice.
   Soglie: nessuno scenario sotto il proprio livello (la squadra forte non può fare 40 punti). */
import { startServer, launchBrowser, installCdnRoutes, openMatch } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage();
await installCdnRoutes(page);
const issues = [];
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
await page.waitForFunction(() => typeof window.__CPM_simMatch === 'function' && !!window.__CPM_CLUBS, null, { timeout: 20000 });

/* Il pool Lega A misurato ha min 62 · media 75 · max 95: una neopromossa col prestigio da seconda serie è
   un OUTLIER sotto chiunque (per questo la promozione ora dà uno scalino a 56, vedi 7.200.0). Le soglie
   sono calcolate su quel pool: retrocessione ~20-30 pt · salvezza ~35-45 · Europa ~55-70 · titolo ~75-90. */
const SC = [
  { k: 'neopromossa NON adeguata (p45, OVR 70)', p: 45, ovr: 70, minPts: 16, maxPts: 42 },
  { k: 'neopromossa adeguata (p56, OVR 70)', p: 56, ovr: 70, minPts: 26, maxPts: 52 },
  { k: 'neopromossa con FUORICLASSE (p56, OVR 88)', p: 56, ovr: 88, minPts: 38, maxPts: 70 },
  { k: 'club evoluto (p66, OVR 84)', p: 66, ovr: 84, minPts: 44, maxPts: 82 },
  { k: 'big (p85, OVR 88)', p: 85, ovr: 88, minPts: 62, maxPts: 96 },
  { k: 'medio (p60, OVR 76)', p: 60, ovr: 76, minPts: 34, maxPts: 70 },
];

const out = await page.evaluate((SC) => {
  const sim = window.__CPM_simMatch, CL = (window.__CPM_CLUBS || []).filter(c => !c.isU18 && c.lg === 'Lega A');
  const pool = CL.slice(0, 18);
  const res = [];
  const _ps = pool.map(c => c.p).sort((a, b) => b - a);
  res.pool = { n: pool.length, avg: +(_ps.reduce((a, b) => a + b, 0) / _ps.length).toFixed(1), max: _ps[0], min: _ps[_ps.length - 1], med: _ps[Math.floor(_ps.length / 2)] };
  for (const s of SC) {
    const me = { id: '_me', n: 'Prova FC', a: 'PRV', p: s.p, c: '#111', c2: '#eee', nat: '🇮🇹', lg: 'Lega A' };
    const opps = pool.filter(c => c.id !== '_me').slice(0, 17);
    let W = 0, D = 0, L = 0, gf = 0, ga = 0;
    let n = 0;
    for (let rep = 0; rep < 8; rep++) for (const o of opps) for (const home of [true, false]) {
      const r = sim(me, o, s.ovr, home, ((n * 2654435761) ^ (rep * 40503) ^ 0x9e37) >>> 0); n++;
      gf += r.homeScore; ga += r.awayScore;
      if (r.won) W++; else if (r.drew) D++; else L++;
    }
    /* RIFERIMENTO: il modello con cui la LEGA simula tutte le ALTRE coppie (updateStandings, ~6826):
       λH=1.40+diff·1.00 · λA=1.22−diff·0.85 con diff=(hP−aP)/30 sui prestigi EFFETTIVI. È il metro di
       paragone giusto: la squadra del giocatore non può essere valutata su una curva più severa di quella
       con cui viene riempita la classifica in cui compete. */
    let rW = 0, rD = 0, rL = 0, rn = 0;
    const _pois = (lam, rnd) => { const L = Math.exp(-lam); let k = 0, pr = 1; do { k++; pr *= rnd(); } while (pr > L && k < 9); return Math.max(0, k - 1); };
    const _mk = (sd) => { let x = (sd >>> 0) || 1; return () => { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; return x / 4294967296; }; };
    for (let rep = 0; rep < 8; rep++) for (const o of opps) for (const home of [true, false]) {
      const rnd = _mk(((rn * 2654435761) ^ (rep * 40503) ^ 0x5151) >>> 0); rn++;
      const dd = Math.max(-1, Math.min(1, (s.p - (o.p || 65)) / 34));
      const a1 = _pois(Math.max(0.62, Math.min(2.55, 1.42 + dd * 0.95)), rnd), a2 = _pois(Math.max(0.55, Math.min(2.45, 1.26 - dd * 0.82)), rnd);
      /* il modello di lega non ha fattore campo: a1 e' SEMPRE la mia lambda, a2 quella dell'avversario */
      if (a1 > a2) rW++; else if (a1 === a2) rD++; else rL++;
    }
    const games = W + D + L, perSeason = 34 / games;
    const refPts = Math.round((rW * 3 + rD) * (34 / (rW + rD + rL)));
    res.push({ k: s.k, W, D, L, wr: +(W / games * 100).toFixed(1), dr: +(D / games * 100).toFixed(1), lr: +(L / games * 100).toFixed(1),
      gfg: +(gf / games).toFixed(2), gag: +(ga / games).toFixed(2), pts: Math.round((W * 3 + D) * perSeason), refPts, minPts: s.minPts, maxPts: s.maxPts });
  }
  return { rows: res, pool: res.pool };
}, SC);
console.log('pool Lega A: ' + JSON.stringify(out.pool || null));
const rows = out.rows;

for (const r of rows) {
  console.log(`${r.k.padEnd(38)} V ${String(r.wr).padStart(4)}% · N ${String(r.dr).padStart(4)}% · P ${String(r.lr).padStart(4)}% · gol ${r.gfg}-${r.gag} · ~${r.pts} pt/stagione (modello lega: ~${r.refPts})`);
  if (r.pts < r.minPts) issues.push(`${r.k}: solo ~${r.pts} pt (atteso ≥${r.minPts}) — simulazione troppo severa`);
  if (r.pts > r.maxPts) issues.push(`${r.k}: ~${r.pts} pt (atteso ≤${r.maxPts}) — simulazione troppo generosa`);
  if (r.pts < r.refPts - 8) issues.push(`${r.k}: la squadra del giocatore è valutata su una curva PIÙ SEVERA della lega in cui gioca (~${r.pts} pt contro ~${r.refPts} del modello con cui vengono simulate tutte le altre)`);
}
/* il fuoriclasse deve VALERE: a parità di club, +18 OVR deve spostare la stagione in modo netto */
const dSmall = rows[2].pts - rows[1].pts;
console.log(`peso del fuoriclasse nello stesso club (OVR 70→88): +${dSmall} punti/stagione`);
if (dSmall < 8) issues.push(`il fuoriclasse pesa troppo poco sulla simulazione: +${dSmall} pt (atteso ≥8)`);
/* l'evoluzione del club deve contare: stesso giocatore, club cresciuto */
if (!(rows[3].pts > rows[1].pts + 8)) issues.push(`il club evoluto (p66) non rende più della neopromossa (p56): ${rows[3].pts} vs ${rows[1].pts}`);

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SIMULAZIONE BILANCIATA (ogni profilo fa la stagione del proprio livello)');
process.exit(issues.length ? 1 : 0);
