#!/usr/bin/env node
/* [giro 443] sonda: premiazione di campionato coi corpi accesi, a meta' sollevamento. Per braccio (flag in CPM_BRACCI, separati da ';'):
   CPM_FOTO=1 salva docs/collaudo-po/443-{prima,dopo}-coppa.png (prima = __CPM_NO_G443).
   statura dichiarata dell'eroe, scarto presa-mani (coppa-mani-191), mani sopra il piano dell'eroe e clipT (posa-sollevamento-191). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
const BR = (process.env.CPM_BRACCI || ';__CPM_NO_G431;__CPM_NO_G443').split(';');
for (const f of BR) { const flags = f ? f.split(',') : [];
  const p = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(p);
  await p.addInitScript(fl => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of fl) window[k] = 1; }, flags);
  await openMatch(p, port, { skipLoadAll: true, name: 'Coppa191' });
  await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
  await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'CAMPIONI PREMIER DIVISION', kind: 'league' })); await sleep(3000);
  await p.waitForFunction(() => !!window.__CPM_CER425, null, { timeout: 60000 }).catch(() => {}); const info = await p.evaluate(() => window.__CPM_CER425 || null); const i = info ? info.beats.indexOf('lift') : -1;
  const t0 = i > 0 ? info.beatsD.slice(0, i).reduce((a, x) => a + x, 0) + info.beatsD[i] * 0.45 : 8.5;
  await p.evaluate(t => { window.__CPM_CER476 = []; window.__CPM_PREM24 = {}; window.__CPM_CERT_SET = t; }, t0); await sleep(8000);
  const W = (await p.evaluate(() => window.__CPM_CER476 || [])).filter(w => w.beat === 'lift' && w.mani && w.hero.y > 0.9);
  const ex = await p.evaluate(() => { let h = null; try { window.__CPM3D.scene.traverse(o => { if (o.userData && o.userData.alt431 && o.userData.alt431.eroe) h = o.userData.alt431.h; }); } catch (e) {} return { h, prem: window.__CPM_PREM24 }; });
  if (process.env.CPM_FOTO) { await p.evaluate(t => { window.__CPM_CERT_SET = t; }, t0); await sleep(4000); await p.screenshot({ path: new URL(`../../docs/collaudo-po/443-${f === '__CPM_NO_G443' ? 'prima' : f ? f.replace(/\W+/g, '') : 'dopo'}-coppa.png`, import.meta.url).pathname }); }
  await p.close();
  const sc = W.map(w => Math.abs((w.mani.tY + 0.14 * 0.62) - (w.mani.lY + w.mani.rY) / 2));
  const mani = W.map(w => Math.min(w.mani.lY, w.mani.rY) - w.hero.y), cl = W.map(w => w.mani.clipT).filter(x => x != null);
  console.log((f || 'verde').padEnd(24), 'eroe h', ex.h, '· campioni', W.length, '· scarto med', med(sc) != null ? +med(sc).toFixed(3) : null, '· mani-eroe.y med', med(mani) != null ? +med(mani).toFixed(3) : null, 'max', mani.length ? +Math.max(...mani).toFixed(3) : null, '· mani/h', ex.h && med(mani) != null ? +(med(mani) / ex.h).toFixed(3) : null, '· clipT ult', cl[cl.length - 1], '· prem', JSON.stringify(ex.prem), '· esempio', W.length ? JSON.stringify(W[W.length - 1].mani) : null); }
await b.close(); srv.close();
