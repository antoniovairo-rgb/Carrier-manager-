#!/usr/bin/env node
/* sonda giro 18: ripartenza dopo gol nato in scena, con interruttori da riga di comando (CPM_FLAGS=a,b) */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + (process.env.CPM_TENT || 'A');
await page.addInitScript(([s, F]) => { window.__CPM_GLB = false; window.__CPM_REC = true; for (const f of F) window[f] = 1; window.__CPM_REC967 = 0; localStorage.setItem('cpm-match-speed', '4'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [sv, FLAGS]);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
const t0 = Date.now(); let nKo = 0, dopo = 0; const tr = [];
while (Date.now() - t0 < 300000) {
  await page.evaluate(() => { if (!window.__CPM_MOTORE_OBJ || !window.__CPM_MOTORE_OBJ() || window.__CPM_MOTORE_OBJ()._g18) return; window.__CPM_MOTORE_OBJ()._g18 = 1;  const M = window.__CPM_MOTORE_OBJ(); const R = window.__G18 = window.__G18 || []; const t0 = M.tick.bind(M); let lastStack = '';
  M.tick = function (o) { const r = t0(o); const st = M.stato(); if (R.length < 4000) R.push({ k: 't', tick: st.tick, s: st.poss.stato, p: [Math.round(st.palla.x), Math.round(st.palla.y)], sc: st.scena, ms: performance.now() | 0, r967: window.__CPM_REC967, deb: window.__CPM_DEB202, ph: window.__CPM_PHASE && window.__CPM_PHASE(), min: o && o.min, dec: o && o.dec }); return r; };
  const r0 = M.chiedi.riprendi; M.chiedi.riprendi = function (o) { R.push({ k: 'RIP', o: JSON.stringify({ x: o && o.x, y: o && o.y, c: o && o.centro, l: o && o.lato }), tick: M.stato().tick, ms: performance.now() | 0 }); return r0.call(this, o); }; });
  const s = await page.evaluate(() => { let st = null; try { st = window.__CPM_MOTORE_OBJ().stato(); } catch (e) {} return { f: window.__CPM_PHASE(), ko: (window.__CPM_KO207 || []).slice(), p: st ? [st.palla.x, st.palla.y, st.poss.stato, st.poss.lato, st.scena, st.tick, st.kickoff] : null }; });
  if (s.f === 'ended') break;
  if (s.ko.length > nKo) { nKo = s.ko.length; dopo = 40; console.log('KO', JSON.stringify(s.ko)); }
  if (dopo > 0 || (nKo && tr.length < 5)) { dopo--; console.log(((Date.now() - t0) / 1000).toFixed(1), s.f, JSON.stringify(s.p)); if (dopo === 0) break; }
  else if (nKo === 0 && s.f !== 'playing') { /* in scena */ }
  await sleep(150);
}
console.log('G18', JSON.stringify(await page.evaluate(() => { const R = window.__G18; const i = R.findIndex(x => x.k === 'RIP' && /"c":true/.test(x.o)); return i < 0 ? R.filter(x=>x.k==='RIP') : R.slice(Math.max(0, i - 8), i + 25); })));
console.log('SEME161', JSON.stringify(await page.evaluate(() => (window.__CPM_SEME161 || []).slice(-3))));
await b.close(); srv.close();
