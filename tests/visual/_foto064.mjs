/* [giro 64] foto prima/dopo GLB-ON 412x915: cartelloni per tipologia e fondale del palco, giorno e notte (__CPM_TOD congelato). Non guardiano. */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const OUT = new URL('../../docs/sviluppo/foto-giro64/', import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function scatto(nome, o) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx); const page = await ctx.newPage();
  await page.addInitScript(o => { window.__CPM_GLB = true; window.__CPM_TOD = o.tod; window.__CPM_PRESENT = 1; if (o.k) window.__CPM_STADIUM_TPL_FORCE = o.k; if (o.r) { window.__CPM_NO_ADK064 = 1; window.__CPM_NO_PALCO064 = 1; } }, o);
  const cdp = await ctx.newCDPSession(page); let ult = null;
  cdp.on('Page.screencastFrame', e => { ult = Buffer.from(e.data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId: e.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'png', maxWidth: 412, maxHeight: 915, everyNthFrame: 1 });
  await openMatch(page, port, { skipLoadAll: true, name: 'Foto064' }); await sleep(1500);
  if (o.cer) { await page.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'Coppa di Lega', kind: 'cup' })); await sleep(o.cer);
    const pos = await page.evaluate(() => { let g = null; window.__CPM3D.scene.traverse(o => { if (!g && o.parent && o.parent._banner23 === o) g = o; }); if (!g) return null; const v = new window.__CPM3D.camera.position.constructor(); g.getWorldPosition(v); const ry = g.rotation.y + (g.parent ? g.parent.rotation.y : 0);
      const dx = Math.sin(ry), dz = Math.cos(ry); window.__CPM_CAM904 = { x: v.x + dx * 13, y: 3.2, z: v.z + dz * 13, lx: v.x, ly: 1.8, lz: v.z }; return { x: +v.x.toFixed(1), z: +v.z.toFixed(1), ry: +ry.toFixed(2) }; });
    console.log('palco', JSON.stringify(pos)); }
  else { await page.evaluate(() => { window.__CPM_FORCE_SIT(13, true); }); await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {}); await sleep(1200);
    await page.evaluate(() => { window.__CPM_CAM904 = { x: 30, y: 4.0, z: 14, lx: 51, ly: 1.2, lz: -1 }; }); }
  await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important}' });
  await sleep(2400); ult = null; await sleep(1200);
  if (ult) fs.writeFileSync(OUT + nome + '.png', ult); await ctx.close(); console.log('foto', nome, !!ult);
}
const MANCA = (process.env.CPM_MANCA || '').split(',').filter(Boolean);
for (const tod of ['day', 'night']) for (const k of ['borgo', 'mattoni', 'arena']) for (const r of [true, false]) { const n = `cartelloni-${k}-${tod}-${r ? 'prima' : 'dopo'}`; if (fs.existsSync(OUT + n + '.png')) continue; await scatto(n, { tod, k, r }); }
for (const tod of ['day', 'night']) for (const r of [true, false]) { const n = `palco-${tod}-${r ? 'prima' : 'dopo'}`; if (fs.existsSync(OUT + n + '.png')) continue; await scatto(n, { tod, r, cer: 5000 }); }
await b.close(); srv.close(); console.log('FINE');
