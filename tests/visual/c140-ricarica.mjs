#!/usr/bin/env node
/* [giro 140 · PO-338 D17] Lo stato ricaricato e' identico allo stato vivo? Pagina A: carriera di prova (S12 W11) fatta avanzare con
   step() fino a C140_FINO (default 39) → fotografia dello stato vivo + del salvataggio. Pagina B: stesso salvataggio caricato da zero
   → fotografia dello stato dopo il montaggio. Differenze per percorso (cup, playedMd, teammates in evidenza). Non tocca src/. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, apriPagina, entraInCarriera, sleep, SAVE } from './c178-graf-lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname; const TEL = { k: 'tel', w: 412, h: 915, touch: true };
const FINO = +(process.env.C140_FINO || 39);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = []; const R = { passi: [] };
const diff = (a, c, p = '', out = []) => { if (out.length > 60) return out;
  if (a === c) return out; const ta = a === null ? 'null' : typeof a, tc = c === null ? 'null' : typeof c;
  if (ta !== 'object' || tc !== 'object') { out.push({ p: p || '(radice)', vivo: JSON.stringify(a)?.slice(0, 80), ricaricato: JSON.stringify(c)?.slice(0, 80) }); return out; }
  if (Array.isArray(a) !== Array.isArray(c)) { out.push({ p, vivo: 'tipo ' + (Array.isArray(a) ? 'array' : 'oggetto'), ricaricato: 'tipo ' + (Array.isArray(c) ? 'array' : 'oggetto') }); return out; }
  const ks = new Set([...Object.keys(a), ...Object.keys(c)]); for (const k of ks) diff(a[k], c[k], p ? p + '.' + k : k, out); return out; };
/* A */
const A = await apriPagina(b, port, TEL, { save: SAVE }, '?cpmtest=1', errs);
let vivo = null, salvato = null;
if (await entraInCarriera(A.page, errs)) {
  await A.page.evaluate(() => { window.__CPM_SIM_NAT = 1; });
  for (let i = 0; i < 120; i++) { const st = await A.page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} const r = window.__CPM_CAREER.step(); const g = window.__CPM_CAREER.get(); return { r, w: g.week, s: g.season, sc: g.screen }; });
    R.passi.push(st.r); await sleep(350); if (st.w >= FINO || /seasonEnd|error|blocked/.test(String(st.r))) { R.fermo = st; break; } }
  await sleep(1800);
  vivo = await A.page.evaluate(() => window.__CPM_CAREER.snapshot());
  salvato = await A.page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cpm-v3')); } catch (e) { return null; } });
}
await A.ctx.close();
/* B */
let ricaricato = null;
if (salvato && salvato.player) { const B = await apriPagina(b, port, TEL, { save: salvato }, '?cpmtest=1', errs);
  if (await entraInCarriera(B.page, errs)) { await sleep(1500); ricaricato = await B.page.evaluate(() => window.__CPM_CAREER.snapshot()); } await B.ctx.close(); }
const ign = /^(log|lastSaved|savedAt|notif|_)/;
if (vivo && salvato && ricaricato) {
  R.vivoVsSalvato = diff(vivo, salvato.player).filter(d => !ign.test(d.p));
  R.vivoVsRicaricato = diff(vivo, ricaricato).filter(d => !ign.test(d.p));
  R.evidenza = { vivo: { week: vivo.week, cupClub: vivo.cup && vivo.cup.club ? (vivo.cup.club.n || vivo.cup.club) : null, cupActive: vivo.cup && vivo.cup.active, playedMd: vivo.playedMd },
    ricaricato: { week: ricaricato.week, cupClub: ricaricato.cup && ricaricato.cup.club ? (ricaricato.cup.club.n || ricaricato.cup.club) : null, cupActive: ricaricato.cup && ricaricato.cup.active, playedMd: ricaricato.playedMd } };
} else R.errore = 'manca una delle tre fotografie';
R.errori = errs; fs.writeFileSync(path.join(ROOT, 'docs/collaudo-grafico/140/misure-ricarica.json'), JSON.stringify(R, null, 1));
console.log('fermo', JSON.stringify(R.fermo), 'passi', R.passi.length); console.log('vivo≠salvato', R.vivoVsSalvato && R.vivoVsSalvato.length, JSON.stringify((R.vivoVsSalvato || []).slice(0, 8)));
console.log('vivo≠ricaricato', R.vivoVsRicaricato && R.vivoVsRicaricato.length, JSON.stringify((R.vivoVsRicaricato || []).slice(0, 25))); console.log('evidenza', JSON.stringify(R.evidenza)); console.log('errori', errs.slice(0, 4));
await b.close(); srv.close();
