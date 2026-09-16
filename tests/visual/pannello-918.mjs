/* [F2+F3 · 7.918] Le statistiche e le pagelle sopra il campo 2D: si vedono? dicono il vero?
   VERDE: pannello acceso. ROSSO __CPM_NO918: campo nudo, come la 7.917.
   Misura: quanta parte dello schermo occupano le cifre, se i numeri a schermo COINCIDONO con
   `motore.tabellino()`, quanti dei ventidue hanno una pagella, il costo in fotogrammi. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out', 'pannello918');
fs.mkdirSync(OUT, { recursive: true });
const server = await startServer(); const port = server.address().port;
const ris = {};
for (const braccio of ['verde', 'rosso']) {
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
  await installCdnRoutes(ctx);
  const page = await ctx.newPage();
  let errori = 0; const messaggi = [];
  page.on('pageerror', (e) => { errori++; if (messaggi.length < 4) messaggi.push(String(e).slice(0, 200)); });
  await page.addInitScript((rosso) => { window.__CPM_GLB = true; if (rosso) window.__CPM_NO918 = true;
    window.__CPM_DRAW = { calls: 0, frames: 0 };
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (fn) => raf((t) => { window.__CPM_DRAW.frames++; return fn(t); });
  }, braccio === 'rosso');
  await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
  await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 300 }); }).catch(() => {});
  try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
  for (let i = 0; i < 40; i++) { const f = await page.evaluate(() => { try { return window.__CPM_PHASE ? window.__CPM_PHASE() : null; } catch (_e) { return null; } }); if (f === 'playing') break; await sleep(500); }
  await sleep(14000); /* si lascia giocare: senza tiri il pannello direbbe zero a zero e non proverebbe niente */
  await page.evaluate(() => { window.__CPM_DRAW.calls = 0; window.__CPM_DRAW.frames = 0; });
  const t0 = Date.now(); await sleep(6000); const dt = (Date.now() - t0) / 1000;
  const r = await page.evaluate(() => {
    const el = document.querySelector('[data-cpm="pannello918"]');
    const vis = (n) => { if (!n) return null; const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
    const testo = el ? String(el.innerText || '').replace(/\s+/g, ' ').trim() : '';
    let tab = null, pag = null;
    try { const m = window.__CPM_MOTORE_OBJ ? window.__CPM_MOTORE_OBJ() : null; if (m) { tab = m.tabellino(); pag = m.pagelle(); } } catch (_e) {}
    /* quanta parte dei pixel del riquadro campo e' coperta dal pannello */
    const campo = document.querySelector('[data-cpm="vista2d"]');
    const cb = campo ? campo.getBoundingClientRect() : null;
    let coperto = 0;
    if (el && cb) { el.querySelectorAll(':scope > div').forEach(d => { const b = d.getBoundingClientRect(); coperto += b.width * b.height; }); }
    return { c2d: !!document.querySelector('[data-cpm="campo2d"]'), pannello: vis(el), testo: testo.slice(0, 400),
      quota: (cb && cb.width * cb.height) ? Math.round(100 * coperto / (cb.width * cb.height)) : 0,
      tab, pagN: pag ? pag.length : 0, pagVoti: pag ? pag.map(q => q.voto) : [],
      pagCasa: pag ? pag.filter(q => q.team === 'home').length : 0, pagOsp: pag ? pag.filter(q => q.team === 'away').length : 0,
      frames: window.__CPM_DRAW.frames };
  });
  await page.screenshot({ path: path.join(OUT, `${braccio}-stat.png`) }).catch(() => {});
  if (braccio === 'verde') { /* la seconda linguetta: le pagelle */
    const b = await page.$$('[data-cpm="pannello918"] button');
    if (b && b[1]) { await b[1].click().catch(() => {}); await sleep(1200); }
    await page.screenshot({ path: path.join(OUT, `${braccio}-pagelle.png`) }).catch(() => {});
  }
  ris[braccio] = { ...r, fps: r.frames / dt, errori, messaggi };
  console.log(`${braccio.toUpperCase()}: pannello ${r.pannello ? r.pannello.w + 'x' + r.pannello.h : 'ASSENTE'} · campo2d ${r.c2d} · quota schermo ${r.quota}% · fps ${(r.frames / dt).toFixed(1)} · pagelle ${r.pagN} (casa ${r.pagCasa} · ospiti ${r.pagOsp}) · errori ${errori}${messaggi.length ? ' → ' + messaggi[0] : ''}`);
  if (r.tab) console.log(`  motore: tiri ${r.tab.home.tiri}-${r.tab.away.tiri} · in porta ${r.tab.home.inPorta}-${r.tab.away.inPorta} · possesso ${r.tab.home.possesso}% · passaggi ${r.tab.home.passaggi}-${r.tab.away.passaggi} · falli ${r.tab.home.falli}-${r.tab.away.falli}`);
  if (r.testo) console.log(`  a schermo: ${r.testo.slice(0, 220)}`);
  if (r.pagVoti && r.pagVoti.length) { const v = r.pagVoti.slice().sort((a, b) => b - a); console.log(`  voti: piu' alto ${v[0]} · piu' basso ${v[v.length - 1]} · diversi ${new Set(r.pagVoti).size}`); }
  await browser.close();
}
const v = ris.verde, r = ris.rosso;
console.log(`\n=== F2+F3: statistiche e pagelle sopra il campo ===`);
console.log(`  pannello: ${v.pannello ? v.pannello.w + 'x' + v.pannello.h : 'ASSENTE'} (rosso: ${r.pannello ? 'presente' : 'assente'})`);
console.log(`  fotogrammi al secondo al banco: ${r.fps.toFixed(1)} (campo nudo) → ${v.fps.toFixed(1)} (col pannello)`);
console.log(`  pagelle: ${v.pagN} giocatori, ${new Set(v.pagVoti).size} voti diversi`);
console.log(`  errori di pagina: rosso ${r.errori} · verde ${v.errori}`);
console.log(`  foto: ${OUT}/verde-stat.png · ${OUT}/verde-pagelle.png`);
server.close();
