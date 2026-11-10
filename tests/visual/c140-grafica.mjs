#!/usr/bin/env node
/* [giro 140 · PO-337] SOLA VERIFICA dei bassi grafici D13, D20, D21, D23 sulla build in prova. Non tocca src/.
   Riusa lo strumento del collaudo 178 (c178-graf-lib.mjs, rilevatore D()) per confrontare gli stessi numeri.
   Uscita: JSON in C140_OUT (default docs/collaudo-grafico/140/misure-grafica.json), foto in docs/collaudo-grafico/140/foto/. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, apriPagina, entraInCarriera, premi, sleep, SAVE, ferma, congela, D, sintesiGap, mediana } from './c178-graf-lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname;
const FOTO = path.join(ROOT, 'docs/collaudo-grafico/140/foto'); fs.mkdirSync(FOTO, { recursive: true });
const OUT = process.env.C140_OUT || path.join(ROOT, 'docs/collaudo-grafico/140/misure-grafica.json');
const TEL = { k: 'tel', w: 412, h: 915, touch: true }, PC = { k: 'pc1366', w: 1366, h: 768, touch: false }, TABO = { k: 'tabo', w: 1024, h: 768, touch: true };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = []; const R = { versione: null };
const shot = async (page, nome) => { const p = path.join(FOTO, nome + '.jpg'); await page.screenshot({ path: p, type: 'jpeg', quality: 70 }); return path.relative(ROOT, p); };
const quale = (process.env.C140_PARTI || 'd21,d23,d20,d13').split(',');

/* D21 — Creazione sul telefono: spazio fra gli avatar */
if (quale.includes('d21')) { const { ctx, page } = await apriPagina(b, port, TEL, {}, '?cpmtest=1', errs);
  R.versione = await page.evaluate(() => typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : null).catch(() => null);
  await sleep(800); const ok = await premi(page, 'Nuova carriera'); await sleep(900); await ferma(page); await congela(page);
  const m = await page.evaluate(() => {
    const lab = [...document.querySelectorAll('label')].find(l => /Aspetto calciatore/.test(l.textContent || '')); if (!lab) return null;
    const grid = lab.nextElementSibling; const btn = [...grid.children].filter(x => x.tagName === 'BUTTON');
    const rb = btn.map(x => x.getBoundingClientRect()); const fig = btn.map(x => (x.firstElementChild || x).getBoundingClientRect());
    const gB = [], gF = []; for (let i = 0; i + 1 < rb.length; i++) { if (Math.abs(rb[i].top - rb[i + 1].top) < 2) { gB.push(rb[i + 1].left - rb[i].right); gF.push(fig[i + 1].left - fig[i].right); } }
    const gBv = [], gFv = []; for (let i = 0; i + 5 < rb.length; i++) { gBv.push(rb[i + 5].top - rb[i].bottom); gFv.push(fig[i + 5].top - fig[i].bottom); }
    const cs = getComputedStyle(grid);
    return { n: btn.length, gridGap: cs.gap, btnW: rb[0] && Math.round(rb[0].width * 10) / 10, figW: fig[0] && Math.round(fig[0].width * 10) / 10, gapBottoniOrizz: gB.map(v => Math.round(v * 10) / 10), gapFigurineOrizz: gF.map(v => Math.round(v * 10) / 10), gapBottoniVert: gBv.map(v => Math.round(v * 10) / 10), gapFigurineVert: gFv.map(v => Math.round(v * 10) / 10) };
  });
  const dd = await page.evaluate(D, true); const sg = sintesiGap(dd);
  const hh = dd.gaps.filter(x => x.k === 'h' && x.g >= 0).map(x => x.g);
  R.d21 = { premuto: ok, griglia: m, strumento178: { medH_carte: sg.medH, nH_carte: sg.nH, medH_tutte: mediana(hh), nH_tutte: hh.length }, nSotto10: dd.nSotto10, minFs: dd.minFs, foto: await shot(page, 'd21-tel-creazione') };
  /* foto ravvicinata della griglia */
  try { const lab = page.locator('label', { hasText: 'Aspetto calciatore' }).first(); const bx = await lab.boundingBox(); if (bx) { const p = path.join(FOTO, 'd21-tel-griglia-avatar.png'); await page.screenshot({ path: p, clip: { x: 0, y: Math.max(0, bx.y - 6), width: 412, height: 210 } }); R.d21.fotoGriglia = path.relative(ROOT, p); } } catch (e) {}
  console.log('D21', JSON.stringify(R.d21).slice(0, 600)); await ctx.close(); }

/* D23 — Presentazione, battito 3, sul telefono: il marchio in basso */
if (quale.includes('d23')) { const { ctx, page } = await apriPagina(b, port, TEL, { save: SAVE }, '?cpmtest=1', errs);
  if (await entraInCarriera(page, errs)) {
    const r = await page.evaluate(() => window.__CPM_CAREER.apriPresentazione(3)); await sleep(2500); await congela(page);
    const m = await page.evaluate(() => { const out = [];
      for (const e of document.querySelectorAll('span')) { const t = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (!/^Krward\s*Elite$/.test(t)) continue; const r = e.getBoundingClientRect(); if (r.width < 1) continue;
        const kids = []; for (const n of e.childNodes) { let rr; if (n.nodeType === 3) { if (!n.textContent.trim()) continue; const g = document.createRange(); g.selectNodeContents(n); rr = g.getBoundingClientRect(); } else rr = n.getBoundingClientRect(); kids.push({ t: n.nodeType === 3 ? n.textContent.trim() : (n.textContent.trim() || '◯'), l: Math.round(rr.left * 10) / 10, r: Math.round(rr.right * 10) / 10 }); }
        const spazi = []; for (let i = 0; i + 1 < kids.length; i++) spazi.push(Math.round((kids[i + 1].l - kids[i].r) * 10) / 10);
        out.push({ y: Math.round(r.top), x: Math.round(r.left), w: Math.round(r.width), fs: getComputedStyle(e).fontSize, gap: getComputedStyle(e).gap, display: getComputedStyle(e).display, pezzi: kids, spazi }); }
      return out; });
    R.d23 = { apri: r, marchi: m, foto: await shot(page, 'd23-tel-presentazione-3') };
    try { const best = m.sort((a, b) => b.y - a.y)[0]; if (best) { const p = path.join(FOTO, 'd23-tel-marchio-zoom.png'); await page.screenshot({ path: p, clip: { x: Math.max(0, best.x - 10), y: Math.max(0, best.y - 8), width: Math.min(400, best.w + 40), height: 34 }, scale: 'device' }); R.d23.fotoZoom = path.relative(ROOT, p); } } catch (e) {}
    /* confronto col marchio di testata (home) */
    await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(600);
    R.d23.testata = await page.evaluate(() => { const o = []; for (const e of document.querySelectorAll('*')) { if (e.children.length > 4) continue; const t = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (!/^K.?rward ?Elite$/i.test(t)) continue; const r = e.getBoundingClientRect(); if (r.width < 1) continue; o.push({ t, y: Math.round(r.top), w: Math.round(r.width), tag: e.tagName }); } return o.slice(0, 6); });
  } else R.d23 = { errore: 'carriera non aperta' };
  console.log('D23', JSON.stringify(R.d23).slice(0, 900)); await ctx.close(); }

/* D20 — testo sotto i 10 px: censimento nSotto10 su sei schermate del telefono (stesso rilevatore del 178) */
if (quale.includes('d20')) { const { ctx, page } = await apriPagina(b, port, TEL, { save: SAVE }, '?cpmtest=1', errs); R.d20 = { schermate: {} };
  if (await entraInCarriera(page, errs)) {
    for (const [id, tab] of [['home', 'dashboard'], ['stagione-classifica', 'standings'], ['club', 'club'], ['carriera-profilo', 'profile'], ['agente', 'agente'], ['ufficio', 'ufficio']]) {
      await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); await sleep(500); await ferma(page); await congela(page);
      const dd = await page.evaluate(() => { const o = { piccoli: [] }; const W = document.createTreeWalker(document.getElementById('root'), NodeFilter.SHOW_TEXT); let n, tot = 0, s10 = 0, s11 = 0, mn = 99;
        while ((n = W.nextNode())) { const t = n.textContent.trim(); if (t.length < 2) continue; const p = n.parentElement; const c = getComputedStyle(p); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.1) continue; const g = document.createRange(); g.selectNodeContents(n); const r = g.getBoundingClientRect(); if (r.width < 6 || r.height < 6) continue;
          const fs = parseFloat(c.fontSize); tot++; if (fs < mn) mn = fs; if (fs < 10) { s10++; if (o.piccoli.length < 8) o.piccoli.push(fs + 'px «' + t.slice(0, 30) + '»'); } else if (fs < 11.5) s11++; }
        o.foglie = tot; o.sotto10 = s10; o.da10a11 = s11; o.min = mn; return o; });
      const d178 = await page.evaluate(D, true); dd.nSotto10_strumento178 = d178.nSotto10; dd.minFs_178 = d178.minFs;
      R.d20.schermate[id] = dd; if (id === 'home' || id === 'agente') dd.foto = await shot(page, 'd20-tel-' + id);
      console.log('D20', id, JSON.stringify(dd).slice(0, 400)); }
    R.d20.FS = await page.evaluate(() => typeof FS !== 'undefined' ? FS : null).catch(() => null);
  }
  await ctx.close(); }

/* D13 — PC 1366 e tablet orizzontale: banner «Vivi la Settimana» e strisce sopra lo scuro del pop-up */
if (quale.includes('d13')) { R.d13 = {};
  for (const f of [PC, TABO, { k: 'pc1180', w: 1180, h: 820, touch: true }]) { const { ctx, page } = await apriPagina(b, port, f, { save: SAVE }, '?cpmtest=1', errs); const res = {};
    if (await entraInCarriera(page, errs)) {
      await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(600);
      /* scorrere un poco come nel rapporto 177 */
      await page.evaluate(() => { let best = null; for (const e of document.querySelectorAll('*')) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 100) { if (!best || e.scrollHeight > best.scrollHeight) best = e; } } (best || document.scrollingElement).scrollTop = 260; window.scrollTo(0, 260); }); await sleep(500);
      for (const [nome, fn] of [['impulso', () => window.__CPM_CAREER.apriSettimana('impulso')], ['vissuta', () => window.__CPM_CAREER.apriSettimana('vissuta')]]) {
        const r = await page.evaluate(fn); await sleep(1200); await congela(page);
        const m = await page.evaluate(() => { const W = innerWidth, H = innerHeight; const fx = [];
          for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'sticky') continue; if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
            fx.push({ e, z: parseInt(c.zIndex) || 0, r, area: r.width * r.height, bg: c.backgroundColor, t: (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) }); }
          const ov = fx.filter(x => x.area > 0.6 * W * H).sort((a, b) => b.z - a.z)[0]; if (!ov) return { overlay: null };
          /* chi sta SOPRA lo scuro: elementi visibili il cui punto centrale, campionato con elementFromPoint, NON appartiene all'overlay */
          const sopra = []; for (let y = 4; y < H; y += 12) for (let x = 4; x < W; x += 24) { const el = document.elementFromPoint(x, y); if (!el || ov.e.contains(el)) continue; let k = el; while (k && k !== document.body && getComputedStyle(k).position !== 'fixed' && getComputedStyle(k).position !== 'sticky') k = k.parentElement; const key = k && k !== document.body ? k : el;
            const t = (key.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50); const rr = key.getBoundingClientRect(); const s = sopra.find(q => q.key === key); if (s) s.punti++; else sopra.push({ key, t, punti: 1, rect: [Math.round(rr.left), Math.round(rr.top), Math.round(rr.width), Math.round(rr.height)], z: getComputedStyle(key).zIndex, pos: getComputedStyle(key).position }); }
          return { overlay: { z: ov.z, bg: ov.bg, t: ov.t }, sopra: sopra.map(({ key, ...q }) => q).sort((a, b) => b.punti - a.punti).slice(0, 8), puntiTotali: Math.ceil(H / 12) * Math.ceil(W / 24) }; });
        res[nome] = { apri: r, ...m, foto: await shot(page, `d13-${f.k}-${nome}`) };
        console.log('D13', f.k, nome, JSON.stringify(res[nome]).slice(0, 700));
        await page.evaluate(() => window.__CPM_CAREER.dismiss()); await sleep(500);
        await page.evaluate(() => { const st = document.getElementById('__c178'); if (st) st.remove(); });
      }
    } else res.errore = 'carriera non aperta';
    R.d13[f.k] = res; await ctx.close(); }
}
R.errori = errs; fs.writeFileSync(OUT, JSON.stringify(R, null, 1)); console.log('scritto', OUT, 'errori:', errs.slice(0, 5));
await b.close(); srv.close();
