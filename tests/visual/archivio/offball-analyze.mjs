/* Calibra il rilevamento OFF-BALL: elenca le situations offensive le cui azioni sono prevalentemente
   "smarcamento/ricezione" (eroe SENZA palla) vs quelle on-ball (tiro/dribbling/cross/passaggio). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.addInitScript(() => { window.__CPM_GLB = false; });
await openMatch(page, port);
const rows = await page.evaluate(() => {
  const S = window.__CPM_SITS || [];
  const OFF = /smarcat|taglio|inseri|\boffr|scatto per|attacca lo spazio|ricever|chiedi palla|dai .*soluzion|vai a ricever|libera(ti)? per|smarca/i;
  const ON = /tir[oaie]|conclu|dribbl|finta|cross|traverson|passaggi|filtrant|imbucat|pallonett|cucchiaio|rovesciat|punizion|rigore|lancio|servi|scarico|va al|porta palla|conduc/i;
  const out = [];
  S.forEach((s, i) => {
    if (s.type === 'def') return;
    const acts = s.actions || [];
    if (!acts.length) return;
    const off = acts.filter(a => OFF.test(a.label || '')).length;
    const on = acts.filter(a => ON.test(a.label || '')).length;
    const isOff = off > on && off >= Math.ceil(acts.length / 2);
    if (isOff) out.push({ i, z: (s.zones || [])[0], bs: s.ballState, t: (s.text || '').slice(0, 40), labels: acts.map(a => a.label).join(' | ') });
  });
  return { total: S.length, offCount: out.length, sample: out };
});
await browser.close(); srv.close();
console.log('situations totali: ' + rows.total + ' · rilevate OFF-BALL: ' + rows.offCount + '\n');
rows.sample.forEach(r => console.log('  #' + r.i + ' [' + (r.z || '?') + '/' + (r.bs || 'feet') + '] ' + r.t + '\n      → ' + r.labels));
