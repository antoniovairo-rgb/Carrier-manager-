/* PO-258: punizione del motore a ~18 m, «Bordata potente», esito PARATA: dump dei fotogrammi __CPM_GK229 nel formato di gk-miss-229
   (giudizio con CPM_OFFLINE). Uso: DIR=<cartella tests/visual> PREF=<prefisso dump> N=<scene> node fk258.mjs */
import fs from 'node:fs';
const D = process.env.DIR || new URL('../../../tests/visual/', import.meta.url).pathname;
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(D + 'lib/harness.mjs');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const N = +(process.env.N || 4), PREF = process.env.PREF, OPT = process.env.OPT || 'fk_power', GLB = process.env.GLB !== '0';
const XS = (process.env.XS || '83,84,82,85').split(',').map(Number);
let fatte = 0;
for (let t = 0; t < N * 3 && fatte < N; t++) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([glb, ex]) => { window.__CPM_GLB = glb; window.__CPM_PRESENT = 1; window.__CPM_REC = true; window.__CPM_CINE = 1; for (const k of ex) window[k] = 1; }, [GLB, (process.env.EXTRA || '').split(',').filter(Boolean)]);
  try {
    await openMatch(page, port, { name: 'Fk258 ' + t }); await sleep(800);
    if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
    const x = XS[t % XS.length];
    const gi = await page.evaluate(([x, t]) => { const s = scenaDalMotorePiazzato({ tipo: 'punizione', x, y: 50 + ((t % 3) - 1) * 4, cast: { portiere: { nome: 'Ted Tucker' } } }, { stats: {} }, 100 + t); if (!s) return null; SITUATIONS.push(s); return SITUATIONS.length - 1; }, [x, t]);
    if (gi == null) { await page.close(); continue; }
    await page.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi); await sleep(1200);
    await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (M && M.risolviEroe && M.risolviEroe.dado) M.risolviEroe.dado = () => false; if (!window.__rs258) { window.__rs258 = 1; const R = window.resolveSetPieceShot; window.resolveSetPieceShot = function () { const r = R.apply(this, arguments); if (r && r.outKind !== 'goal') { r.outKind = 'saved'; r.ok = false; } return r; }; } window.__CPM_FROZEN = false; window.__CPM_GK229 = []; window.__CPM_GK799 = []; window.__CPM_REC229 = 1; });
    const lab = await page.evaluate(id => { window.__CPM_SETPIECE(id); return (document.body.innerText.match(/Punizione — [^\n]*/) || [''])[0]; }, OPT);
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) { await sleep(400);
      const st = await page.evaluate(() => { const R = window.__CPM_GK229 || []; const L = R[R.length - 1]; let iE = -1, armed = false; for (let i = 0; i < R.length; i++) { if (R[i].at) armed = true; if (armed && !R[i].at) { iE = i; break; } } return { ck: L ? L.ck : 0, ckE: iE >= 0 ? R[iE].ck : null }; });
      if (st.ckE != null && st.ck - st.ckE > 2.5) break; }
    const o = await page.evaluate(() => ({ R: (window.__CPM_GK229 || []).slice(), T: (window.__CPM_GK799 || []).map(g => g.tag), kind: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKind : null, var: (window.__CPM_STATE && window.__CPM_STATE().hlVariant) || null }));
    await page.close();
    console.log(`scena ${t} x${x} gi${gi} esito ${o.kind} variante ${o.var} fotogrammi ${o.R.length} ${lab}`);
    if (o.kind !== 'saved') continue;
    fatte++; fs.writeFileSync(`${PREF}-punizione-fk${fatte}-saved.json`, JSON.stringify({ label: 'Punizione — ' + OPT + ' x' + x, T: o.T, R: o.R, tardi: 0, cam: [] }));
  } catch (e) { console.log('errore', String(e.message || e).slice(0, 160)); try { await page.close(); } catch (_e) {} }
}
await b.close(); srv.close(); console.log('salvate', fatte);
