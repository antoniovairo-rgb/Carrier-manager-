#!/usr/bin/env node
/* [7.999.34 guardiano — collaudo PO «il tiro e' scoordinato, non viene caricato / preparato prima del calcio»]
   Per N scene di tiro dell'eroe (pagina nuova ciascuna, corpo CGTrader) legge il testimone __CPM_TIRO34 (fotogramma per fotogramma:
   clip montata, tempo e peso del gesto, distanza pallone-piedi, velocita' dell'eroe, scivolamento del piede a terra) e misura:
   - caricamento: tempo fra il montaggio del gesto e la partenza del pallone;
   - scivolamento: mediana della velocita' del piede appoggiato mentre il gesto e' pieno (un piede a terra deve stare fermo);
   - accompagnamento: quanto resta pieno il gesto dopo la partenza del pallone;
   - contatto: distanza minima fra il piede che calcia e il pallone entro 0,1 s dalla partenza.
   Rosso: CPM_RED=1 → __CPM_NO_TIRO34 → torna il `kick` da fermo (0,46 s) → FALLISCE. CPM_CASI=gi:azione[:L|R] (piede forzato). */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const CASI = (process.env.CPM_CASI || '0:0,2:0,12:0,0:0:L').split(',').map(x => x.split(':'));
const RED = process.env.CPM_RED === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (const [gs, as, piede] of CASI) {
  const gi = +gs, ai = +as;
  const page = await b.newPage({ viewport: { width: 380, height: 300 } }); await installCdnRoutes(page);
  await page.addInitScript(([r, p]) => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TIRO34_REC = 1; if (r) window.__CPM_NO_TIRO34 = 1; if (p) window.__CPM_FORCE_PIEDE31 = p; if (window.name === 'x') {} }, [RED, piede || null]);
  if (process.env.CPM_NOPASSO || RED) await page.addInitScript(() => { window.__CPM_NO_PASSO37 = 1; });
  await openMatch(page, port, { skipLoadAll: true, name: 'Tiro34' }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, { timeout: 60000 }).catch(() => {});
  await page.evaluate(g => { window.__CPM_TIRO34 = null; window.__CPM_FORCE_SIT(g, false); window.__CPM_FROZEN = false; }, gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', { timeout: 30000 }).catch(() => {});
  await sleep(800);
  await page.evaluate(a => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(a); }, ai);
  let n = -1; for (let i = 0; i < 60; i++) { await sleep(600); const m = await page.evaluate(() => (window.__CPM_TIRO34 && window.__CPM_TIRO34.f.length) || 0); if (m > 20 && m === n) break; n = m; }
  const W = await page.evaluate(() => window.__CPM_TIRO34 || null); await page.close();
  if (process.env.CPM_DUMP && W) fs.writeFileSync(process.env.CPM_DUMP + '-gi' + gi + (piede || '') + '.json', JSON.stringify(W));
  const tag = 'gi' + gi + (piede ? '/' + piede : '');
  if (!W || W.f.length < 10) { out.push({ tag, err: 'testimone vuoto' }); console.log(JSON.stringify(out[out.length - 1])); continue; }
  const F = W.f, im = F.findIndex(x => x.g === 'kick'), ia = F.findIndex(x => x.arc === 1 && x.aT >= 0);
  if (im < 0 || ia < 0) { out.push({ tag, err: 'gesto o pallone assenti', im, ia }); console.log(JSON.stringify(out[out.length - 1])); continue; }
  const tA = F[ia].t, pieno = F.slice(im).filter(x => x.g === 'kick' && x.w >= 0.9);
  const sl = pieno.map(x => x.sl).filter(x => x != null).sort((a, b) => a - b);
  let fine = F.findIndex((x, i) => i > ia && (x.g !== 'kick' || x.w < 0.5)); if (fine < 0) fine = F.length - 1;
  /* contatto: il pallone al fotogramma j contro il piede che calcia al fotogramma j-1 (l'aggancio usa la posa del fotogramma prima:
     a pochi fotogrammi al secondo il piede, a 15-19 m/s, in un fotogramma e' gia' altrove) — minimo entro 0,1 s dalla partenza */
  const PIEDE = { 'kick': 'pL', 'kick~m': 'pR', 'mx-strike-foward-jog': 'pR', 'mx-strike-foward-jog~m': 'pL' }[F[im].cn] || 'pR';
  const vicino = []; for (let j = Math.max(1, im); j < F.length; j++) { if (Math.abs(F[j].t - tA) > 0.1) continue; const f = F[j - 1][PIEDE], bb = F[j].pb; if (f && bb) vicino.push(+Math.hypot(bb[0] - f[0], bb[1] - f[1], bb[2] - f[2]).toFixed(3)); }
  /* [7.999.37] gambe a inizio scena: con l'eroe quasi fermo il passo della corsa (cadenza x velocita' naturale) non corre al massimo */
  const avvio = F.slice(0, im).filter(x => x.v < 1.5 && x.rts != null && x.v0 != null && x.rw > 0.3).map(x => x.rts * x.v0);
  const r = { tag, passoAvvio: avvio.length ? +Math.max(...avvio).toFixed(2) : null, clip: F[im].cn, piede: W.s34 ? W.s34.piede : null, fit: W.s34 ? +W.s34.fit.toFixed(2) : null,
    caricamento: +(tA - F[im].t).toFixed(2), scivolamento: sl.length ? sl[Math.floor(sl.length / 2)] : null, campioniAppoggio: sl.length,
    accompagnamento: +(F[fine].t - tA).toFixed(2), contatto: vicino.length ? Math.min(...vicino) : null };
  out.push(r); console.log(JSON.stringify(r));
}
await b.close(); srv.close();
/* GIUDIZIO (misure 27/09 — prima: kick da fermo, accompagnamento 0,06-0,08 s, piede d'appoggio che scivola a 5-8 u/s mentre
   l'eroe corre sotto una posa da fermo; dopo: clip in corsa, accompagnamento 0,5-0,8 s, scivolamento ~1 u/s). */
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
const buone = out.filter(r => !r.err);
ok(buone.length >= 3, `scene di tiro misurate: ${buone.length}/${out.length}`);
for (const r of buone) {
  ok(r.caricamento >= 0.25, `${r.tag}: il tiro si carica prima del calcio (${r.caricamento} s)`);
  ok(r.accompagnamento >= 0.4, `${r.tag}: accompagnamento dopo il calcio (${r.accompagnamento} s)`);
  ok(r.scivolamento == null || r.scivolamento <= 2.5, `${r.tag}: il piede d'appoggio non scivola (${r.scivolamento} u/s su ${r.campioniAppoggio} campioni)`);
  ok(r.contatto != null && r.contatto <= 0.7, `${r.tag}: il piede che calcia arriva al pallone (${r.contatto} u)`);
  ok(r.passoAvvio == null || r.passoAvvio <= 4, `${r.tag}: a inizio scena le gambe non corrono al massimo (passo ${r.passoAvvio} u/s con l'eroe quasi fermo)`);
  if (/\/L$/.test(r.tag) && !RED) ok(r.piede === 'L' && /~m$/.test(r.clip || ''), `${r.tag}: il mancino calcia col sinistro (${r.clip})`);
}
if (err.length) { console.log('\nTIRO CARICATO: FALLITO (' + err.length + ')' + (RED ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nTIRO CARICATO: PASS'); process.exit(0);
