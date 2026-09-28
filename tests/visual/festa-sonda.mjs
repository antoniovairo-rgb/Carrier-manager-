#!/usr/bin/env node
/* [7.999.47 sonda — PO: «la schermata di festeggiamento vittoria post partita e' davvero brutta, andrebbe reingegnerizzata»]
   Gioca partite col pilota automatico (corpi accesi, 412x915) finche' ne vince una, poi fotografa ogni fase dopo il fischio
   (ceremony, ended e le schermate che seguono) in docs/collaudo-testi/festa/. CPM_NOMI partite da provare. Sola lettura. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const OUT = path.resolve('../../docs/collaudo-testi/festa'); fs.mkdirSync(OUT, { recursive: true });
const NOMI = (process.env.CPM_NOMI || 'Festa1,Festa2,Festa3').split(',');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const nome of NOMI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await installCdnRoutes(page);
  await page.addInitScript(() => { try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} });
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
  const t0 = Date.now(); let prev = null, n = 0, fin = false;
  while (Date.now() - t0 < 280000) {
    const r = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), sc: window.__CPM_SCORE && window.__CPM_SCORE() })).catch(() => ({}));
    if ((r.ph === 'ceremony' || r.ph === 'ended') && !fin) { fin = true; console.log(`${nome}: fischio, punteggio ${JSON.stringify(r.sc)}`); }
    if (fin && r.ph !== prev || (fin && n < 12 && Date.now() % 4000 < 200)) { await sleep(1200); n++; await page.screenshot({ path: path.join(OUT, `${nome}-${String(n).padStart(2, '0')}-${r.ph}.png`) }).catch(() => {}); }
    if (fin && n >= 12) break;
    prev = r.ph; await sleep(250);
  }
  const sc = await page.evaluate(() => window.__CPM_SCORE && window.__CPM_SCORE()).catch(() => null);
  await page.close(); console.log(`${nome}: foto ${n} · ${JSON.stringify(sc)}`);
  if (sc && sc.home > sc.away) break;
}
await b.close(); srv.close();
