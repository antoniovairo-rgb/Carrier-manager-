/* CPM — RUNNER METRICHE COMPORTAMENTALI (Fondazione F0).
 * Carica il gioco, forza tutte le SITUATIONS, legge __CPM_STATE e calcola le metriche
 * (lib/football-metrics.mjs) → baseline oggettiva della qualità di posizionamento.
 * UN SOLO browser, sequenziale. Uso: node run-metrics.mjs   (output: out/metrics-baseline.json)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation } from './lib/harness.mjs';
import { snapshotMetrics, flagDegenerate } from './lib/football-metrics.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const avg = a => a.length ? +(a.reduce((s, v) => s + v, 0) / a.length).toFixed(1) : null;
const pct = (a, f) => a.length ? +(100 * a.filter(f).length / a.length).toFixed(0) : 0;

(async () => {
  const srv = await startServer();
  const port = srv.address().port;
  const browser = await launchBrowser();
  const page = await browser.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => console.error('PAGEERR', e.message));
  const { total } = await openMatch(page, port);
  console.log('match pronto · forzo', total, 'situations…');

  const rows = [];
  for (let gi = 0; gi < total; gi++) {
    let state = null;
    try { state = await forceSituation(page, gi, { settle: 480, freeze: true }); } catch (e) { /* ignore */ }
    if (!state || !state.ok) { rows.push({ gi, err: true }); continue; }
    const m = snapshotMetrics(state);
    rows.push({ gi, m, warns: flagDegenerate(m) });
    if (gi % 40 === 0) console.log('  …' + gi + '/' + total);
  }
  await browser.close(); srv.close();

  const ok = rows.filter(r => !r.err && r.m);
  const homeW = ok.map(r => r.m.home && r.m.home.width).filter(v => v != null);
  const homeC = ok.map(r => r.m.home && r.m.home.compactness).filter(v => v != null);
  const awayW = ok.map(r => r.m.away && r.m.away.width).filter(v => v != null);
  const minD = ok.map(r => r.m.spacingAll && r.m.spacingAll.minDist).filter(v => v != null);
  const lanes = ok.map(r => r.m.heroLanes).filter(v => v != null);
  const press = ok.map(r => r.m.heroPressure).filter(v => v != null);
  const degen = ok.filter(r => r.warns && r.warns.length);

  const summary = {
    situations: total, valid: ok.length,
    home_width_avg: avg(homeW), away_width_avg: avg(awayW), home_compactness_avg: avg(homeC),
    spacing_min_avg: avg(minD), spacing_under1u_pct: pct(minD, v => v < 1),
    hero_lanes_avg: avg(lanes), hero_lanes_zero_pct: pct(lanes, v => v === 0),
    hero_pressure_avg: avg(press),
    degenerate_pct: pct(ok, r => r.warns && r.warns.length), degenerate_count: degen.length,
  };
  const OUT = path.join(HERE, 'out', 'metrics-baseline.json');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ summary, rows }, null, 1));

  console.log('\n=== BASELINE METRICHE (F0) ===');
  for (const [k, v] of Object.entries(summary)) console.log('  ' + k.padEnd(24) + v);
  console.log('\nesempi config degeneri (prime 8):');
  degen.slice(0, 8).forEach(r => console.log('  [' + r.gi + '] ' + r.warns.join(' · ')));
  console.log('\nreport → out/metrics-baseline.json');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
