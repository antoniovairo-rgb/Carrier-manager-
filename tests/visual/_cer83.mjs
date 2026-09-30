import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const PIANO = [['league', 'lap'], ['cup', 'curva'], ['int', 'burst'], ['int', 'lift']];
for (const [kind, beat] of PIANO) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_CAMT767ON = 1; });
  await openMatch(p, port, { skipLoadAll: true }); await sleep(1500);
  const cdp = await ctx.newCDPSession(p); let ult = null;
  cdp.on('Page.screencastFrame', e => { ult = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 412, maxHeight: 915 });
  await p.evaluate(k => window.__CPM_FORCE_CEREMONY({ name: 'Coppa ' + k, kind: k }), kind);
  await p.waitForFunction(() => window.__CPM_CER425 && window.__CPM_CER425.beatsD, { timeout: 20000 }).catch(() => {});
  const sc = await p.evaluate(() => window.__CPM_CER425);
  const t0 = Date.now(); let bk = null, t1 = null; while (Date.now() - t0 < 120000) { bk = await p.evaluate(() => window.__CPM_CERBK); if (bk === beat && !t1) t1 = Date.now(); if (t1 && Date.now() - t1 > 3500) break; await sleep(150); }
  const m = await p.evaluate(() => { const T = window.__CPM3D, c = window.__CPM_CAMT767; let tro = null; T.scene.traverse(x => { if (x._extra425 !== undefined && !tro) tro = x; });
    return { hs: c && c.hs94, tro: tro ? +Math.hypot(tro.position.x - T.hero.position.x, tro.position.z - T.hero.position.z).toFixed(2) : null, troVis: tro ? tro.visible : null }; });
  await sleep(300); if (ult) fs.writeFileSync(`out/cer83/${kind}-${beat}.png`, ult);
  console.log(kind, beat, 'visto', bk, sc.beats.join('>'), JSON.stringify(m));
  await ctx.close();
}
await b.close(); srv.close();
