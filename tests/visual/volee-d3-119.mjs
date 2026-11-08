#!/usr/bin/env node
/* [giro 119 PO-323, strumento di misura — non guardiano] SCENA FORZATA EQUIVALENTE al D3 aperto di highlight-95 (giro 117):
   «⚽ Volée di collo potente» → «Grande parata del portiere» ma il pallone non arriva al portiere (minimo 6,8).
   Genera la scena di cross/angolo dal motore (scenaDalMotoreCross) con l'ancora dichiarata in punti diversi (lontana = spostata dal
   rimedio del giro 117 nella finestra x 87-93 / y 38-62; dentro l'area = invariata), sceglie la volée, forza l'esito fallito con
   chiave «saved» (__CPM_FORCE_OUTCOME/__CPM_FORCE_KIND, ganci di collaudo esistenti) e misura il MINIMO portiere↔pallone di tutta la
   scena per fotogramma (__CPM_GKMIN117, solo __CPM_REC), piu' posizioni di eroe/pallone/portiere all'esito.
   Stesse condizioni della sonda highlight-95: GLB spento, __CPM_REC, __CPM_REALWAIT. Pagina nuova per ogni caso (lezione 7.483).
   Uso: node volee-d3-119.mjs · CPM_FLAG=__CPM_NO_G117A (braccio senza rimedio) · CPM_CASI=k1,k2 */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const CASI = [
  { k: 'cross-lontano-48-50', tipo: 'cross', x: 48, y: 50, s0: 1 },
  { k: 'angolo-lontano-48-50', tipo: 'angolo', x: 48, y: 50, s0: 1 },
  { k: 'cross-lontano-60-25', tipo: 'cross', x: 60, y: 25, s0: 30 },
  { k: 'cross-lontano-60-78', tipo: 'cross', x: 60, y: 78, s0: 60 },
  { k: 'angolo-lontano-70-80', tipo: 'angolo', x: 70, y: 80, s0: 90 },
  { k: 'cross-limite-82-50', tipo: 'cross', x: 82, y: 50, s0: 120 },
  { k: 'cross-area-90-54', tipo: 'cross', x: 90, y: 54, s0: 1 },
  { k: 'angolo-area-89-44', tipo: 'angolo', x: 89, y: 44, s0: 200 },
  { k: 'cross-areapiccola-95-50', tipo: 'cross', x: 95, y: 50, s0: 1 },
  { k: 'cross-fondo-96-30', tipo: 'cross', x: 96, y: 30, s0: 1 },
];
const SOLO = (process.env.CPM_CASI || '').split(',').filter(Boolean);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
for (const caso of CASI) { if (SOLO.length && !SOLO.includes(caso.k)) continue;
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([f, g]) => { window.__CPM_GLB = !!g; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; (f || '').split(',').forEach(k => { if (k) window[k] = 1; }); }, [process.env.CPM_FLAG || '', process.env.CPM_GLB === '1']);
  await openMatch(page, port, { skipLoadAll: true, name: 'Volee 119' }); await sleep(1500);
  if (process.env.CPM_GLB === '1') await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  const pr = await page.evaluate(({ caso }) => { const C = { ricevente: { nome: 'Leo SPENCER' }, difensore: { nome: 'Max BAILEY' }, portiere: { nome: 'Ian CARR' }, crossatore: { nome: 'Tom HOWARD' } }, P = { stats: {}, foot: 'R' };
    for (let SEED = caso.s0; SEED < caso.s0 + 600; SEED++) { const s = scenaDalMotoreCross({ tipo: caso.tipo, zona: 'area', x: caso.x, y: caso.y, press: 0.8, liberi: 0, cast: C, origine: { kind: caso.tipo } }, P, SEED); if (!s) continue;
      const k = s.actions.findIndex(a => /Volée di collo/.test(a.label)); if (k < 0) continue;
      SITUATIONS.push(s); return { gi: SITUATIONS.length - 1, k, seed: SEED, sz: s.startZone, hl: (deriveHL(s, s.actions[k]) || {}) }; } return null; }, { caso });
  if (!pr) { out.push({ k: caso.k, err: 'scena non generata' }); console.log(caso.k + ' scena non generata'); await page.close(); continue; }
  const DX = process.env.CPM_GKVICINO != null ? +process.env.CPM_GKVICINO : null;/* portiere USCITO accanto all'eroe come nel flusso vero (brain scenaMuovi): x eroe + DX, y eroe + 1,4 */
  if (DX != null) pr.gkPos = await page.evaluate(({ sz, DX }) => { const mp = (window.__CPM_MP && window.__CPM_MP()) || []; const i = mp.findIndex(q => q && q.t === 'away' && q.gk); const x = sz.x[0] + DX, y = sz.y[0] + 1.4; window.__CPM_GKAT119 = { x, y }; return { i, x, y }; }, { sz: pr.sz, DX });
  await page.evaluate(() => { const R = window.__R119 = { all: [], post: [] }; const f = () => { try { const ph = window.__CPM_PHASE && window.__CPM_PHASE(); if (ph === 'hl_result') { const g = window.__CPM_GKB95 ? window.__CPM_GKB95() : null; const rv = (window.__CPM_REVAT95 || 0) > 0; if (g != null) { R.all.push(g); if (window.__CPM_BALL && R.all.length % 2 === 0 && (R.tr = R.tr || []).length < 90) { const B = window.__CPM_BALL(); R.tr.push([+(performance.now() / 1000).toFixed(2), B.x, B.y, B.worldY, g, rv ? 1 : 0]); } if (rv) { if (R.t0 == null) R.t0 = performance.now(); if (performance.now() - R.t0 < 1500) R.post.push(g); } } } } catch (e) {} requestAnimationFrame(f); }; requestAnimationFrame(f); });/* misura PER FOTOGRAMMA lato pagina (GLB spento: __CPM_GKMIN117 vive nel ramo GLB e qui non scrive) */
  await page.evaluate(gi => { window.__CPM_GKMIN117 = null; window.__CPM_PARATA258 = []; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, pr.gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(700);
  const pre = await page.evaluate(() => { try { const s = window.__CPM_STATE(); const gk = s.players.find(p => p.team === 'away' && p.gk); return { hero: s.hero, ball: { x: s.ball.x, y: s.ball.y }, gk: gk && { x: gk.x, y: gk.y } }; } catch (e) { return null; } });
  await page.evaluate(({ k }) => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_FORCE_KIND = 'saved'; window.__CPM_RESOLVE(k); }, { k: pr.k });
  let min = null, at = null, samp = [];
  for (let w = 0; w < 30; w++) { await sleep(250);
    const r = await page.evaluate(() => { try { const ph = window.__CPM_PHASE(); const s = window.__CPM_STATE(); const gk = s.players.find(p => p.team === 'away' && p.gk);
      return { ph, m: window.__CPM_GKMIN117 ? +window.__CPM_GKMIN117.min.toFixed(2) : null, gb: window.__CPM_GKB95 ? window.__CPM_GKB95() : null, act: s.act ? s.act.t : null, hero: s.hero && { x: +s.hero.x.toFixed(1), y: +s.hero.y.toFixed(1) }, ball: { x: +s.ball.x.toFixed(1), y: +s.ball.y.toFixed(1) }, gk: gk && { x: +gk.x.toFixed(1), y: +gk.y.toFixed(1) } }; } catch (e) { return null; } });
    if (!r) break; if (r.ph === 'hl_result') { if (r.m != null) min = r.m; if (!at) at = r; samp.push(r.gb); } else if (min != null) break; }
  const p258 = await page.evaluate(() => ({ p258: window.__CPM_PARATA258 || [], p119: window.__CPM_PARATA119 || [], sv: window.__CPM_SV119 || null }));
  const R119 = await page.evaluate(() => { const R = window.__R119 || { all: [], post: [] }; return { tr: R.tr, nAll: R.all.length, minAll: R.all.length ? Math.min(...R.all) : null, nPost: R.post.length, minPost: R.post.length ? Math.min(...R.post) : null }; });
  min = R119.minPost; R119.gkmin = await page.evaluate(() => window.__CPM_GKMIN117 ? +window.__CPM_GKMIN117.min.toFixed(2) : null).catch(() => null);
  const o = { k: caso.k, R119, gkPos: pr.gkPos || null, seed: pr.seed, sz: pr.sz, hlType: pr.hl.type, variant: pr.hl.variant, pre, at, min, gbSamp: samp.slice(0, 8), p258 };
  out.push(o); console.log(JSON.stringify(o)); await page.close();
}
await b.close(); srv.close();
const fuori = out.filter(o => o.min != null && o.min > 6);
console.log(`CASI ${out.length} · minimo portiere↔pallone > 6: ${fuori.length} ${JSON.stringify(fuori.map(o => o.k + ':' + o.min))} · non misurati ${out.filter(o => o.min == null).length}`);
