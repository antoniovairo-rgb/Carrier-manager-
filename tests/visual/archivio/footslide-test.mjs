#!/usr/bin/env node
/* [7.206.0 direttiva PO «mai movimenti robotici»] PROBE FOOT-SLIDE (richiede i modelli GLB ATTIVI, che il
   gate spegne). Un piede non slitta quando la CADENZA del passo è proporzionale alla VELOCITÀ: il rapporto
   velocità/cadenza deve restare ~costante. Se cresce con la velocità, il giocatore va più veloce di quanto
   le gambe girino → scivola. Campiona (velocità, timeScale della clip di corsa) via l'hook __CPM_STRIDE
   durante una partita reale e riporta il rapporto per fascia di velocità. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await installCdnRoutes(page);
const issues = []; page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
await page.addInitScript(() => { window.__CPM_GLB = true; });   // i modelli veri: senza, non esiste clip di corsa
await openMatch(page, port, { skipLoadAll: true });
await page.waitForFunction(() => typeof window.__CPM_AUTOPLAY === 'function', null, { timeout: 40000 });
await page.evaluate(() => { window.__CPM_STRIDE = []; window.__CPM_AUTOPLAY(true, { seed: 31, policy: 'seeded' }); });
await sleep(26000);
const RAW = await page.evaluate(() => window.__CPM_STRIDE || []);
/* scarta i frame di SETUP: uno snap di formazione produce «velocità» di 30-50 u/s che non è una corsa
   (nessun essere umano) e falserebbe la fascia alta. Un calciatore reale sta sotto i ~10 m/s. */
const S = RAW.filter(([v]) => v <= 14);
await browser.close(); srv.close();
console.log(`campioni velocità↔cadenza: ${S.length} (scartati ${RAW.length - S.length} frame di setup con velocità non umane)`);
if (S.length < 200) { issues.push(`campione insufficiente (${S.length}): i GLB non si sono agganciati?`); }
const B = [[1, 2], [2, 4], [4, 6], [6, 9], [9, 99]];
const rows = [];
for (const [lo, hi] of B) {
  const g = S.filter(([v]) => v >= lo && v < hi);
  if (g.length < 12) continue;
  const mv = g.reduce((a, [v]) => a + v, 0) / g.length, mt = g.reduce((a, [, t]) => a + t, 0) / g.length;
  rows.push({ band: `${lo}-${hi === 99 ? '+' : hi} u/s`, n: g.length, v: +mv.toFixed(2), ts: +mt.toFixed(2), ratio: +(mv / mt).toFixed(2) });
}
for (const r of rows) console.log(`  ${r.band.padEnd(9)} n=${String(r.n).padStart(4)} · velocità ${String(r.v).padStart(5)} · cadenza ${r.ts} · rapporto velocità/cadenza ${r.ratio}`);
if (rows.length >= 2) {
  const lo = rows[0].ratio, hi = rows[rows.length - 1].ratio;
  const drift = +(hi / lo).toFixed(2);
  console.log(`deriva del rapporto fra la fascia più lenta e la più veloce: ×${drift} (1.0 = nessuno slittamento; più alto = i piedi slittano)`);
  if (drift > 2.2) issues.push(`i piedi slittano: il rapporto velocità/cadenza cresce ×${drift} fra fascia lenta e veloce (atteso ≤2.2)`);
}
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ FOOT-SLIDE SOTTO CONTROLLO (la cadenza segue la velocità)');
process.exit(issues.length ? 1 : 0);
