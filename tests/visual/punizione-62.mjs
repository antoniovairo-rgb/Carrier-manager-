#!/usr/bin/env node
/* [7.999.62 guardiano — taccuino PO #13 «Punizione — Bordata potente»: salto del pallone, eroe dentro la porta, palla che
   scompare] Sul gol da punizione festa, onda e affermazione del pallone in rete partivano all'istante della scelta: il pallone
   veniva scritto in rete prima del calcio e la rincorsa del piazzato portava l'eroe dietro di lui, cioe' dentro la porta.
   VERDE → su un gol da punizione (GLB-ON, percorso vero handleSetPiece) l'eroe resta fuori dalla porta (x < 46), il pallone
           non supera x 40 prima del calcio e la clip di gioia non parte prima che il pallone sia in rete.
   ROSSO → con __CPM_NO_FK62 almeno una delle tre condizioni cade (il guardiano deve accorgersene).
   Uso: node punizione-62.mjs   ·   CPM_ROSSO=1 per il solo braccio rosso. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function braccio(rosso) {
  const page = await b.newPage({ viewport: { width: 412, height: 700 } }); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_TIRO34_REC = 1; window.__CPM_GLB = true; window.__CPM_REC = 1; if (r) window.__CPM_NO_FK62 = 1; }, rosso);
  await openMatch(page, port, { skipLoadAll: true, name: 'Punizione62' + (rosso ? 'R' : 'V') }); await sleep(1500);
  await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  let esito = null, W = null, fk = 0;
  for (let k = 0; k < 8 && esito !== 'goal'; k++) {
    await page.evaluate(() => { window.__CPM_TIRO34 = null; window.__CPM_SP3 = []; window.__CPM_FORCE_SIT(13, true); window.__CPM_FROZEN = false; });
    await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
    await sleep(700);
    await page.evaluate(() => window.__CPM_SETPIECE('fk_power'));
    await sleep(6500);
    const r = await page.evaluate(() => ({ e: ((window.__CPM_SP3 || []).slice(-1)[0] || {}).dopo || null, W: window.__CPM_TIRO34 || null, fk: window.__CPM_FK62 | 0 }));
    esito = r.e; W = r.W; fk = r.fk;
  }
  await page.close();
  if (esito !== 'goal' || !W || !W.f || !W.f.length) return { ok: null, why: `nessun gol osservato (ultimo esito ${esito})` };
  const F = W.f; let heroMax = -99, preKick = -99, liftPrima = false, inRete = false;
  for (const f of F) {
    if (f.hx > heroMax) heroMax = f.hx;
    const bx = f.pb ? f.pb[0] : null;
    if (bx != null && bx > 48.3) inRete = true;
    if (f.aT != null && +f.aT < 0 && bx != null && bx > preKick) preKick = bx;
    if (f.g === 'lift' && !inRete) liftPrima = true;
  }
  return { ok: true, fk, heroMax: +heroMax.toFixed(1), preKick: +preKick.toFixed(1), liftPrima, n: F.length };
}
let ok = true;
if (!process.env.CPM_ROSSO) {
  const v = await braccio(false);
  console.log(`VERDE: ${v.ok === null ? v.why : `eroe x max ${v.heroMax} · pallone prima del calcio x max ${v.preKick} · gioia prima della rete ${v.liftPrima} · festa alla rete ${v.fk} · ${v.n} fotogrammi`}`);
  if (v.ok === null || v.heroMax >= 46 || v.preKick > 40 || v.liftPrima || !(v.fk >= 1)) { ok = false; console.log('✗ verde fallito'); }
}
const r = await braccio(true);
console.log(`ROSSO (__CPM_NO_FK62): ${r.ok === null ? r.why : `eroe x max ${r.heroMax} · pallone prima del calcio x max ${r.preKick} · gioia prima della rete ${r.liftPrima}`}`);
if (r.ok === null || !(r.heroMax >= 46 || r.preKick > 40 || r.liftPrima)) { ok = false; console.log('✗ il rosso non mostra il difetto: il guardiano sarebbe cieco'); }
await b.close(); srv.close();
console.log(ok ? '✅ punizione-62 verde (e il rosso si vede)' : '❌ punizione-62 ROSSO'); process.exit(ok ? 0 : 1);
