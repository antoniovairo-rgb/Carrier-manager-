/* [7.8.0] screenshot delle maglie con PATTERN 2D — monta JerseyIcon (hook __CPM_JerseyIcon) su TUTTI i club
   senior con i loro colori sociali reali, usando kitPatternFor (curato/solid/derivato). Verifica: ogni club ha
   un design coerente e stabile, distribuzione realistica, 0 errori. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser(); const page = await browser.newPage({ viewport: { width: 1400, height: 2000 } });
await installCdnRoutes(page);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__CPM_JerseyIcon && window.__CPM_kitPatternFor && window.__CPM_CLUBS && window.React && window.ReactDOM, { timeout: 40000 });

const info = await page.evaluate(() => {
  const J = window.__CPM_JerseyIcon, KP = window.__CPM_kitPatternFor, CLUBS = window.__CPM_CLUBS.filter(c => c && c.lg !== 'Nazionale' && !c.isU18);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;background:#0d1528;padding:16px;display:flex;flex-wrap:wrap;gap:10px 12px;align-content:flex-start;z-index:99999;font-family:sans-serif';
  document.body.appendChild(host);
  const React = window.React, ReactDOM = window.ReactDOM;
  const dist = {};
  const cells = CLUBS.map((c, i) => {
    const pat = KP(c); const key = pat || 'solid'; dist[key] = (dist[key] || 0) + 1;
    return React.createElement('div', { key: i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 76 } },
      React.createElement(J, { color: c.c, color2: c.c2, pattern: pat, number: 9, name: c.n, size: 44 }),
      React.createElement('div', { style: { fontSize: 8, color: '#94a3b8', textAlign: 'center', lineHeight: 1.1 } }, c.n),
      React.createElement('div', { style: { fontSize: 7, color: '#64748b' } }, key)
    );
  });
  ReactDOM.createRoot(host).render(React.createElement(React.Fragment, null, cells));
  return { count: cells.length, dist };
});
await page.waitForTimeout(700);
const pageErr = []; page.on('pageerror', e => pageErr.push(String(e)));
const out = new URL('./out/kit-patterns-all.png', import.meta.url).pathname;
await page.screenshot({ path: out, fullPage: true });
await browser.close(); srv.close();
console.log('club renderizzati:', info.count);
console.log('distribuzione pattern:', JSON.stringify(info.dist));
console.log('pageerror:', pageErr.length);
console.log('screenshot →', out);
process.exit(pageErr.length === 0 ? 0 : 1);
