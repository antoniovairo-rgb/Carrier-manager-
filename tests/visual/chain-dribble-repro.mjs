/* [7.8.x] riproduce un highlight DRIBBLING+GOL: risolve l'azione dribbling e traccia la palla (game x)
   per verificare se entra VISIVAMENTE in porta (finto gol) prima che parta la catena dopo_dribbling. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, canvasShot, ROOT } from './lib/harness.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'tests/visual/out'); fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 820 } });
const errs = []; page.on('pageerror', e => errs.push('PE:' + e.message));
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port, { skipLoadAll: true });
// trova un gi con azione[0] dribbling+goal
const gi = await page.evaluate(() => {
  const S = window.__CPM_SITS || [];
  for (let i = 0; i < S.length; i++) { const a = S[i] && S[i].actions && S[i].actions[0]; if (a && a.stat === 'dribbling' && a.rew === 'goal') return i; }
  return -1;
});
console.log('gi dribbling+goal:', gi, gi>=0?(await page.evaluate(g=>window.__CPM_SITS[g].text,gi)):'');
if (gi < 0) { console.log('nessuno'); await browser.close(); srv.close(); process.exit(0); }

await page.evaluate((g) => window.__CPM_FORCE_SIT(g, true), gi);
await sleep(700);
// risolvi azione 0 (il dribbling) e traccia palla + score
await page.evaluate(() => { window.__CPM_FROZEN = false; window.__CPM_RESOLVE && window.__CPM_RESOLVE(0); });
const samples = [];
for (let i = 0; i < 24; i++) {
  await sleep(120);
  const d = await page.evaluate(() => {
    const s = window.__CPM_STATE ? window.__CPM_STATE() : null;
    const scoreTxt = (document.body.innerText.match(/(\d+)\s*[-–]\s*(\d+)/) || [])[0] || '';
    return { bx: s && s.ball ? s.ball.x : null, phase: s ? s.phase : null, score: scoreTxt };
  });
  samples.push(d);
}
const maxBx = Math.max(...samples.map(s => s.bx || 0));
console.log('ball game-x max:', maxBx.toFixed(1), '(porta ~98.6; >95 = dentro/oltre la linea)');
console.log('fasi:', [...new Set(samples.map(s => s.phase))].join(','));
console.log('score finale:', samples[samples.length-1].score);
for (let i = 0; i < 4; i++) { await sleep(400); fs.writeFileSync(path.join(OUT, `chain-dribble-${i}.png`), await canvasShot(page)); }
console.log('→ out/chain-dribble-*.png · pageerr', errs.length ? errs.slice(0,3) : 0);
await browser.close(); srv.close();
