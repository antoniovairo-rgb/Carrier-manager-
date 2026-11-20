#!/usr/bin/env node
/* [giro 233 PO-453] SONDA misura-233 — rete del browser dal primo avvio al menu, alla carriera, alla prima partita 3D.
   Per ogni richiesta: indirizzo, byte del file (corpo, non compresso), byte sul filo (gzip per i testi, come fa un sito statico),
   istante (ms dall'inizio della navigazione), tappa in cui parte, chi la chiede (iniziatore CDP: riga dello script o «parser»).
   Percorsi:
     nuovo    primo avvio senza salvataggi: menu (ozio CPM_OZIO s) → Nuova carriera → provino (prima scena 3D) fino ai corpi pronti
     salvato  salvataggio da professionista: menu (ozio) → Continua → carriera (ozio) → partita → corpi pronti
   Rete: CPM_RETE=libera (default) | 4g-lento (1,6 Mbit/s, 150 ms, processore x4: gli stessi numeri del giro 195).
   Bandiere: CPM_FLAGS=__CPM_NO_G233,... · Uscita: tests/visual/out/misura-233-<tag>.json · CPM_TAG=<nome>
   Solo misura: esce sempre 0 se arriva in fondo. */
import fs from 'node:fs'; import http from 'node:http'; import path from 'node:path'; import zlib from 'node:zlib';
import { launchBrowser, installCdnRoutes, sleep, ROOT, clickByText } from './lib/harness.mjs';
import { mkSave } from './misura-205.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const PERCORSO = process.env.CPM_PERCORSO || 'nuovo', RETE = process.env.CPM_RETE || 'libera', OZIO = +(process.env.CPM_OZIO || 20) * 1000;
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean), TAG = process.env.CPM_TAG || `${PERCORSO}-${RETE}`;
const FILE = process.env.CPM_FILE || (PERCORSO === 'salvato' ? '/CARRIER-MANAGER-AV.html?cpmtest=1' : '/CARRIER-MANAGER-AV.html');
const LOD = +(process.env.CPM_LOD || 0) * 1000;
fs.mkdirSync('out', { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json' };
const GZ = new Set(['.html', '.js', '.json', '.webmanifest', '.css', '.svg']); const gzCache = {};
export function serverGzip(root = ROOT) { return new Promise(res => { const s = http.createServer((req, rs) => { let p = decodeURIComponent((req.url || '/').split('?')[0]); if (p === '/') p = '/CARRIER-MANAGER-AV.html';
  const fp = path.join(root, p); if (!fp.startsWith(root)) { rs.writeHead(403); return rs.end(); }
  fs.readFile(fp, (e, d) => { if (e) { rs.writeHead(404); return rs.end(); } const ext = path.extname(fp).toLowerCase(); const h = { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' };
    if (GZ.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) { const k = fp + ':' + d.length; d = gzCache[k] || (gzCache[k] = zlib.gzipSync(d)); h['content-encoding'] = 'gzip'; }
    h['content-length'] = d.length; rs.writeHead(200, h); rs.end(d); }); }); s.listen(0, () => res(s)); }); }

export async function misura({ percorso = PERCORSO, rete = RETE, ozio = OZIO, flags = FLAGS, file = FILE, fino = 'partita' } = {}) {
  const srv = await serverGzip(); const port = srv.address().port; const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const pg = await ctx.newPage(); await installCdnRoutes(pg);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Network.enable');
  if (rete === '4g-lento') { await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  const R = new Map(); let tappa = 'avvio', t0 = 0; const errs = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  cdp.on('Network.requestWillBeSent', e => { if (!t0) t0 = e.timestamp; const u = e.request.url; if (/^data:|^blob:/.test(u)) return; const i = e.initiator || {}; let chi = i.type || '?';
    const f = i.stack && i.stack.callFrames && i.stack.callFrames.find(c => c.url || c.functionName); if (f) chi += ':' + (f.functionName || '') + '@' + (f.url || '').split('/').pop().split('?')[0] + ':' + f.lineNumber;
    R.set(e.requestId, { url: u.replace(`http://localhost:${port}`, ''), t: Math.round((e.timestamp - t0) * 1000), tappa, chi, corpo: 0, filo: 0, fine: null, ok: null }); });
  cdp.on('Network.responseReceived', e => { const r = R.get(e.requestId); if (r) r.st = e.response.status; });
  cdp.on('Network.dataReceived', e => { const r = R.get(e.requestId); if (r) r.corpo += e.dataLength; });
  cdp.on('Network.loadingFinished', e => { const r = R.get(e.requestId); if (r) { r.filo = e.encodedDataLength; r.fine = Math.round((e.timestamp - t0) * 1000); r.ok = true; } });
  cdp.on('Network.loadingFailed', e => { const r = R.get(e.requestId); if (r) { r.ok = false; r.fine = Math.round((e.timestamp - t0) * 1000); } });
  const T = {}; const ora = () => Date.now() - tNav; let tNav = 0;
  await pg.addInitScript(([sv, f, p]) => { for (const k of f) window[k] = 1; if (p === 'salvato') { window.__CPM_GLB = true; window.__CPM_T196ON = 1; } if (p === 'salvato' && !sessionStorage.getItem('g233')) { sessionStorage.setItem('g233', '1'); localStorage.setItem('cpm-v3', JSON.stringify(sv)); } }, [mkSave(2, 9090), flags, percorso]);
  tNav = Date.now();
  await pg.goto(`http://localhost:${port}${file}`, { waitUntil: 'commit', timeout: 300000 });
  await pg.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0 && /Nuova carriera|Continua/i.test(document.body.innerText || ''); }, null, { timeout: 300000 });
  T.menu = ora(); tappa = 'menu-ozio';
  if (fino === 'menu' && !ozio) { const out0 = chiudi(); await browser.close(); srv.close(); return out0; }
  await sleep(ozio); T.menuOzio = ora();
  const pre = await pg.evaluate(() => window.__CPM_PRE237 || null); 
  if (fino !== 'menu') {
    if (percorso === 'nuovo') {
      tappa = 'creazione'; if (!await clickByText(pg, 'Nuova carriera')) throw new Error('Nuova carriera non trovato');
      await sleep(700);
      await pg.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); if (i) { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); } }, 'Misura');
      await sleep(Math.min(ozio, 8000)); T.creazione = ora();
      tappa = 'intro'; if (!await clickByText(pg, 'INIZIA I PROVINI')) throw new Error('INIZIA I PROVINI non trovato'); T.introClic = ora();
      /* l'intro e' la PRIMA scena 3D di chi comincia: quando arrivano i corpi veri (o i fantocci di ripiego)? */
      { const tI = Date.now(); let visto = null, salta = false, att = null; while (Date.now() - tI < (rete === 'libera' ? 60000 : 400000)) { const s = await pg.evaluate(() => ({ glb: !!window.__CPM_INTRO_GLB, st: window.__CPM_INTRO233 || null, att: !!document.querySelector('[data-cpm="attesa233"]'), salta: [...document.querySelectorAll('button')].some(b => /Salta/.test(b.innerText || '') && b.offsetParent), prov: /Inizia il provino/.test(document.body.innerText || '') })).catch(() => ({}));
          if (s.att && att == null) att = ora(); if (s.glb && visto == null) visto = ora(); salta = !!s.salta; if (s.prov) break; if (s.glb && Date.now() - tI > 6000 && s.salta) { await clickByText(pg, 'Salta', 1500).catch(() => {}); } if (!s.salta && !s.prov && !s.att && Date.now() - tI > 4000) break; await sleep(500); }
        T.introCorpi = visto; T.introAttesa = att; T.introStato = await pg.evaluate(() => window.__CPM_INTRO233 || null).catch(() => null); }
      await pg.waitForFunction(() => /Inizia il provino/.test(document.body.innerText || ''), null, { timeout: 120000 }).catch(() => {});
      tappa = 'partita'; if (!await clickByText(pg, 'Inizia il provino')) throw new Error('Inizia il provino non trovato'); T.partitaClic = ora();
    } else {
      tappa = 'carriera'; try { await pg.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
      await pg.waitForFunction(() => !!window.__CPM_CAREER || /Vivi la Settimana|Gioca/i.test(document.body.innerText || ''), null, { timeout: 60000 }).catch(() => {});
      T.carriera = ora(); await sleep(ozio); T.carrieraOzio = ora();
      T.haCareer = await pg.evaluate(() => !!window.__CPM_CAREER);
    }
    if (fino === 'partita' && (percorso === 'nuovo' || T.haCareer)) {
      if (percorso === 'salvato') { tappa = 'partita'; for (let a = 0; a < 16; a++) { if (await pg.evaluate(() => typeof window.__CPM_PHASE === 'function')) break; await pg.evaluate(() => { const C = window.__CPM_CAREER; C.dismiss(); if (C.playMatch() === true) return; C.step(); }); await sleep(1500); } T.partitaClic = ora(); }
      /* avanza la partita finche' la scena 3D ha i corpi: campiona fase, attesa 196, corpi pronti */
      const C = []; const tA = Date.now(); let pronto = null;
      while (Date.now() - tA < (rete === 'libera' ? 240000 : 600000)) { const s = await pg.evaluate(() => { const q = s => document.querySelector(s); let pr = null; try { const x = window.__CPM_PRONTI196 && window.__CPM_PRONTI196(); pr = x ? (x.pronti ? 'pronti' : x.motivo) : null; } catch (e) { pr = 'err'; }
          const att = q('[data-cpm="attesa196"]'); return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, pr, att: !!att, attTesto: att ? att.innerText.replace(/\s+/g, ' ').slice(0, 80) : '', avv: !!q('[data-cpm="avviso3d209"]'), tela: !!document.querySelector('canvas') }; }).catch(() => ({}));
        s.t = ora(); C.push(s); if (s.pr === 'pronti') { pronto = s.t; break; } if (s.avv) break;
        if (s.ph && !/^hl_|playing|ended/.test(s.ph)) await pg.evaluate(() => { const B = [...document.querySelectorAll('button')].filter(b => /avanti|continua|entra|inizia|gioca|vai|salta/i.test(b.innerText || '') && b.offsetParent); if (B[0]) B[0].click(); }).catch(() => {});
        await sleep(1000); }
      T.corpiPronti = pronto; T.campioni = C.filter((c, i) => i === 0 || c.ph !== C[i - 1].ph || c.pr !== C[i - 1].pr || c.att !== C[i - 1].att);
      if (LOD && pronto) { /* quanti corpi usano ciascun livello di dettaglio, campionati lungo la partita */
        await pg.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 9090, policy: 'seeded', tickMs: 300 })).catch(() => {});
        const L = []; const tL = Date.now(); while (Date.now() - tL < LOD) { const a = await pg.evaluate(() => { try { const x = window.__CPM_CGTRADER_LOD_AUDIT && window.__CPM_CGTRADER_LOD_AUDIT(); return x ? { ph: window.__CPM_PHASE && window.__CPM_PHASE(), n: x.avatars, a: x.active, eroe: x.heroLod, st: x.stats, heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, tri: (window.__CPM_RI233 || null) } : null; } catch (e) { return null; } }).catch(() => null); if (a) L.push(a); await sleep(1000); }
        T.lod = L; }
      await sleep(4000);
    }
  }
  function chiudi() { const L = [...R.values()].filter(r => !/^https?:\/\/(cdnjs|cdn\.jsdelivr)/.test(r.url)); const per = {}; for (const r of L) { const k = r.tappa; (per[k] = per[k] || { n: 0, corpo: 0, filo: 0 }); per[k].n++; per[k].corpo += r.corpo; per[k].filo += r.filo; }
    return { tag: TAG, percorso, rete, flags, T, perTappa: per, pre, errs, richieste: L.sort((a, b) => a.t - b.t) }; }
  const out = chiudi(); await browser.close(); srv.close(); return out;
}
const MB = b => (b / 1048576).toFixed(2);
if (import.meta.url === `file://${process.argv[1]}`) {
  const o = await misura({ fino: process.env.CPM_FINO || 'partita' }); fs.writeFileSync(`out/misura-233-${TAG}.json`, JSON.stringify(o, null, 1));
  console.log(`misura-233 · percorso ${o.percorso} · rete ${o.rete} · bandiere ${o.flags.join(',') || '-'}`);
  console.log('tempi (ms dalla navigazione):', JSON.stringify({ ...o.T, campioni: undefined, lod: undefined }));
  for (const [k, v] of Object.entries(o.perTappa)) console.log(`  tappa ${k.padEnd(10)} ${String(v.n).padStart(3)} richieste · ${MB(v.corpo)} MB di file · ${MB(v.filo)} MB sul filo`);
  const tipo = u => /cgtrader-review/.test(u) ? 'corpi CGTrader' : /cgtrader-clip/.test(u) ? 'clip CGTrader' : /regular-anim/.test(u) ? 'clip regular' : /korward-regular-player/.test(u) ? 'corpo regular' : /hair-colors/.test(u) ? 'capelli PNG' : /\.glb/.test(u) ? 'altri GLB' : /\.(png|jpg|webp)/.test(u) ? 'immagini' : /\.(mp3|ogg|wav|m4a)/.test(u) ? 'audio' : /\.html/.test(u) ? 'pagina' : 'altro';
  const G = {}; for (const r of o.richieste) { const k = r.tappa + ' · ' + tipo(r.url); (G[k] = G[k] || { n: 0, b: 0 }); G[k].n++; G[k].b += r.corpo; }
  for (const [k, v] of Object.entries(G)) console.log(`    ${k.padEnd(34)} ${String(v.n).padStart(3)} · ${MB(v.b)} MB`);
  if (process.env.CPM_ELENCO) for (const r of o.richieste) console.log(`    +${String(r.t).padStart(6)} ms ${r.tappa.padEnd(10)} ${MB(r.corpo).padStart(6)} MB ${r.url.slice(0, 70).padEnd(70)} ${r.chi.slice(0, 60)}`);
  if (o.T.lod && o.T.lod.length) { const L = o.T.lod; const mx = k => Math.max(...L.map(x => x.a[k])), md = k => (L.reduce((s, x) => s + x.a[k], 0) / L.length).toFixed(1); const perF = {}; for (const x of L) { const f = /^hl_/.test(x.ph || '') ? 'highlight' : (x.ph || '?'); (perF[f] = perF[f] || []).push(x.a); }
    console.log(`  LOD (${L.length} campioni, ${L[0].n} corpi): lod0 media ${md('lod0')} max ${mx('lod0')} · lod1 media ${md('lod1')} max ${mx('lod1')} · lod2 media ${md('lod2')} max ${mx('lod2')} · eroe ${[...new Set(L.map(x => x.eroe))].join('/')} · memoria JS ${L[L.length - 1].heap} MB · contatori ${JSON.stringify(L[L.length - 1].st)}`);
    for (const [f, A] of Object.entries(perF)) console.log(`    fase ${f.padEnd(10)} ${String(A.length).padStart(3)} campioni · lod0 ${(A.reduce((s, x) => s + x.lod0, 0) / A.length).toFixed(1)} · lod1 ${(A.reduce((s, x) => s + x.lod1, 0) / A.length).toFixed(1)} · lod2 ${(A.reduce((s, x) => s + x.lod2, 0) / A.length).toFixed(1)}`); }
  if (o.T.campioni) console.log('  partita:', o.T.campioni.map(c => `${(c.t / 1000).toFixed(0)}s ${c.ph || '-'}${c.att ? ' ATTESA' : ''}${c.pr ? ' ' + c.pr : ''}`).join(' → '));
  if (o.errs.length) console.log('  errori di pagina:', o.errs.slice(0, 4));
  process.exit(0);
}
