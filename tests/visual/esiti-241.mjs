#!/usr/bin/env node
/* [giro 41 PO-218/PO-250 «esiti bugiardi»] GUARDIANO verde/rosso (rosso: __CPM_NO_ESITI241, che spegne le quattro correzioni del giro).
   Parte A — ENUMERAZIONE (nessuna partita):
     A1 ogni azione «fallo cercato» riuscita: il riquadro e' della famiglia FALLO (era «Palla d'oro!»/«OCCASIONE CREATA!»);
     A2 ogni azione di DRIBBLING (non tiro, non passaggio) fermata con chiave «intercept»: lessico del dribbling, non «Passaggio intercettato»;
     A3 motore vero: il dribbling fermato senza difensore nel cast e' un contrasto, non un «tiro murato».
   Parte B — SCENE FORZATE (pagina nuova per scena, GLB acceso, esito NATURALE), giudicate col classificatore del censimento
     (lib/esiti-241.mjs): gi14/0 «Cross basso teso» (punizione «palla in area», PO-250) · gi16/0 «Cross teso» · gi150/0 «Dribbling
     provocatorio — il fallo c'e'!» riusciti. Riquadro, motore e 3D (testimone __CPM_V241) devono dire la stessa cosa.
   MISURATO (censimento, prima della correzione): 3 contraddizioni su 8 esecuzioni nominate; dopo: 0 su 8.
   VERDE: A1 0 su >=2, A2 0 su >=5, A3 0, B 0 contraddizioni su 3 scene. ROSSO: A1, A2, A3 tutte >=1 e B >=2.
   Uso: node esiti-241.mjs */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
import { contraddizioni } from './lib/esiti-241.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const esito = {};
const SCENE = [[14, 0], [16, 0], [150, 0]];
for (const rosso of [false, true]) {
  const R = {};
  { const page = await b.newPage(); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_GLB = false; if (r) window.__CPM_NO_ESITI241 = 1; }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'Esiti241' });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 300 }));
    await page.waitForFunction(() => typeof creaMotorePossesso === 'function' && typeof hlOverlay === 'function', null, { timeout: 60000 });
    Object.assign(R, await page.evaluate(() => {
      const reShot = /tir|conclus|destr|sinistr|girat|vol[eé]|bomba|stoccat|incroci|piattone|pallonett|rasoterra|a giro/i;
      const rePass = /passagg|imbucat|filtrant|lanci|scaric|verticalizz|apertur|servizi|smista|triangol|uno-due|dai e vai|appoggi/i;
      const reDrib = /dribbl|salt|punt|fint|elastico|tunnel|serpentin|uno contro uno|1v1|rabona|accelera/i;
      const fc = [], dr = new Set(); for (const s of SITUATIONS) { if (s.type === 'def') continue; for (const a of (s.actions || [])) { if (a.falloCercato) fc.push(a.label); if (reDrib.test(a.label) && !reShot.test(a.label) && !rePass.test(a.label) && !/conduc/i.test(a.label)) dr.add(a.label); } }
      let a1 = 0; const a1e = []; for (const l of fc) for (let sd = 0; sd < 4; sd++) { const o = hlOverlay('chance', true, l, 'X', sd, 'win_freekick'); if (o.fam !== 'foul') { a1++; if (a1e.length < 3) a1e.push(l + ' «' + o.text + '»'); break; } }
      let a2 = 0; const a2e = []; for (const l of dr) { const c = _hlOvlCat('intercept', false, l); if (c === 'pass_fail') { a2++; if (a2e.length < 3) a2e.push(l); } }
      const M = creaMotorePossesso({ giocatori: [], eroe: { name: 'EROE', x: 70, y: 50 }, seed: 7 });
      const ev = M.risolviEroe.eventi('intercept', { tipo: 'dribble', variante: '', rew: 'assist', ok: false, cast: {}, outKind: 'dispossessed' }).map(e => e.t);
      return { nfc: fc.length, a1, a1e, ndr: dr.size, a2, a2e, a3: ev.indexOf('tiro') >= 0 ? 1 : 0, a3ev: ev.join('+') };
    }));
    await page.close(); }
  R.b = [];
  for (const [gi, k] of SCENE) {
    const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
    await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_REC = true; window.__CPM_PRESENT = 1; window.__CPM_V241 = {}; if (r) window.__CPM_NO_ESITI241 = 1; }, rosso);
    await openMatch(page, port, { skipLoadAll: true, name: 'Esiti241' });
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 7, policy: 'seeded', tickMs: 300 }));
    await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ() && typeof window.__CPM_FORCE_SIT === 'function', null, { timeout: 90000 }).catch(() => {});
    await page.evaluate(() => window.__CPM_AUTOPLAY(false));
    await page.waitForFunction(() => window.__CPM_GLB_READY === true, null, { timeout: 60000 }).catch(() => {});
    await page.evaluate(g => window.__CPM_FORCE_SIT((g + 61) % SITUATIONS.length, true), gi); await sleep(1500);
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(2500);
    await page.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_V241 = {}; window.__R241 = (window.__CPM_RES218 || []).length; });
    const lab = await page.evaluate(k => { const s = SITUATIONS[window.__CPM_LAST_FORCED_GI]; window.__CPM_RESOLVE(k); return s && s.actions[k] ? s.actions[k].label : null; }, k);
    const tR = Date.now(); let s0 = null;
    while (Date.now() - tR < 40000) { await sleep(400); const s = await page.evaluate(() => (typeof window.__CPM_SCENET === 'number' ? window.__CPM_SCENET : null)).catch(() => null); if (s != null) { if (s0 == null) s0 = s; if (s - s0 >= 4) break; } }
    const r = await page.evaluate(() => { const o = window.__CPM_OUTCOME || {}; const res = (window.__CPM_RES218 || []).slice(window.__R241 || 0).slice(-1)[0] || {}; const W = window.__CPM_V241 || {};
      return { ok: o.ok, outKey: o.outKey || null, outKind: o.outKind || null, overlay: o.overlay || null, text: o.text || null, ev: res.ev || [], v: (W.all || []).slice(-1)[0] || null }; });
    r.label = lab; r.gi = gi; r.contr = contraddizioni(r); R.b.push(r); await page.close();
  }
  esito[rosso ? 'rosso' : 'verde'] = R;
  console.log(`${rosso ? 'ROSSO' : 'VERDE'} A1 fallo cercato ${R.a1}/${R.nfc} · A2 dribbling col lessico del passaggio ${R.a2}/${R.ndr} · A3 motore ${R.a3 ? 'tiro' : 'contrasto'} (${R.a3ev}) · B contraddizioni ${R.b.filter(x => x.contr.length).length}/${R.b.length}`);
  R.b.forEach(x => console.log(`  gi${x.gi} «${x.label}» ${x.outKey}/${x.outKind} «${x.overlay}» «${x.text}»${x.contr.length ? ' ❌ ' + x.contr.join(' | ') : ''}`));
}
await b.close(); srv.close();
const V = esito.verde, Ro = esito.rosso, g = [];
if (!(V.nfc >= 2 && V.a1 === 0)) g.push('verde A1: ' + V.a1 + ' su ' + V.nfc);
if (!(V.ndr >= 5 && V.a2 === 0)) g.push('verde A2: ' + V.a2 + ' su ' + V.ndr);
if (V.a3) g.push('verde A3: il motore registra un tiro (' + V.a3ev + ')');
if (V.b.length < 3 || V.b.some(x => x.contr.length || !x.v)) g.push('verde B: ' + V.b.filter(x => x.contr.length || !x.v).map(x => 'gi' + x.gi + ' ' + (x.contr.join('; ') || '3D non osservato')).join(' · '));
if (!(Ro.a1 >= 1 && Ro.a2 >= 1 && Ro.a3 >= 1)) g.push(`rosso A: il difetto non si vede (A1 ${Ro.a1} · A2 ${Ro.a2} · A3 ${Ro.a3})`);
if (!(Ro.b.filter(x => x.contr.length).length >= 2)) g.push('rosso B: ' + Ro.b.filter(x => x.contr.length).length + ' scene contraddittorie (attese >= 2)');
if (g.length) { console.log('❌ esiti-241'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ esiti-241 verde (riquadro, motore e 3D concordi su chance e fallo cercato) e il rosso si vede');
