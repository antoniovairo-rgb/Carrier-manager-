import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = true; window.__CPM_DT60 = 1; });
await openMatch(page, port, { skipLoadAll: true, name: 'Clip 342' }); await sleep(1500);
await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 120000 }).catch(() => {});
const R = await page.evaluate(() => window.__CPM_CLIP342(['header', 'mx-header-soccerball', 'mx-header-soccerball-2', 'mx-header-stand', 'running', 'run']));
fs.writeFileSync('out/giro342/clip-profili.json', JSON.stringify(R));
for (const k in R) { const c = R[k]; if (c.err) { console.log(k, c.err); continue; } const F = c.f; const h0 = F[0][2], z0 = F[0][3];
  let ip = 0, il = 0; F.forEach((x, i) => { if (x[2] > F[ip][2]) ip = i; });
  /* avanzamento della testa rispetto al bacino lungo z (avanti del corpo) e sua velocita' */
  let vm = 0, iv = 0; for (let i = 2; i < F.length - 2; i++) { const v = ((F[i + 2][3] - F[i + 2][6]) - (F[i - 2][3] - F[i - 2][6])) / (F[i + 2][0] - F[i - 2][0]); if (v > vm) { vm = v; iv = i; } }
  const g = Math.min(...F.map(x => Math.min(x[8], x[11])));
  let su = null, giu = null; for (let i = 1; i < F.length; i++) { const a = Math.min(F[i - 1][8], F[i - 1][11]) - g < 0.07, bb = Math.min(F[i][8], F[i][11]) - g < 0.07; if (a && !bb && su == null) su = F[i][0]; if (!a && bb && su != null) giu = F[i][0]; }
  console.log(k.padEnd(24), 'dur', c.dur, '| testa riposo', h0, 'picco', F[ip][2], 'a t', F[ip][0], '(u', (F[ip][0] / c.dur).toFixed(2) + ')', '| frustata max', vm.toFixed(2), 'u/s a t', F[iv][0], '| bacino y0', F[0][5], 'max', Math.max(...F.map(x => x[5])).toFixed(2), 'min', Math.min(...F.map(x => x[5])).toFixed(2), '| piedi in aria da', su, 'a', giu, '| bacino xz fine', F[F.length - 1][4], F[F.length - 1][6]);
  console.log('   t:hy/py/zTesta-zBacino/minPiede ', F.filter((x, i) => i % Math.max(1, Math.round(F.length / 24)) === 0).map(x => `${x[0].toFixed(2)}:${x[2].toFixed(2)}/${x[5].toFixed(2)}/${(x[3] - x[6]).toFixed(2)}/${(Math.min(x[8], x[11]) - g).toFixed(2)}`).join(' '));
}
await b.close(); srv.close();
