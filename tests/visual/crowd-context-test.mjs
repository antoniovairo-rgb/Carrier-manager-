/* CROWD 2.0 — test analitico di computeCrowdContext (§6/§7 del charter pubblico):
   fill nei range di contesto, derby>big>campionato>provino, determinismo run-to-run,
   malus meteo che non svuota mai lo stadio, spicchio ospiti (awayFill) coerente. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => typeof window.__CPM_crowdCtx === 'function', { timeout: 40000 });

const res = await page.evaluate(() => {
  const F = window.__CPM_crowdCtx;
  const club = { id: 'test_fc', n: 'Test FC', p: 78 };
  const out = { cases: [], det: null };
  const mk = (name, args) => { const r = F(args); out.cases.push({ name, ...r }); return r; };
  mk('trial', { context: 'trial', week: 4, season: 1 });
  mk('league', { context: 'career', homeClub: club, matchWeight: 2, week: 12, season: 1 });
  mk('big', { context: 'career', homeClub: club, matchWeight: 8, week: 30, season: 1 });
  mk('derby', { context: 'career', homeClub: club, matchWeight: 8, derby: true, week: 30, season: 1 });
  mk('cupFinal', { context: 'cup', homeClub: club, isFinal: true, week: 34, season: 1 });
  mk('euroKO', { context: 'euro_ko', homeClub: club, matchWeight: 5, week: 22, season: 1 });
  mk('storm', { context: 'career', homeClub: club, matchWeight: 2, weather: { id: 'storm' }, week: 12, season: 1 });
  // determinismo: due chiamate identiche → identiche
  const a = F({ context: 'career', homeClub: club, matchWeight: 3, week: 9, season: 2 });
  const b = F({ context: 'career', homeClub: club, matchWeight: 3, week: 9, season: 2 });
  out.det = JSON.stringify(a) === JSON.stringify(b);
  return out;
});
await browser.close(); srv.close();

const C = Object.fromEntries(res.cases.map(c => [c.name, c]));
const checks = [
  ['provino quasi vuoto (fill≤0.05, ≤300 spettatori, 0 ospiti)', C.trial.fill <= 0.05 && C.trial.attendance <= 300 && C.trial.awayFill === 0],
  ['campionato 0.45–0.75', C.league.fill >= 0.44 && C.league.fill <= 0.76],
  ['big match 0.80–0.95', C.big.fill >= 0.79 && C.big.fill <= 0.96],
  ['derby 0.95–1.0 e pieno più del big', C.derby.fill >= 0.94 && C.derby.fill >= C.big.fill],
  ['finale = 1.0', C.cupFinal.fill >= 0.99],
  ['KO europeo 0.80–0.95', C.euroKO.fill >= 0.79 && C.euroKO.fill <= 0.96],
  ['malus meteo riduce ma non svuota', C.storm.fill < C.league.fill * 1.001 && C.storm.fill >= 0.30],
  ['curva ospiti: derby piena (awayFill≥0.9)', C.derby.awayFill >= 0.9],
  ['curva ospiti: campionato parziale (awayFill<fill)', C.league.awayFill < C.league.fill],
  ['spettatori ≤ capienza', res.cases.every(c => c.attendance <= c.capacity)],
  ['deterministico run-to-run', res.det === true],
];
let fail = 0;
for (const [name, ok] of checks) { console.log((ok ? '  ✅ ' : '  ❌ ') + name); if (!ok) fail++; }
console.log('\ndettaglio:'); res.cases.forEach(c => console.log(`  ${c.name.padEnd(9)} tier=${c.tier.padEnd(9)} fill=${c.fill} away=${c.awayFill} int=${c.intensity} att=${c.attendance}/${c.capacity}`));
console.log(fail === 0 ? '\n✅ computeCrowdContext OK' : `\n❌ ${fail} check falliti`);
process.exit(fail === 0 ? 0 : 1);
