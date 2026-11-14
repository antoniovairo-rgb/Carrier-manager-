#!/usr/bin/env node
/* [giro 192] PESO E FOTOGRAMMI AL SECONDO delle tre scene toccate, viewport telefono 375x812 con CPU rallentata x4 (CDP), prima (i
   quattro rossi __CPM_NO_G192A..D) e dopo. ⚠️ E' un'approssimazione headless (rendering software): confronta i due bracci, NON dice gli
   fps del telefono del PO. Peso: byte scaricati dalla pagina durante la scena (rete intercettata). */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { apri } from './misura-pres-192.mjs';
const ROSSI = ['__CPM_NO_G192A', '__CPM_NO_G192B', '__CPM_NO_G192C', '__CPM_NO_G192D'];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const fps = async p => p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 8000) requestAnimationFrame(f); else r(+(n / ((performance.now() - t0) / 1000)).toFixed(1)); }; requestAnimationFrame(f); }));
const lenta = async p => { const c = await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); };
const peso = p => { const o = { n: 0 }; p.on('response', async r => { try { const bb = await r.body(); o.n += bb.length; } catch (e) {} }); return o; };
const out = {};
for (const [nome, flags] of [['prima', ROSSI], ['dopo', []]]) {
  const R = out[nome] = {};
  { const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p); await p.addInitScript(f => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; for (const k of f) window[k] = 1; }, flags);
    await openMatch(p, port, { skipLoadAll: true, name: 'Pres192' }); await p.waitForFunction(() => window.__CPM_GLB_READY, null, { timeout: 60000 }).catch(() => {}); await sleep(1500);
    await lenta(p); await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' })); await sleep(4000); R.premiazione = await fps(p); await p.close(); }
  { const p = await apri(b, port, flags); const w = peso(p); await lenta(p); await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(3));
    await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 }).catch(() => {}); await sleep(2000);
    R.presentazione = await fps(p); R.presentazioneKB = Math.round(w.n / 1024); await p.close(); }
  { const p = await b.newPage({ viewport: { width: 375, height: 812 } }); await installCdnRoutes(p); await p.addInitScript(f => { for (const k of f) window[k] = 1; }, flags);
    await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 }); const w = peso(p); await lenta(p);
    await p.evaluate(() => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
      ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club: { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' }, euroWin: true, avatarId: 0, heroNum: 9 })); });
    await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8, null, { timeout: 90000 }).catch(() => {}); await sleep(2000);
    R.parata = await fps(p); R.parataKB = Math.round(w.n / 1024); await p.close(); }
}
await b.close(); srv.close(); console.log(JSON.stringify(out));
