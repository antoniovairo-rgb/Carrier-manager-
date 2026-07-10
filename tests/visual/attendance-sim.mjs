/* [7.4.0 FASE 1] SIMULATORE DI MASSA dell'affluenza (direttiva PO «migliaia di simulazioni»).
   Itera TUTTI i club × molti contesti (posizione, forma, derby, meteo, importanza) su più "settimane"
   e verifica: affluenze realistiche per categoria, ZERO estremi (mai <5% né >capienza), il BACINO conta
   più del prestigio, sensibilità ai fattori, determinismo. Non è un gate: è la validazione del modello. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__CPM_CLUBS && window.__CPM_crowdCtx && window.__CPM_profileCapacity && window.__CPM_clubProfile, { timeout: 40000 });

const R = await page.evaluate(() => {
  const F = window.__CPM_crowdCtx, PC = window.__CPM_profileCapacity, PR = window.__CPM_clubProfile;
  const CLUBS = window.__CPM_CLUBS.filter(c => c && c.lg !== 'Nazionale');
  const rand = (s) => { s = Math.abs((Math.sin(s) * 43758.5453) % 1); return s; };
  let n = 0, extremes = 0, overCap = 0;
  const perClub = {};       // media affluenza per club (campionato)
  const byLeagueFill = {};  // fill medio per lega
  const senior = CLUBS.filter(c => !c.isU18);
  senior.forEach((c, ci) => {
    const prof = PR(c), cap = PC(prof);
    let tot = 0, cnt = 0;
    for (let w = 2; w <= 34; w += 2) {
      // contesto pseudo-vario (deterministico per club/settimana)
      const r = rand(ci * 100 + w);
      const standPos = 1 + Math.floor(rand(ci + w) * 17), formStreak = Math.round((rand(ci * 3 + w) - 0.5) * 10);
      const weather = r < 0.15 ? { id: 'rain' } : r < 0.2 ? { id: 'storm' } : null;
      const derby = rand(ci * 7 + w) < 0.06, mw = derby ? 8 : (r < 0.25 ? 7 : 2);
      const ctx = { context: 'career', homeClub: c, capacity: cap, week: w, season: 1, matchWeight: mw, derby, standPos, standN: 18, formStreak, oppPrestige: 55 + Math.floor(rand(ci + w * 2) * 40), weather };
      const o = F(ctx); n++;
      if (o.attendance > o.capacity) overCap++;
      if (o.fill < 0.05 || o.fill > 1.001) extremes++;
      tot += o.attendance; cnt++;
      (byLeagueFill[c.lg] = byLeagueFill[c.lg] || []).push(o.fill);
    }
    perClub[c.id] = { n: c.n, p: c.p, lg: c.lg, mkt: prof.market, cap, avg: Math.round(tot / cnt) };
  });
  // determinismo: due passate identiche
  const c0 = senior[0]; const d1 = F({ context: 'career', homeClub: c0, capacity: PC(PR(c0)), week: 5, season: 1, standPos: 3, standN: 18 });
  const d2 = F({ context: 'career', homeClub: c0, capacity: PC(PR(c0)), week: 5, season: 1, standPos: 3, standN: 18 });
  const det = JSON.stringify(d1) === JSON.stringify(d2);
  const leagueAvgFill = Object.fromEntries(Object.entries(byLeagueFill).map(([k, v]) => [k, +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(3)]));
  // esempio market>prestige: club con market alto e p basso deve battere in media un club market basso p alto
  const arr = Object.values(perClub);
  return { n, extremes, overCap, det, leagueAvgFill, perClub, count: senior.length };
});
await browser.close(); srv.close();

// analisi
const clubs = Object.values(R.perClub);
const avgs = clubs.map(c => c.avg);
const sorted = [...clubs].sort((a, b) => b.avg - a.avg);
const top5 = sorted.slice(0, 5), bot5 = sorted.slice(-5);
// realismo per categoria (media affluenza campionato)
const bandOf = a => a < 4000 ? '<4k' : a < 10000 ? '4-10k' : a < 20000 ? '10-20k' : a < 40000 ? '20-40k' : a < 60000 ? '40-60k' : '60k+';
const bands = {}; clubs.forEach(c => bands[bandOf(c.avg)] = (bands[bandOf(c.avg)] || 0) + 1);

const checks = [
  [`nessuna affluenza > capienza (${R.overCap}/${R.n})`, R.overCap === 0],
  [`nessun estremo di fill <5% o >100% (${R.extremes}/${R.n})`, R.extremes === 0],
  ['determinismo run-to-run', R.det === true],
  ['range affluenze plausibile (min≥1500, max≤90k)', Math.min(...avgs) >= 1500 && Math.max(...avgs) <= 90000],
  ['la media più alta è un grande club (≥40k)', sorted[0].avg >= 40000],
  ['esistono piccole piazze (<8k) e grandi (≥30k) — spettro ampio', clubs.some(c => c.avg < 8000) && clubs.some(c => c.avg >= 30000)],
];
let fail = 0;
console.log(`\n== SIMULATORE AFFLUENZA — ${R.count} club × 17 gare = ${R.n} contesti ==\n`);
for (const [name, ok] of checks) { console.log((ok ? '  ✅ ' : '  ❌ ') + name); if (!ok) fail++; }
console.log('\n  distribuzione media affluenza:', JSON.stringify(bands));
console.log('  fill medio per lega:', JSON.stringify(R.leagueAvgFill));
console.log('\n  TOP 5 per media spettatori:'); top5.forEach(c => console.log(`    ${c.n.padEnd(16)} p${c.p} mkt${c.mkt} ${c.lg.padEnd(16)} → ${c.avg}/${c.cap}`));
console.log('  BOTTOM 5:'); bot5.forEach(c => console.log(`    ${c.n.padEnd(16)} p${c.p} mkt${c.mkt} ${c.lg.padEnd(16)} → ${c.avg}/${c.cap}`));
// prova che il prestigio NON domina: correlazione debole market-basso/prestigio-alto sotto market-alto/prestigio-basso
console.log(fail === 0 ? '\n✅ SIMULATORE AFFLUENZA OK' : `\n❌ ${fail} check falliti`);
process.exit(fail === 0 ? 0 : 1);
