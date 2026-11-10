#!/usr/bin/env node
/* [giro 140 · PO-337 D13] Lo scuro del pop-up copre il banner «Vivi la Settimana» e le strisce della barra?
   Misura per PIXEL: stesso punto fotografato senza e con il pop-up; rapporto di luminanza dopo/prima.
   Uno scuro rgba(0,0,0,0.66) da' ~0,34 dove copre e ~1,0 dove NON copre. Non tocca src/. */
import fs from 'node:fs'; import path from 'node:path'; import { PNG } from 'pngjs';
import { startServer, launchBrowser, apriPagina, entraInCarriera, sleep, SAVE, congela } from './c178-graf-lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname; const FOTO = path.join(ROOT, 'docs/collaudo-grafico/140/foto');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = []; const R = {};
const lum = (png, x, y) => { let s = 0, n = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const i = ((y + dy) * png.width + (x + dx)) * 4; s += 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2]; n++; } return s / n; };
for (const f of [{ k: 'pc1366', w: 1366, h: 768, touch: false }, { k: 'tabo', w: 1024, h: 768, touch: true }]) {
  const { ctx, page } = await apriPagina(b, port, f, { save: SAVE }, '?cpmtest=1', errs); const res = {};
  if (await entraInCarriera(page, errs)) {
    await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(600);
    await page.evaluate(() => { let best = null; for (const e of document.querySelectorAll('*')) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 100) { if (!best || e.scrollHeight > best.scrollHeight) best = e; } } (best || document.scrollingElement).scrollTop = 260; window.scrollTo(0, 260); }); await sleep(700); await congela(page);
    /* punti: centro del banner «Vivi la Settimana», bottoni della barra, una carta qualunque */
    const punti = await page.evaluate(() => { const o = {}; const W = innerWidth, H = innerHeight;
      const tro = (rx) => { let best = null; for (const e of document.querySelectorAll('button,a,div,span')) { const t = (e.textContent || '').trim(); if (!rx.test(t) || t.length > 60) continue; const r = e.getBoundingClientRect(); if (r.width < 20 || r.height < 10 || r.bottom < 0 || r.top > H) continue; if (!best || r.width * r.height > best.w * best.h) best = { x: Math.round(r.left + Math.min(r.width - 6, 14)), y: Math.round(r.top + r.height / 2), w: r.width, h: r.height, pos: getComputedStyle(e).position }; } return best; };
      o.banner = tro(/VIVI LA SETTIMANA|Vivi la Settimana/i); o.sostieni = tro(/Sostieni il progetto/); o.idee = tro(/Idee e feedback/); o.home = tro(/^Home$/);
      o.carta = { x: Math.round(W * 0.6), y: Math.round(H * 0.92) }; return o; });
    const a = PNG.sync.read(await page.screenshot({ type: 'png' }));
    const r = await page.evaluate(() => window.__CPM_CAREER.apriSettimana('impulso')); await sleep(1200); await congela(page);
    const bb = await page.screenshot({ type: 'png' }); fs.writeFileSync(path.join(FOTO, `d13-${f.k}-impulso-pixel.png`), bb); const B = PNG.sync.read(bb);
    for (const [k, p] of Object.entries(punti)) { if (!p) { res[k] = 'non trovato'; continue; } const l0 = lum(a, Math.min(f.w - 4, Math.max(3, p.x)), Math.min(f.h - 4, Math.max(3, p.y))), l1 = lum(B, Math.min(f.w - 4, Math.max(3, p.x)), Math.min(f.h - 4, Math.max(3, p.y))); res[k] = { x: p.x, y: p.y, pos: p.pos, prima: Math.round(l0), dopo: Math.round(l1), rapporto: Math.round(l1 / Math.max(1, l0) * 100) / 100 }; }
    res.apri = r;
  } else res.errore = 'carriera non aperta';
  R[f.k] = res; console.log(f.k, JSON.stringify(res)); await ctx.close(); }
fs.writeFileSync(path.join(ROOT, 'docs/collaudo-grafico/140/misure-d13-pixel.json'), JSON.stringify(R, null, 1)); await b.close(); srv.close();
