/* [7.4.0 FASE 1] AFFLUENZA MULTI-FATTORE — test PROPRIETÀ del nuovo modello (non più solo prestigio):
   il bacino batte il prestigio, la forma/derby/finale/meteo pesano ma non dominano, la fedeltà smorza i cali,
   la passione alza il pavimento, spettatori ≤ capienza, determinismo. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => typeof window.__CPM_crowdCtx === 'function', { timeout: 40000 });

const res = await page.evaluate(() => {
  const F = window.__CPM_crowdCtx, PC = window.__CPM_profileCapacity, PR = window.__CPM_clubProfile;
  const club = { id: 'test_fc', n: 'Test FC', p: 78, lg: 'Lega A' };
  const cap = PC(PR(club));
  const base = x => ({ context: 'career', homeClub: club, capacity: cap, week: 12, season: 1, standPos: 9, standN: 18, oppPrestige: 65, ...x });
  const out = { cases: [], det: null };
  const mk = (name, args) => { const r = F(args); out.cases.push({ name, ...r }); return r; };
  mk('trial', { context: 'trial', week: 4, season: 1 });
  mk('league', base({ matchWeight: 2 }));
  mk('big', base({ matchWeight: 9, standPos: 2 }));
  mk('derby', base({ matchWeight: 8, derby: true, standPos: 4 }));
  mk('cupFinal', { context: 'cup', homeClub: club, isFinal: true, week: 34, season: 1, capacity: cap });
  mk('storm', base({ matchWeight: 2, weather: { id: 'storm' } }));
  mk('winStreak', base({ matchWeight: 2, formStreak: 5, standPos: 2 }));
  mk('lossStreak', base({ matchWeight: 2, formStreak: -5, standPos: 17 }));
  // bacino vs prestigio: club BIG MARKET low prestige (Salerno) vs SMALL MARKET high prestige (Sassuolo)
  const saler = { id: 'sal', n: 'FC Salernum', p: 45, lg: 'Lega B' };
  const sasso = { id: 'sas', n: 'FC Neroverde', p: 68, lg: 'Lega A' };
  const rSal = F(base({ homeClub: saler, capacity: PC(PR(saler)), matchWeight: 2 }));
  const rSas = F(base({ homeClub: sasso, capacity: PC(PR(sasso)), matchWeight: 2 }));
  out.marketBeatsPrestige = rSal.attendance > rSas.attendance;
  out.salAtt = rSal.attendance; out.sasAtt = rSas.attendance;
  // determinismo
  const a = F(base({ matchWeight: 3, week: 9, season: 2 })), b = F(base({ matchWeight: 3, week: 9, season: 2 }));
  out.det = JSON.stringify(a) === JSON.stringify(b);
  return out;
});
await browser.close(); srv.close();

const C = Object.fromEntries(res.cases.map(c => [c.name, c]));
const checks = [
  ['provino quasi vuoto (≤300 spettatori, 0 ospiti)', C.trial.attendance <= 300 && C.trial.awayFill === 0],
  ['finale quasi pieno (fill≥0.90)', C.cupFinal.fill >= 0.90],
  ['derby > campionato', C.derby.fill > C.league.fill],
  ['big match > campionato', C.big.fill > C.league.fill],
  ['meteo riduce ma non svuota (storm<league, ≥0.30)', C.storm.fill < C.league.fill && C.storm.fill >= 0.30],
  ['forma: 5 vittorie > 5 sconfitte', C.winStreak.fill > C.lossStreak.fill],
  ['fedeltà: il calo per 5 sconfitte è contenuto (>65% del campionato)', C.lossStreak.fill > C.league.fill * 0.65],
  ['IL BACINO BATTE IL PRESTIGIO: Salerno(p45) > Sassuolo(p68)', res.marketBeatsPrestige === true],
  ['derby: curva ospiti specchia la casa (awayFill≈fill)', Math.abs(C.derby.awayFill - C.derby.fill) < 0.03],
  ['campionato: curva ospiti parziale (awayFill<fill)', C.league.awayFill < C.league.fill],
  ['spettatori ≤ capienza (tutti i casi)', res.cases.every(c => c.attendance <= c.capacity)],
  ['deterministico run-to-run', res.det === true],
];
let fail = 0;
for (const [name, ok] of checks) { console.log((ok ? '  ✅ ' : '  ❌ ') + name); if (!ok) fail++; }
console.log(`\n  bacino>prestigio: Salerno ${res.salAtt} vs Sassuolo ${res.sasAtt}`);
console.log('dettaglio:'); res.cases.forEach(c => console.log(`  ${c.name.padEnd(11)} tier=${(c.tier||'').padEnd(8)} fill=${c.fill} away=${c.awayFill} int=${c.intensity} att=${c.attendance}/${c.capacity}`));
console.log(fail === 0 ? '\n✅ AFFLUENZA MULTI-FATTORE OK' : `\n❌ ${fail} check falliti`);
process.exit(fail === 0 ? 0 : 1);
