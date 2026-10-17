#!/usr/bin/env node
/* [giro 43 PO-266] SONDA (solo collaudo): rigioca semi di nomi-219 con la stessa misura del guardiano (nominati del preludio, 400 ms
   dopo l'apertura della scelta) e accanto il testimone __CPM_W266 (dove sta il nominato, scambio _sw219, bandiere che lo escludono
   dal driver). Uso: CPM_SEMI=101-130 CPM_PAR=4 node sonda-nomi-266.mjs  (CPM_ROSSO=1 braccio rosso di nomi-219; CPM_EXTRA=__CPM_NO_X) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const sp = (process.env.CPM_SEMI || '147,154'); const SEMI = sp.includes('-') ? (([a, c]) => Array.from({ length: c - a + 1 }, (_, i) => a + i))(sp.split('-').map(Number)) : sp.split(',').map(Number);
const rosso = !!process.env.CPM_ROSSO; const EXTRA = (process.env.CPM_EXTRA || '').split(',').filter(Boolean); const PAR = +(process.env.CPM_PAR || 3);
const srv = await startServer(); const b = await launchBrowser(); const coda = [...SEMI]; const tot = { n: 0, v: 0, l: 0 };
await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) { const sd = coda.shift();
  try {
  var ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + sd;
  await page.addInitScript(([s, r, ex]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_B4REC = 1; window.__CPM_PRESENT = 1; window.__CPM_W266 = 1; if (r) { window.__CPM_NO_CAST219 = 1; window.__CPM_NO_SWAP219 = 1; } for (const k of ex) window[k] = 1; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, rosso, EXTRA]);
  await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
  try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await page.evaluate(() => window.__CPM_CAREER.playMatch());
  await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
  await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
  const t0 = Date.now(); let ph = '', prev = ''; const ps = { n: 0, v: 0, l: 0 };
  while (Date.now() - t0 < 420000) { ph = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE());
    if (ph === 'hl_choose' && prev !== 'hl_choose') { await sleep(400);
      const m = await page.evaluate(() => { const C = (window.__CPM_CAST219 || []).slice(-1)[0]; let st = null; try { st = window.__CPM_STATE(); } catch (e) {} if (!C || !st) return null;
        const P = st.players || [], H = st.hero || {}; const f = (w) => { if (!w || w.i == null || !P[w.i]) return null; const p = P[w.i]; return { i: w.i, nome: w.nome, d: +Math.hypot(p.x - H.x, p.y - H.y).toFixed(1), pos: [p.x, p.y] }; };
        const p6 = (window.__CPM_P6 || []).slice(-1)[0] || null;
        return { min: C.min, tipo: C.tipo, hero: [H.x, H.y], gk: (C.prel || []).filter(w => w.gk).length, n: (C.prel || []).filter(w => !w.gk).map(f).filter(Boolean), w: (window.__CPM_W266L || []).slice(-1)[0] || null, sw: (window.__CPM_SW219 || []).slice(-1)[0] || null, snap: (window.__CPM_W266S || []).slice(-6), p6: p6 && { min: p6.min, tipo: p6.tipo, text: p6.text, man: p6.man, ric: p6.ric } }; });
      if (m && !/^(cross|angolo|punizione|rigore)$/.test(m.tipo || '')) for (const x of m.n) { ps.n++; tot.n++; if (x.d > 35) { ps.l++; tot.l++; } if (x.d <= 25) { ps.v++; tot.v++; } else { { const T = await page.evaluate(() => window.__CPM_W266T || []); const pv = {}; const o = []; for (const r of T) { if (r[2] !== x.i) continue; const k = r[3] + ',' + r[4]; if (k !== pv.k) { o.push(r.join(':')); pv.k = k; } } console.log('TRACCIA ' + o.slice(0, 80).join(' ')); }
        console.log('LONTANO seme ' + sd + ' ' + JSON.stringify({ x, min: m.min, tipo: m.tipo, hero: m.hero, sw: m.sw, snap: m.snap, w: m.w, p6: m.p6 })); } } }
    prev = ph; if (ph === 'ended' || ph === 'ceremony') break; await sleep(250); }
  console.log((rosso ? 'rosso' : 'verde') + ' seme ' + sd + ' fine ' + ph + ' nominati ' + ps.n + ' vicini ' + ps.v + ' lontani ' + ps.l); await ctx.close();
  } catch (e) { console.log('ERRORE seme ' + sd + ' ' + String(e.message || e).slice(0, 120)); } } }));
console.log('TOTALE ' + JSON.stringify(tot)); await b.close(); srv.close();
