/* CROWD 2.0 — collaudo VISIVO: screenshot del match con override del contesto folla.
   Scenari: derby pieno (curve piene, striscioni, spicchio ospiti) vs provino (spalti quasi vuoti).
   Output: out/crowd-derby.png · out/crowd-trial.png — da ispezionare a occhio. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(HERE, 'out'), { recursive: true });

const shoot = async (name, ctx) => {
  const srv = await startServer(); const port = srv.address().port;
  const browser = await launchBrowser(); const page = await browser.newPage();
  await page.setViewportSize({ width: 480, height: 860 });
  await installCdnRoutes(page);
  await page.addInitScript((c) => { window.__CPM_GLB = false; window.__CPM_CROWD_OVERRIDE = c; }, ctx);
  await openMatch(page, port);
  await sleep(2500);
  const diag = await page.evaluate(() => {
    const c = document.querySelector('canvas');
    return { canvas: !!c, w: c && c.width, h: c && c.height, crowdErr: window.__CPM_CROWD_ERR || null, ticks: window.__CPM_CROWD_TICK || 0 };
  });
  await page.screenshot({ path: path.join(HERE, 'out', `crowd-${name}.png`) });
  await browser.close(); srv.close();
  console.log(`  ${name}: canvas=${diag.canvas} ${diag.w}x${diag.h} · redraw ticks=${diag.ticks} · err=${diag.crowdErr || 'nessuno'}`);
  return diag;
};

console.log('scenari folla:');
const derby = await shoot('derby', { tier: 'derby', fill: 0.98, awayFill: 0.98, intensity: 1.0, capacity: 60000, attendance: 58800, derby: true, seed: 7 });
const league = await shoot('league', { tier: 'league', fill: 0.60, awayFill: 0.33, intensity: 0.55, capacity: 24000, attendance: 14400, seed: 3 });
const trial = await shoot('trial', { tier: 'trial', fill: 0.025, awayFill: 0, intensity: 0.03, capacity: 2200, attendance: 140, seed: 5 });
const ok = derby.canvas && league.canvas && trial.canvas && !derby.crowdErr && !league.crowdErr && !trial.crowdErr;
console.log(ok ? '\n✅ nessun errore di redraw — ispeziona le PNG in out/' : '\n❌ problemi nel redraw folla');
process.exit(ok ? 0 : 1);
