/* Valida che dist/index.html sia funzionante e OFFLINE: serve dist/ in locale, BLOCCA ogni richiesta
   esterna (CDN), carica la pagina e verifica che il gioco monti (React) e raggiunga la home senza errori. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '../tests/visual/node_modules/playwright/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png' };

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]); if (p === '/') p = '/index.html';
  const fp = path.join(DIST, p);
  if (!fp.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  fs.readFile(fp, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' }); res.end(d); });
});
await new Promise(r => srv.listen(0, r));
const port = srv.address().port;

const _opts = { headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] };
if (process.env.CPM_CHROME) _opts.executablePath = process.env.CPM_CHROME;
const browser = await chromium.launch(_opts);
const page = await browser.newPage();
const errs = [], externalHits = [];
page.on('console', m => { if (m.type() === 'error' && !/manifest|ServiceWorker|sw\.js/i.test(m.text())) errs.push(m.text().slice(0, 160)); });
page.on('pageerror', e => errs.push('PE:' + e.message.slice(0, 160)));
// BLOCCA qualsiasi richiesta NON-locale → se la dist dipendesse ancora da una CDN, fallirebbe a caricare.
await page.route(/^https?:\/\//, route => { const u = route.request().url(); if (/^https?:\/\/(localhost|127\.0\.0\.1)/.test(u)) return route.continue(); externalHits.push(u.slice(0, 80)); return route.abort(); });

await page.goto(`http://localhost:${port}/index.html`, { waitUntil: 'load', timeout: 30000 });
const mounted = await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 }).then(() => true).catch(() => false);
await new Promise(r => setTimeout(r, 1500));
const home = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].map(x => (x.textContent || '').trim()); return { btns: b.length, hasNuova: b.some(t => /nuova carriera|continua|carica/i.test(t)) }; });

console.log('=== VALIDAZIONE DIST (offline) ===');
console.log(`React montato (root popolato): ${mounted ? '✅' : '❌'}`);
console.log(`home raggiunta (bottoni: ${home.btns}, "Nuova carriera": ${home.hasNuova ? 'sì' : 'no'}): ${home.btns > 0 && home.hasNuova ? '✅' : '❌'}`);
console.log(`richieste esterne (CDN) tentate: ${externalHits.length ? '❌ ' + externalHits.slice(0, 5).join(' ') : '✅ NESSUNA → davvero offline'}`);
console.log(`errori console: ${errs.length ? '❌ ' + errs.slice(0, 4).join(' | ') : '✅ nessuno'}`);
const ok = mounted && home.btns > 0 && home.hasNuova && externalHits.length === 0 && errs.length === 0;
console.log(ok ? '\n✅ DIST OFFLINE FUNZIONANTE' : '\n❌ DIST da rivedere');
await browser.close(); srv.close();
process.exit(ok ? 0 : 1);
