#!/usr/bin/env node
/* [collaudo 184 · PO 07/11 «Sistemiamo anche il video iniziale»] Misura dell'IntroCinematic (src/19 r.~221), GLB ACCESO (il default del
   gioco), a 360x800 · 412x915 (tocco) · 1440x900 (mouse). Solo lettura: non tocca src/.
   Due passate per formato, cosi' le foto non sporcano i tempi:
   - TEMPI: aperta col tasto vero «Rivedi l'intro» della home, rAF + longtask per tutta la durata, durata fino alla chiusura da sola,
     memoria JS (CDP, dopo GC) prima/dopo e tele WebGL rimaste nella pagina; si ripete 3 volte per vedere se la memoria cresce.
   - FOTO: un fotogramma per ogni didascalia (CAPS t=0 · 4 · 6,3 · 8,4 · 9,6 · 12,8 · 16,3), righe di testo con contrasto sui pixel
     (c180-lib), testi fuori dalla vista, tasto «Salta» e CTA con area di tocco effettiva (EXTRA108).
   ⚠️ headless = rendering software: gli fps assoluti NON sono il telefono (lezione 7.475/PO-237); si confrontano i formati e si
   contano i blocchi lunghi. Uso: C180_FORMATI=s360,s412,pc  C184_FOTO=<dir>  C180_DATI=<dir> */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
import { scelti, RIGHE, contrasti, EXTRA108, DATI_DIR } from './c180-lib.mjs';
const FOTO = process.env.C184_FOTO || DATI_DIR; fs.mkdirSync(FOTO, { recursive: true });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const INIT = () => { try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '0'); } catch (_e) {}
  window.__F184 = []; window.__LT184 = []; let last = 0; const loop = t => { if (window.__REC184) { if (last) window.__F184.push(t - last); } last = t; requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (window.__REC184) window.__LT184.push(Math.round(e.duration)); }).observe({ entryTypes: ['longtask'] }); } catch (_e) {} };
const intro = () => { for (const e of document.body.querySelectorAll('div')) { const c = getComputedStyle(e); if (c.position === 'fixed' && (parseInt(c.zIndex) || 0) >= 10000 && /Salta/.test(e.innerText || '')) return true; } return false; };
const OUT = {};
for (const f of scelti()) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(INIT);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(2500);
  const cdp = await ctx.newCDPSession(page); await cdp.send('HeapProfiler.enable').catch(() => {});
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage').catch(() => {}); await sleep(300); const u = await cdp.send('Runtime.getHeapUsage').catch(() => null); return u ? Math.round(u.usedSize / 1048576 * 10) / 10 : null; };
  const tele = () => page.evaluate(() => document.querySelectorAll('canvas').length);
  const R = { formato: f.nome, giri: [], errs };
  /* il tasto vero della home */
  const tasto = await page.evaluate(() => { const x = document.querySelector('button[title="Rivedi l\'intro"]'); if (!x) return null; const r = x.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top), testo: (x.innerText || '').trim().replace(/\s+/g, ' ') }; });
  R.tastoRivedi = tasto;
  R.heap0 = await heap(); R.tele0 = await tele();
  for (let g = 0; g < 3; g++) {
    await page.evaluate(() => { window.__F184 = []; window.__LT184 = []; window.__REC184 = true; });
    const t0 = Date.now(); if (tasto) await page.click('button[title="Rivedi l\'intro"]'); else await page.evaluate(() => window.dispatchEvent(new CustomEvent('cpm-replay-intro')));
    let aperta = false; for (let i = 0; i < 40 && !aperta; i++) { aperta = await page.evaluate(intro); if (!aperta) await sleep(100); }
    const tApre = Date.now() - t0; let durMs = null; const telePicco = await (async () => { await sleep(3000); return tele(); })();
    while (Date.now() - t0 < 45000) { if (!(await page.evaluate(intro))) { durMs = Date.now() - t0; break; } await sleep(200); }
    const fr = await page.evaluate(() => { window.__REC184 = false; return { f: window.__F184, lt: window.__LT184 }; });
    const s = [...fr.f].sort((a, b) => a - b); const q = p => s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(p * s.length))]) : null;
    const giro = { tApre, durMs, fotogrammi: s.length, fpsMedio: s.length ? Math.round(1000 / (s.reduce((a, b) => a + b, 0) / s.length) * 10) / 10 : null, p50: q(0.5), p95: q(0.95), max: s.length ? Math.round(s[s.length - 1]) : null,
      oltre50: s.filter(x => x > 50).length, oltre100: s.filter(x => x > 100).length, longtask: fr.lt.length, longtaskMax: fr.lt.length ? Math.max(...fr.lt) : 0, longtaskSomma: fr.lt.reduce((a, b) => a + b, 0), telePicco };
    await sleep(1200); giro.heapDopo = await heap(); giro.teleDopo = await tele(); R.giri.push(giro);
    console.log(`${f.nome} giro ${g + 1}: apre ${tApre} ms · dura ${durMs} ms · ${giro.fotogrammi} fotogrammi · fps ${giro.fpsMedio} · p50 ${giro.p50} p95 ${giro.p95} max ${giro.max} · >100ms ${giro.oltre100} · longtask ${giro.longtask} (max ${giro.longtaskMax}) · heap ${giro.heapDopo} MB · tele ${giro.telePicco}→${giro.teleDopo}`);
  }
  /* FOTO: si riapre e si scatta a ogni didascalia; si misurano testi e tasti */
  const T = [1.2, 4.8, 7.6, 9.0, 10.6, 13.6, 17.4, 26];
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cpm-replay-intro'))); const t0 = Date.now(); R.foto = [];
  for (const t of T) { const att = t * 1000 - (Date.now() - t0); if (att > 0) await sleep(att);
    if (!(await page.evaluate(intro))) { R.foto.push({ t, chiusa: true }); continue; }
    const tEff = Math.round((Date.now() - t0) / 100) / 10;
    const q = await page.evaluate(RIGHE).catch(() => ({ righe: [], spezzate: [] }));
    const x = await page.evaluate(EXTRA108).catch(() => ({ tocchi: [] }));
    const lay = await page.evaluate(() => { const W = innerWidth, H = innerHeight; const out = { fuori: [], tasti: [] };
      let ov = null; for (const e of document.body.querySelectorAll('div')) { const c = getComputedStyle(e); if (c.position === 'fixed' && (parseInt(c.zIndex) || 0) >= 10000) ov = e; }
      if (!ov) return out; for (const e of ov.querySelectorAll('div,button')) { const r = e.getBoundingClientRect(); if (!(e.innerText || '').trim() || e.children.length > 3) continue; if (r.left < -1 || r.right > W + 1 || r.top < -1 || r.bottom > H + 1) out.fuori.push({ t: (e.innerText || '').trim().slice(0, 40), l: Math.round(r.left), r: Math.round(r.right) }); }
      for (const bt of ov.querySelectorAll('button')) { const r = bt.getBoundingClientRect(); const a = getComputedStyle(bt, '::after'); out.tasti.push({ t: (bt.innerText || '').trim(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), after: a && a.content !== 'none' ? (a.width + 'x' + a.height) : null, fs: getComputedStyle(bt).fontSize }); }
      out.testi = [...ov.querySelectorAll('div')].filter(e => e.children.length === 0 && (e.innerText || '').trim()).map(e => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return { t: e.innerText.trim().slice(0, 70), fs: c.fontSize, righe: Math.round(r.height / (parseFloat(c.lineHeight) || parseFloat(c.fontSize) * 1.2)), w: Math.round(r.width), y: Math.round(r.top) }; });
      return out; });
    let ctr = []; try { const buf = await page.screenshot({ type: 'png', timeout: 30000 }); const png = PNG.sync.read(buf); ctr = contrasti(png, q.righe, 1);
      const nome = `intro-${f.k.replace('s', '')}-t${String(t).replace('.', '_')}.png`; let out = png; if (f.w > 800) { const W2 = png.width >> 1, H2 = png.height >> 1; out = new PNG({ width: W2, height: H2 }); for (let y = 0; y < H2; y++) for (let x2 = 0; x2 < W2; x2++) { const i = (y * 2 * png.width + x2 * 2) * 4, j = (y * W2 + x2) * 4; for (let c = 0; c < 4; c++) out.data[j + c] = png.data[i + c]; } }
      fs.writeFileSync(path.join(FOTO, nome), PNG.sync.write(out, { colorType: 2 })); } catch (e) {}
    R.foto.push({ t, tEff, testi: lay.testi, fuori: lay.fuori, tasti: lay.tasti, tocchi: x.tocchi, spezzate: q.spezzate, ctr: ctr.map(c => ({ t: c.t, rap: c.rap, soglia: c.soglia, testo: c.testo, fondo: c.fondo, sh: c.sh })) });
    console.log(`  foto t=${t} (eff ${tEff}): testi ${JSON.stringify((lay.testi || []).map(x2 => x2.t.slice(0, 24) + '/' + x2.righe + 'r'))} · fuori ${lay.fuori.length} · sotto soglia ${ctr.filter(c => c.rap < c.soglia).length}/${ctr.length}`);
  }
  OUT[f.k] = R; await ctx.close();
}
fs.writeFileSync(path.join(DATI_DIR, 'intro.json'), JSON.stringify(OUT, null, 1));
await b.close(); srv.close();
