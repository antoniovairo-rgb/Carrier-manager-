import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const OUT='/home/user/cm-poc/docs/collaudo-testi/festa', GLB=process.env.CPM_GLB==='1', TAG=process.env.CPM_TAG||'festa47';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); await installCdnRoutes(page);
await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_FESTA942_FORCE = { goals: 2, assists: 1, rb: 18 }; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { glb: GLB });
if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
await openMatch(page, port, { skipLoadAll: true, name: 'Festa2' });
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
const t0 = Date.now(); let fatto = false;
while (Date.now() - t0 < 400000) {
  const s = await page.evaluate(() => { const f = document.querySelector('[data-cpm="festa47"]'), g = document.querySelector('[data-cpm="festa942"]'); return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), f: f ? f.innerText.replace(/\n/g, ' | ') : null, g: !!g, body: /PREMIAZIONE|TITOLO VINTO/.test(document.body.innerText) }; }).catch(() => null);
  if (s && (s.f || s.g || s.ph === 'ceremony')) { console.log(JSON.stringify(s)); let k = 0; for (const d of [400, 1500, 3000, 5000]) { await sleep(d - (k ? [400,1500,3000,5000][k-1] : 0)); k++; await page.screenshot({ path: `${OUT}/${TAG}-${k}.png` }); } fatto = true; break; }
  if (s && s.ph === 'ended') { console.log('finita senza festa'); break; } await sleep(300); }
console.log('fatto', fatto); await b.close(); srv.close();
