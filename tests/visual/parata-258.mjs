#!/usr/bin/env node
/* [giro 40 — PO-258] GUARDIANO «LA PARATA SI FA CON LE MANI»: punizione «Bordata potente» (fk_power) parata, codice 111 del taccuino
   PO 7.999.169 S.13 W.21 43' («portiere fuori tempo»).
   Origine: sonda del giro 27 (docs/sviluppo/dati-giro27/sonda-punizione-258.mjs) — scena di punizione costruita dal motore
   (scenaDalMotorePiazzato, x 82-85, portiere «Ted Tucker»), pulsante di stile fk_power, esito forzato a parata avvolgendo
   resolveSetPieceShot, GLB acceso, __CPM_PRESENT=1, pagina nuova per scena. Fotogrammi dal testimone __CPM_GK229 (tempo di scena).
   COSA SI E' MISURATO: il portiere uscito a x 41 arrivava sul punto giusto in tempo, ma l'arco della parata finiva 2-4u DIETRO di lui
   (x 42,9-44,9): il pallone gli passava attraverso con la distesa incompleta e la respinta partiva da dietro la schiena. ⚠️ Il criterio
   di gk-miss-229 applicato a queste parate prendeva come «passaggio dal portiere» il ritorno a terra della respinta e diceva «disteso
   0,55-0,81 s prima»: misura sbagliata (minimo di distanza sul rimbalzo), non giudica qui.
   VERDETTO per scena (fotogramma di fine arco = ultimo con l'arco vivo + il primo dopo):
     ✗ «dietro»   il pallone durante l'arco supera il piano del portiere di oltre 1,5u (gli passa attraverso);
     ✗ «lontano»  a fine arco il pallone e' a oltre 1,6u (in z) dal portiere;
     ✗ «corto»    a fine arco la distesa e' sotto l'85% del tragitto (solo tuffo; il riflesso gk_block non trasla).
   VERDE: 0 scene sbagliate su almeno 3 giudicate. ROSSO (CPM_ROSSO=1 → __CPM_NO_PARATA258): almeno meta' «dietro».
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node parata-258.mjs  · CPM_N258 (4) · --verbose */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N258 || 4), ROSSO = process.env.CPM_ROSSO === '1', VERB = process.argv.includes('--verbose');
const XS = [83, 84, 82, 85];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const giud = [];
for (let t = 0; t < N * 3 && giud.length < N; t++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_CINE = 1; if (r) window.__CPM_NO_PARATA258 = 1; }, ROSSO);
  try {
    await openMatch(page, port, { name: 'Fk258 ' + t }); await sleep(800);
    await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    const x = XS[t % XS.length];
    const gi = await page.evaluate(([x, t]) => { const s = scenaDalMotorePiazzato({ tipo: 'punizione', x, y: 50 + ((t % 3) - 1) * 4, cast: { portiere: { nome: 'Ted Tucker' } } }, { stats: {} }, 100 + t); if (!s) return null; SITUATIONS.push(s); return SITUATIONS.length - 1; }, [x, t]);
    if (gi == null) { await page.close(); continue; }
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(1200);
    await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (M && M.risolviEroe && M.risolviEroe.dado) M.risolviEroe.dado = () => false; if (!window.__rs258) { window.__rs258 = 1; const R = window.resolveSetPieceShot; window.resolveSetPieceShot = function () { const r = R.apply(this, arguments); if (r && r.outKind !== 'goal') { r.outKind = 'saved'; r.ok = false; } return r; }; } window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_GK799 = []; window.__CPM_REC229 = 1; });
    await page.evaluate(() => window.__CPM_SETPIECE('fk_power'));
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) { await sleep(400);
      const st = await page.evaluate(() => { const R = window.__CPM_GK229 || []; const L = R[R.length - 1]; let iE = -1, armed = false; for (let i = 0; i < R.length; i++) { if (R[i].at) armed = true; if (armed && !R[i].at) { iE = i; break; } } return { ck: L ? L.ck : 0, ckE: iE >= 0 ? R[iE].ck : null }; });
      if (st.ckE != null && st.ck - st.ckE > 1.5) break; }
    const o = await page.evaluate(() => ({ R: (window.__CPM_GK229 || []).slice(), kind: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind : null, w: (window.__CPM_PARATA258 || []).slice() }));
    await page.close();
    if (o.kind !== 'saved') { console.log(`  scena ${t}: esito ${o.kind}, scartata`); continue; }
    const R = o.R, iK = R.findIndex(f => f.at && f.aT >= 0); let iE = R.findIndex((f, i) => i > iK && !f.at);
    if (iK < 0 || iE < 0) { console.log(`  scena ${t}: arco non campionato`); continue; }
    const k = R[iK], e = R[iE], z0 = k.gz, tz = k.tz, op = R[iE].op;
    const xmax = Math.max(...R.slice(iK, iE + 1).map(f => f.bx)), dietro = +(xmax - k.gx).toFixed(2);
    const dz = +Math.abs(e.bz - e.gz).toFixed(2), est = Math.abs(tz - z0) > 0.3 ? +(Math.abs(e.gz - z0) / Math.abs(tz - z0)).toFixed(2) : 1;
    const v = []; if (dietro > 1.5) v.push(`dietro (pallone ${dietro}u oltre il portiere)`); if (dz > 1.6) v.push(`lontano (${dz}u dal portiere a fine arco)`); if (op === 'gk_dive' && est < 0.85) v.push(`corto (distesa ${Math.round(est * 100)}%)`);
    giud.push({ t, v, dietro }); console.log(`  scena ${t} x${x} ${op}: portiere x ${k.gx} · pallone fino a x ${xmax.toFixed(2)} (${dietro >= 0 ? '+' : ''}${dietro}) · a fine arco z pallone ${e.bz} portiere ${e.gz} (${dz}u) · distesa ${Math.round(est * 100)}% · ${v.length ? '✗ ' + v.join(', ') : 'ok'}${VERB ? ' · ' + JSON.stringify(o.w) : ''}`);
    if (errs.length) console.log('    pageerror', errs.slice(0, 2));
  } catch (e) { console.log('  errore', String(e.message || e).slice(0, 160)); try { await page.close(); } catch (_e) {} }
}
await b.close(); srv.close();
const bad = giud.filter(g => g.v.length).length, dietro = giud.filter(g => g.dietro > 1.5).length;
console.log(`parate giudicate ${giud.length} · sbagliate ${bad} · pallone dietro il portiere ${dietro}`);
if (giud.length < 3) { console.log('❌ sonda cieca: meno di 3 parate giudicate'); process.exit(2); }
if (ROSSO) { const ok = dietro >= Math.ceil(giud.length / 2); console.log(ok ? `✅ ROSSO come atteso (__CPM_NO_PARATA258): ${dietro}/${giud.length} col pallone dietro il portiere` : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
console.log(bad ? `❌ FAIL parata-258: ${bad}/${giud.length}` : `✅ PASS parata-258 (${giud.length}/${giud.length} parate con il pallone sulle mani)`); process.exit(bad ? 1 : 0);
