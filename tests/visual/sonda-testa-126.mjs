#!/usr/bin/env node
/* [giro 43 PO-143 #64/#126] SONDA (solo collaudo, GLB-ON, una pagina nuova per scena): forza la scena e l'azione, esito scelto, e campiona
   ogni ~60 ms pallone (mesh, con quota), eroe e fase fino all'uscita dall'highlight. Stampa: dove parte il pallone, dove va, quanto
   ARRETRA (passi verso la propria porta durante il volo), la distanza testa-pallone al lancio (__CPM_P1B2) e il bersaglio del colpo.
   Uso: CPM_CASI=126:0:success,126:1:success node sonda-testa-126.mjs  (CPM_EXTRA=__CPM_NO_X per il braccio rosso) */
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } = await import(path.join(DIR, 'lib/harness.mjs'));
const CASI = (process.env.CPM_CASI || '126:0:success,126:1:success,126:1:fail,126:2:success,64:0:success,64:0:fail').split(',').map(s => { const [gi, k, o] = s.split(':'); return { gi: +gi, k: +k, o }; });
const EXTRA = (process.env.CPM_EXTRA || '').split(',').filter(Boolean); const GLB = process.env.CPM_GLB !== '0';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const out = [];
for (const c of CASI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(([ex, g]) => { window.__CPM_PRESENT = 1; window.__CPM_CINE = 1; window.__CPM_GLB = g; window.__CPM_REC = 1; window.__CPM_REALWAIT = 1; window.__CPM_WS38_REC = 1; window.__CPM_BU43 = []; for (const k of ex) window[k] = 1; }, [EXTRA, GLB]);
  await openMatch(page, port, { skipLoadAll: true, name: 'Testa 126' }); await sleep(1500);
  if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 90000 }).catch(() => {});
  await page.evaluate(gi => { window.__CPM_P1B2 = []; window.__CPM_WS38 = []; window.__CPM_BU43 = []; window.__CPM_HDR786 = null; window.__CPM_FLICK786 = null; window.__CPM_FORCE_SIT(gi, false); window.__CPM_FROZEN = false; }, c.gi);
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'hl_choose', null, { timeout: 30000 }).catch(() => {});
  await sleep(700);
  const pre = await page.evaluate(() => ({ b: window.__CPM_BALL(), h: window.__CPM_STATE().hero }));
  await page.evaluate(([k, o]) => { window.__CPM_FORCE_OUTCOME = o; window.__CPM_RESOLVE(k); }, [c.k, c.o]);
  const S = []; const t0 = Date.now();
  while (Date.now() - t0 < 14000) { const f = await page.evaluate(() => { const B = window.__CPM_BALL(); const st = window.__CPM_STATE(); const A = window.__CPM_ARC || {}; return { ph: window.__CPM_PHASE(), b: B, h: st.hero && [st.hero.x, st.hero.y], pa: A.pa || null, ek: A.ek || null }; });
    S.push({ t: Date.now() - t0, ...f }); if (!/^hl_/.test(f.ph || '')) break; await sleep(60); }
  const extra = await page.evaluate(() => ({ hdr: window.__CPM_HDR786, flick: window.__CPM_FLICK786, lancio: (window.__CPM_P1B2 || []).filter(r => r[0] === 'header' && r[6] > 0 && r[6] <= 0.06 && r[8] >= 0).map(r => +r[8].toFixed(2)).slice(0, 2), oc: (() => { try { return window.__CPM_OUTCOME_LAST || null; } catch (e) { return null; } })() }));
  const R = S.filter(s => s.ph === 'hl_result' && s.b); let arr = 0, maxArr = 0, run = 0; for (let i = 1; i < R.length; i++) { const dx = R[i].b.x - R[i - 1].b.x; if (dx < -0.3) { arr += -dx; run += -dx; maxArr = Math.max(maxArr, run); } else run = 0; }
  const xs = R.map(s => s.b.x); const r = { caso: c.gi + ':' + c.k + ':' + c.o, pre: pre.b && [pre.b.x, pre.b.y, pre.b.worldY], eroe: pre.h && [pre.h.x, pre.h.y], primo: R[0] && [R[0].b.x, R[0].b.y], ultimo: R.length && [R[R.length - 1].b.x, R[R.length - 1].b.y], xmax: xs.length ? Math.max(...xs) : null, arretra: +arr.toFixed(1), arretraFila: +maxArr.toFixed(1), quotaMax: R.length ? Math.max(...R.map(s => s.b.worldY)) : null, campioni: R.length, scarico: await page.evaluate(() => (window.__CPM_BU43 || []).some(r => r[2] === 'scarico' || r[2] === 'rientro')), postarchi: [...new Set(R.map(s => s.pa).filter(Boolean))].join('>'), esito: [...new Set(R.map(s => s.ek).filter(Boolean))].join('>'), ...extra };
  out.push(r); console.log(JSON.stringify(r)); if (process.env.CPM_SERIE) console.log(R.map(s => s.t + ':' + s.b.x.toFixed(1) + ',' + s.b.y.toFixed(1) + '^' + s.b.worldY).join(' '));
  if (process.env.CPM_WS) { const W = await page.evaluate(() => (window.__CPM_WS38 || []).filter(r => r[4] === 1)); let last = null, seg = [];
    for (const r of W) { if (!last || last.ws !== r[1]) { if (last) seg.push(last); last = { ws: r[1], n: 0, x0: r[2], x1: r[2], t0: r[0] }; } last.n++; last.x1 = r[2]; } if (last) seg.push(last);
    console.log('WS ' + seg.filter(s => s.n > 1 || Math.abs(s.x1 - s.x0) > 1).map(s => s.ws + '[' + s.n + ']' + (s.x0 + 50).toFixed(1) + '>' + (s.x1 + 50).toFixed(1)).join(' ')); }
  if (process.env.CPM_BU) { const U = await page.evaluate(() => window.__CPM_BU43 || []); let lb = null; const o = []; for (const r of U) { const key = r[1] + r[2]; if (key !== lb) { o.push('|' + r[1] + ':' + r[2] + '/' + r[3] + ' '); lb = key; } o.push(r[4] + '^' + r[5] + 'h' + r[6] + 'w' + r[7]); } console.log('BU aer=' + (U[0] && U[0][8]) + ' ' + o.join(' ')); }
  await page.close(); }
await b.close(); srv.close();
