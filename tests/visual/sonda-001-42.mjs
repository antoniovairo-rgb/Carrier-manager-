/* [PO-252/10 giro 42] Il 001 «in catena» e' il gioco o lo strumento? Stesso criterio del banco 248 (pallone a > 3u dal corpo piu'
   vicino, __CPM_OWN dalle mesh, finestra di SCENA 0,3-1,0 s dall'ingresso in hl_intro), ma su PARTITE VERE non forzate
   (autoplay seedato, nomi diversi = partite diverse, 7.496), GLB acceso, teatro acceso (__CPM_PRESENT=1, 7.345).
   Ogni apertura e' classificata dalla fase da cui si entra: dal gioco fluido (playing) o da un altro highlight (hl_*: catena). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_PARTITE || 3), TETTO = +(process.env.CPM_TETTO_MS || 280000);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ap = []; // {da, d, gi}
for (let i = 0; i < N; i++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(() => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; });
  await openMatch(page, port, { name: 'Catena' + i });
  await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 4200 + i * 37);
  const t0 = Date.now(); let prev = null, cur = null;
  while (Date.now() - t0 < TETTO) {
    const o = await page.evaluate(() => ({ ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, s: window.__CPM_SCENET || 0, o: window.__CPM_OWN ? window.__CPM_OWN() : null, k: (window.__CPM_STATE && (window.__CPM_STATE() || {}).sitKey) || null })).catch(() => null);
    if (!o) { await sleep(60); continue; }
    if (o.ph === 'ended' || o.ph === 'ceremony') break;
    if (o.ph === 'hl_intro' && prev !== 'hl_intro') { if (cur && cur.ds.length) ap.push(cur); cur = { da: /^hl_/.test(prev || '') ? 'catena' : (prev || '?'), s0: o.s, ds: [], partita: i }; }
    if (cur && o.o && o.o.d != null) { const ds = o.s - cur.s0; if (ds >= 0.3 && ds <= 1.0) cur.ds.push(o.o.d); }
    if (o.ph !== 'hl_intro' && o.ph !== 'hl_choose' && cur && cur.ds.length) { ap.push(cur); cur = null; }
    if (o.ph) prev = o.ph; await sleep(60);
  }
  if (cur && cur.ds.length) ap.push(cur);
  await page.close();
}
await b.close(); srv.close();
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const per = {}; for (const a of ap) { const m = med(a.ds); (per[a.da] = per[a.da] || []).push(m); }
for (const [k, v] of Object.entries(per)) console.log(`da ${k}: ${v.filter(x => x > 3).length}/${v.length} aperture con pallone > 3u (mediane ${v.map(x => x.toFixed(1)).join(' ')})`);
console.log(`aperture totali ${ap.length} su ${N} partite`);
