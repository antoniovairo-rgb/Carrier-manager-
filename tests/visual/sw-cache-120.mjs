#!/usr/bin/env node
/* [giro 120 · PO-322 TWA] SONDA (non-gate) del service worker sulla versione PUBBLICATA del sito (dist-web, `node tools/build-dist.mjs --web`),
   servita sotto /Carrier-manager-/ come su GitHub Pages:
     1. PRIMO AVVIO (?app=twa, profilo vergine, intro compresa): quanti MB scarica, divisi per tipo, nei primi CPM_SECONDI (default 25 s)
     2. SECONDA APERTURA SENZA RETE: la pagina monta? arriva alla home? quali richieste falliscono?
     3. TERZA APERTURA SENZA RETE dopo una seconda visita online (il caso «ho aperto l'app due volte con la rete»)
   Tutte le richieste si contano a livello di CONTESTO (comprese quelle che fa il service worker).
   Uso: node tools/build-dist.mjs --web && CPM_CHROME=/opt/pw-browsers/chromium node sw-cache-120.mjs   (CPM_DIST=<cartella> per un'altra build) */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchBrowser, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const QUI = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(process.env.CPM_DIST || path.join(QUI, '../../dist-web'));
const SEC = +(process.env.CPM_SECONDI || 25);
const BASE = '/Carrier-manager-/';
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error(`manca ${DIST}/index.html: eseguire node tools/build-dist.mjs --web`); process.exit(2); }
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };
const srv = http.createServer((q, r) => {
  let u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
  if (!u.startsWith(BASE)) { r.writeHead(404); return r.end(); }
  u = u.slice(BASE.length) || 'index.html'; if (u.endsWith('/')) u += 'index.html';
  const f = path.join(DIST, u); if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size }); fs.createReadStream(f).pipe(r);
}).listen(0);
const port = srv.address().port; const URLG = `http://localhost:${port}${BASE}?app=twa`;
const b = await launchBrowser();
const ROSSO = process.env.CPM_ROSSO === '1';
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
if (ROSSO) await ctx.addInitScript(() => { window.__CPM_NO_G120S = true; });
let reg = []; const errs = [];
/* byte di RETE: si conta la richiesta che va davvero in rete — quella del service worker, o quella della pagina NON servita da lui */
ctx.on('requestfinished', async rq => { try { const r = await rq.response(); if (r && r.fromServiceWorker()) return; const s = await rq.sizes(); reg.push({ u: rq.url(), b: s.responseBodySize + s.responseHeadersSize }); } catch (_e) {} });
/* fallite: solo quelle della PAGINA. Senza rete il service worker prova prima la rete (network-first) e quel tentativo fallisce per
   costruzione, poi risponde dalla cache: contarlo darebbe un «file perso» che la pagina invece ha ricevuto. */
ctx.on('requestfailed', rq => { if (rq.serviceWorker()) return; reg.push({ u: rq.url(), fail: rq.failure() && rq.failure().errorText }); });
const tipo = u => { const e = path.extname(new URL(u).pathname).toLowerCase(); return e === '.glb' ? 'GLB' : ['.png', '.jpg', '.webp', '.svg'].includes(e) ? 'immagini' : ['.mp3', '.ogg', '.m4a'].includes(e) ? 'audio' : (e === '.html' || e === '' ) ? 'pagina' : e.slice(1) || 'altro'; };
const somma = (R) => { const t = {}; let tot = 0; for (const x of R) if (!x.fail) { const k = tipo(x.u); t[k] = (t[k] || 0) + x.b; tot += x.b; } return { tot, t }; };
const MB = n => (n / 1048576).toFixed(1) + ' MB';
const apri = async (page, nome) => {
  const t0 = Date.now(); page.on('pageerror', e => errs.push(`${nome}: ${String(e.message).slice(0, 100)}`));
  let ok = true; try { await page.goto(URLG, { waitUntil: 'load', timeout: 60000 }); } catch (e) { ok = false; }
  const monta = ok && await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);
  return { ok, monta, ms: Date.now() - t0 };
};
const page = await ctx.newPage();
/* 1. primo avvio */
const a1 = await apri(page, 'primo'); await sleep(SEC * 1000);
const sw = await page.evaluate(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return { url: r && r.active ? r.active.scriptURL.split('/').pop() : null, reg: !!r, attivo: !!(r && r.active), controlla: !!navigator.serviceWorker.controller, cache: (await caches.keys()), voci: await (async () => { let n = 0; for (const k of await caches.keys()) n += (await (await caches.open(k)).keys()).length; return n; })() }; } catch (e) { return { err: String(e.message) }; } });
const s1 = somma(reg); const prime = reg; reg = [];
console.log(`1. PRIMO AVVIO (${SEC} s, intro compresa): carica=${a1.monta} in ${a1.ms} ms · scaricati ${MB(s1.tot)} · ${Object.entries(s1.t).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ' ' + MB(v)).join(' · ')}`);
console.log(`   service worker: ${JSON.stringify(sw)} · richieste fallite ${prime.filter(x => x.fail).length}`);
/* 2. seconda apertura senza rete (dopo UNA sola visita) */
await ctx.setOffline(true);
const a2 = await apri(page, 'offline-2'); await sleep(3000);
const home2 = await page.evaluate(() => (document.body.innerText || '').slice(0, 80).replace(/\s+/g, ' ')).catch(() => '');
const f2 = reg.filter(x => x.fail); reg = [];
console.log(`2. SECONDA APERTURA SENZA RETE: goto=${a2.ok} monta=${a2.monta} · testo «${home2}» · richieste fallite ${f2.length}${f2.length ? ' (' + f2.slice(0, 4).map(x => new URL(x.u).pathname.split('/').pop() + ':' + x.fail).join(', ') + ')' : ''}`);
/* 3. seconda visita online, poi offline */
await ctx.setOffline(false); const a3a = await apri(page, 'online-2'); await sleep(8000); const s3 = somma(reg); reg = [];
await ctx.setOffline(true); const a3 = await apri(page, 'offline-3'); await sleep(3000);
const f3 = reg.filter(x => x.fail); reg = [];
console.log(`3. TERZA APERTURA SENZA RETE (dopo una 2a visita online, ${MB(s3.tot)} riscaricati): monta=${a3.monta} · richieste fallite ${f3.length}${f3.length ? ' (' + f3.slice(0, 4).map(x => new URL(x.u).pathname.split('/').pop() + ':' + x.fail).join(', ') + ')' : ''}`);
console.log(`errori JS: ${errs.length ? errs.slice(0, 3).join(' | ') : 'nessuno'}`);
fs.writeFileSync(process.env.CPM_OUT || path.join(QUI, 'out/sw-cache-120.json'), JSON.stringify({ secondi: SEC, primo: { ...a1, byte: s1, sw }, offline2: { ...a2, fallite: f2.length }, offline3: { ...a3, fallite: f3.length, riscaricati: s3.tot }, errs }, null, 1));
await b.close(); srv.close();
/* verdetto: verde = la seconda apertura senza rete monta e la terza non perde file; rosso (registrazione di prima) = la seconda NON monta */
const verdeOk = a2.monta && a3.monta && f3.length === 0 && /\?v=/.test(sw.url || '');
const esito = ROSSO ? !a2.monta : verdeOk;
console.log(`\nsw-cache-120 [${ROSSO ? 'rosso' : 'verde'}] ${esito ? '✅' : '❌'} — ${ROSSO ? 'atteso: seconda apertura senza rete che NON monta (comportamento di prima)' : 'attesi: seconda e terza apertura senza rete che montano, 0 file persi, registrazione con ?v='}`);
process.exit(esito ? 0 : 1);
