#!/usr/bin/env node
/* [7.999.26] GUARDIANO — LA SCENA AEREA PARTE DAL CROSSATORE DICHIARATO DAL BRAIN (collaudo PO: «intenzione di colpo di testa col
   pallone ai piedi dell'eroe; dopo la scelta il pallone si sposta all'impazzata e poi arriva il cross da qualcuno»). Due scene forzate
   con l'origine impostata come la imposta il live (cross dalla fascia su #88 «Volée su cross alzato», angolo su #76 «Corner sul primo
   palo»), percorso d'apertura vero e costruzione accesa. Verde se: (1) mentre si sceglie il pallone sta sul piede del crossatore
   (entro 3 u dall'origine, quota <= 0,5); (2) alla risoluzione un solo volo a parabola (picco >= 3) dal crossatore all'eroe; (3) il
   colpo parte da dove arriva il cross: nessuno spostamento sopra 60 u/s (ogni campione porta il suo tempo: una distanza fra campioni
   senza tempo misura lo strumento — lezione 7.360/7.502). Sull'angolo il battitore sta di fianco alla bandierina: 6 u in scelta. CPM_ROSSO=1 → __CPM_NO_ORIG26:
   il pallone torna sospeso sopra l'eroe mentre si sceglie. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const CASI = [{ gi: 88, k: 'cross', x: 80, y: 86 }, { gi: 76, k: 'angolo', x: 98, y: 97 }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = []; const E = [];
for (const C of CASI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page); page.on('pageerror', e => E.push(e.message));
  await page.addInitScript(r => { window.__CPM_PRESENT = 1; window.__CPM_FORCE_INTRO = 1; window.__CPM_GLB = false; window.__CPM_CINE = 1; if (r) window.__CPM_NO_ORIG26 = 1; }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'CrossOrig' }); await sleep(3000);
  await page.evaluate(c => { _ORIG26 = { sit: SITUATIONS[c.gi], kind: c.k, at: c.k === 'angolo' ? 'corner' : 'wing', x: c.x, y: c.y, hl: 9999, active: true }; }, C);
  await page.evaluate(g => window.__CPM_FORCE_SIT(g, false), C.gi); await page.evaluate(() => { window.__CPM_FROZEN = false; });
  const T = []; let res = false;
  for (let i = 0; i < 60; i++) { const s = await page.evaluate(() => { const s = window.__CPM_STATE(); return { ph: window.__CPM_PHASE && window.__CPM_PHASE(), b: [s.ball.x, s.ball.y, +(s.ball.worldY || 0)], t: performance.now() }; }); T.push(s);
    if (s.ph === 'hl_choose' && !res && T.filter(x => x.ph === 'hl_choose').length >= 6) { res = true; await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(0); }); }
    await sleep(100); }
  await page.close();
  const ch = T.filter(t => t.ph === 'hl_choose'), rs = T.filter(t => t.ph === 'hl_result');
  const dCh = ch.length ? Math.max(...ch.map(t => Math.hypot(t.b[0] - C.x, t.b[1] - C.y))) : 99, yCh = ch.length ? Math.max(...ch.map(t => t.b[2])) : 99;
  const picco = rs.length ? Math.max(...rs.slice(0, 22).map(t => t.b[2])) : 0;
  let salto = 0; for (let i = 1; i < rs.length; i++) { const a = rs[i - 1].b, c = rs[i].b; if (a[0] > 99 || c[0] > 99) continue; const d = Math.hypot(c[0] - a[0], c[1] - a[1]), dt = Math.max(0.05, (rs[i].t - rs[i - 1].t) / 1000); if (d > 12) salto = Math.max(salto, d / dt); }/* teletrasporto misurato prima del rimedio: 18,7-24 u in un campione; un tiro vero fa <= 10 u fra due campioni */
  out.push({ caso: C.k, gi: C.gi, sceltaDistOrigine: +dCh.toFixed(1), sceltaQuota: +yCh.toFixed(2), piccoCross: +picco.toFixed(1), velMaxSalto: +salto.toFixed(0), campioni: [ch.length, rs.length] });
}
await b.close(); srv.close();
console.log(JSON.stringify(out), 'errori pagina', E.length);
const fails = [];
for (const o of out) { if (o.sceltaDistOrigine > (o.caso === 'angolo' ? 6 : 3)) fails.push(`${o.caso}: in scelta pallone a ${o.sceltaDistOrigine} u dal crossatore`); if (o.sceltaQuota > 0.5) fails.push(`${o.caso}: in scelta pallone a quota ${o.sceltaQuota}`);
  if (o.piccoCross < 3) fails.push(`${o.caso}: nessun cross a parabola (picco ${o.piccoCross})`); if (o.velMaxSalto > 60) fails.push(`${o.caso}: salto del pallone a ${o.velMaxSalto} u/s in risoluzione (il cross viaggia a ~22)`); }
if (E.length) fails.push('errori di pagina: ' + E[0]);
if (ROSSO) { const ok = fails.some(f => /in scelta/.test(f)); console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.26 il pallone non parte dal crossatore' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
console.log(fails.length ? '❌ FAIL cross-origine\n  ' + fails.join('\n  ') : '✅ PASS cross-origine'); process.exit(fails.length ? 1 : 0);
