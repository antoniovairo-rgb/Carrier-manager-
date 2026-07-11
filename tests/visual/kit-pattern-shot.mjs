/* [7.8.0] screenshot delle maglie con PATTERN 2D — monta JerseyIcon (hook __CPM_JerseyIcon) su una griglia
   di club iconici con i loro colori sociali reali e cattura il PNG per collaudo visivo. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage();
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__CPM_JerseyIcon && window.__CPM_KIT_PATTERN && window.__CPM_CLUBS && window.React && window.ReactDOM, { timeout: 40000 });

const info = await page.evaluate(() => {
  const J = window.__CPM_JerseyIcon, PAT = window.__CPM_KIT_PATTERN, CLUBS = window.__CPM_CLUBS;
  const byId = Object.fromEntries(CLUBS.map(c => [c.id, c]));
  const ids = Object.keys(PAT);
  // div host
  const host = document.createElement('div');
  host.id = 'kitshot';
  host.style.cssText = 'position:fixed;inset:0;background:#0d1528;padding:20px;display:flex;flex-wrap:wrap;gap:18px;align-content:flex-start;z-index:99999;font-family:sans-serif';
  document.body.appendChild(host);
  const React = window.React, ReactDOM = window.ReactDOM;
  const cells = ids.map(id => {
    const c = byId[id]; if (!c) return null;
    return React.createElement('div', { key: id, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#cbd5e1' } },
      React.createElement(J, { color: c.c, color2: c.c2, pattern: PAT[id], number: 10, name: c.n, size: 60 }),
      React.createElement('div', { style: { fontSize: 10, color: '#94a3b8' } }, `${c.n} · ${PAT[id]}`),
      React.createElement('div', { style: { fontSize: 8, color: '#64748b' } }, `${c.c}/${c.c2}`)
    );
  }).filter(Boolean);
  ReactDOM.createRoot(host).render(React.createElement(React.Fragment, null, cells));
  const missing = ids.filter(id => !byId[id]);
  return { count: cells.length, ids, missing };
});
await page.waitForTimeout(600);
const pageErr = [];
page.on('pageerror', e => pageErr.push(String(e)));
const out = new URL('./out/kit-patterns.png', import.meta.url).pathname;
await page.screenshot({ path: out, fullPage: false });
await browser.close(); srv.close();
console.log('club con pattern:', info.count, '·', info.ids.join(' '));
if (info.missing.length) console.log('⚠️ id non trovati in CLUBS:', info.missing.join(' '));
console.log('pageerror:', pageErr.length);
console.log('screenshot →', out);
process.exit(info.missing.length === 0 && pageErr.length === 0 ? 0 : 1);
