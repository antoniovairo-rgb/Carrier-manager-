#!/usr/bin/env node
/* [giro 192] provino: primo piano dell'eroe con la coppa sul tetto del pullman. Uso: node parata-eroe-192.mjs <tag> [flag] */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const TAG = process.argv[2] || 'dopo', FLAGS = (process.argv[3] || '').split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const club = { id: 'liv', n: 'FC Merseyside', a: 'MER', p: 96, c: '#dc2626', c2: '#f5f5f5', nat: '🏴', lg: 'Premier Division' };
for (const [w, h, n] of [[375, 812, 'tel'], [1440, 900, 'pc']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); await installCdnRoutes(p);
  await p.addInitScript(f => { window.__CPM_PARCAM192 = 1; for (const k of f) window[k] = 1; }, FLAGS);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
  await p.evaluate(c => { document.body.innerHTML = '<div id="parata" style="position:fixed;inset:0"></div>';
    ReactDOM.createRoot(document.getElementById('parata')).render(React.createElement(window.__CPM_PARATA198_C, { club: c, euroWin: true, avatarId: 0, heroNum: 9 })); }, club);
  await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8, null, { timeout: 60000 }).catch(() => {});
  await sleep(3000); await p.screenshot({ path: `../../docs/sviluppo/giro192/${TAG}-parata-eroe-${n}.jpg`, type: 'jpeg', quality: 82 }); await p.close();
}
await b.close(); srv.close(); console.log('ok', TAG);
