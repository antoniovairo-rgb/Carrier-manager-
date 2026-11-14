#!/usr/bin/env node
/* [giro 195 — collaudo] SOLO MISURA. Tempi e pesi di avvio della versione web precompilata (dist-web, quella del sito e della TWA)
   con CPU rallentata e rete lenta. Server locale con gzip sui testi (come un sito statico). NON e' un telefono vero.
   Uso: node ../../tools/build-dist.mjs --web ; node giro195-prestazioni.mjs  [CPM_CASI=base,cpu4,cpu4rete] */
import fs from 'node:fs'; import path from 'node:path'; import http from 'node:http'; import zlib from 'node:zlib';
import { ROOT, launchBrowser, sleep } from './lib/harness.mjs';
const DIST = path.join(ROOT, 'dist-web'); const OUT = path.join(ROOT, 'docs', 'collaudo', 'giro195', 'prestazioni');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const cache = new Map();
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/index.html'; const fp = path.join(DIST, p); if (!fp.startsWith(DIST) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) { res.writeHead(404); return res.end(); } const ext = path.extname(fp).toLowerCase(); const h = { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' }; if (['.html', '.js', '.json', '.svg', '.webmanifest'].includes(ext)) { if (!cache.has(fp)) cache.set(fp, zlib.gzipSync(fs.readFileSync(fp))); h['content-encoding'] = 'gzip'; res.writeHead(200, h); return res.end(cache.get(fp)); } res.writeHead(200, h); fs.createReadStream(fp).pipe(res); });
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-c177-s5w20.json', import.meta.url)));
const CASI = { base: { cpu: 1, rete: null }, cpu4: { cpu: 4, rete: null }, cpu6: { cpu: 6, rete: null }, cpu4rete: { cpu: 4, rete: { down: 1.6e6 / 8, up: 750e3 / 8, lat: 150 } } };
const scelti = (process.env.CPM_CASI || 'base,cpu4,cpu4rete').split(',');
const b = await launchBrowser(); const RIS = {}; const L = (...a) => console.log("  ·", ...a);
for (const nome of scelti) { const c = CASI[nome];
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable'); if (c.rete) await cdp.send('Network.emulateNetworkConditions', { offline: false, downloadThroughput: c.rete.down, uploadThroughput: c.rete.up, latency: c.rete.lat }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: c.cpu });
  const reqs = []; const byId = {}; cdp.on('Network.responseReceived', e => { byId[e.requestId] = { url: e.response.url.replace(/^https?:\/\/[^/]+/, ''), t: Date.now() }; }); cdp.on('Network.loadingFinished', e => { const r = byId[e.requestId]; if (r) { r.bytes = e.encodedDataLength; r.fine = Date.now(); reqs.push(r); } });
  await page.addInitScript((o) => { window.__CPM_GLB = undefined; for (const k in o) localStorage.setItem(k, o[k]); window.__lt = 0; window.__ltN = 0; window.__ltMax = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__lt += e.duration; window.__ltN++; window.__ltMax = Math.max(window.__ltMax, e.duration); } }).observe({ entryTypes: ['longtask'] }); } catch (e) {} }, SAVE);
  const R = { caso: nome, cpu: c.cpu, rete: c.rete ? '1,6 Mbit/s, 150 ms' : 'locale' }; const t0 = Date.now();
  await page.goto(`http://localhost:${port}/index.html?cpmtest=1`, { waitUntil: 'commit', timeout: 300000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0 && /Continua|Nuova/i.test(document.body.innerText); }, null, { timeout: 60000 }).catch(async e => { console.log("HOME NON VISTA", (await page.evaluate(() => document.body.innerText.slice(0, 300)))); });
  R.home_ms = Date.now() - t0; L("home", R.home_ms); const snap = (k) => { R[k + '_richieste'] = reqs.length; R[k + '_kB'] = Math.round(reqs.reduce((s, r) => s + (r.bytes || 0), 0) / 1024); };
  snap('home'); R.fcp_ms = await page.evaluate(() => { const e = performance.getEntriesByName('first-contentful-paint')[0]; return e ? Math.round(e.startTime) : null; });
  R.home_lunghi = await page.evaluate(() => ({ somma_ms: Math.round(window.__lt), n: window.__ltN, max_ms: Math.round(window.__ltMax) }));
  await page.screenshot({ path: path.join(OUT, `home-${nome}.png`) });
  await sleep(4000); snap('home_dopo4s');
  /* carriera */
  const t1 = Date.now(); await page.getByText('Continua', { exact: false }).first().click({ timeout: 20000 }).catch(() => {}); await page.waitForFunction(() => !!window.__CPM_CAREER && /VIVI LA SETTIMANA|PROSSIMO MOMENTO/i.test(document.body.innerText), null, { timeout: 120000 }).catch(() => {}); R.carriera_ms = Date.now() - t1; snap('carriera');
  /* cambio scheda: tempo fra tocco e prossimo fotogramma con la scheda nuova */
  R.scheda_ms = await page.evaluate(async () => { const out = []; for (const t of ['standings', 'profile', 'agente', 'dashboard']) { const a = performance.now(); window.__CPM_CAREER.goTab(t); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); out.push(Math.round(performance.now() - a)); } return out; });
  L("carriera", R.carriera_ms, R.scheda_ms);
  /* partita */
  const t2 = Date.now(); await page.evaluate(() => { try { window.__CPM_CAREER.dismiss && window.__CPM_CAREER.dismiss(); } catch (e) {} window.__CPM_CAREER.playMatch(); }); const ok = await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 15000 }).then(() => true).catch(() => false); R.partita_ms = ok ? Date.now() - t2 : 'scaduto'; await sleep(6000); snap('partita');
  R.fps_partita = await page.evaluate(() => new Promise(r => { let n = 0; const a = performance.now(); const f = () => { n++; if (performance.now() - a < 3000) requestAnimationFrame(f); else r(Math.round(n / 3 * 10) / 10); }; requestAnimationFrame(f); }));
  R.heap_MB = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null);
  R.grossi = reqs.slice().sort((a, b) => (b.bytes || 0) - (a.bytes || 0)).slice(0, 8).map(r => `${r.url} ${Math.round(r.bytes / 1024)}kB`);
  R.glb_kB = Math.round(reqs.filter(r => /\.glb/.test(r.url)).reduce((s, r) => s + r.bytes, 0) / 1024);
  await page.screenshot({ path: path.join(OUT, `partita-${nome}.png`) });
  RIS[nome] = R; console.log(JSON.stringify(R)); await ctx.close(); }
fs.writeFileSync(path.join(OUT, 'prestazioni.json'), JSON.stringify(RIS, null, 1)); await b.close(); srv.close();
