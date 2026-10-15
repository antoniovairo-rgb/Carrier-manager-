import fs from 'node:fs';
const H = new URL('../../../tests/visual/', import.meta.url).pathname;
const { startServer, launchBrowser, installCdnRoutes, sleep } = await import(H + 'lib/harness.mjs');
const save = JSON.parse(fs.readFileSync(H + 'fixtures/save-190-s12-ovr93.json'));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv; pl.name = pl.name + ' ' + (process.env.NOME || 'R0');
await page.addInitScript(s => { window.__CPM_GLB = false; window.__CPM_REC = true; localStorage.setItem('cpm-match-speed', '1'); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, sv);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 2071, policy: 'seeded', tickMs: 150 }));
await page.waitForFunction(() => window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(), null, { timeout: 30000 });
await page.evaluate(() => { const M = window.__CPM_MOTORE_OBJ(); const d = M.risolviEroe.dado; M.risolviEroe.dado = function () { const c = window.__CPM_CURSIT && window.__CPM_CURSIT(); if (c && /penalty|freekick/.test(c.intent || '')) return true; return d.apply(this, arguments); };
  window.__T = []; const t0 = performance.now(); let lastSc = null;
  setInterval(() => { try { const st = window.__CPM_MOTORE_OBJ().stato(); const sc = window.__CPM_SCORE(); window.__T.push({ t: Math.round(performance.now() - t0), ph: window.__CPM_PHASE(), min: window.__CPM_CLOCK(), sc: sc.home + '-' + sc.away, ps: st.poss ? st.poss.stato + '/' + st.poss.lato : null, p: st.palla ? [Math.round(st.palla.x), Math.round(st.palla.y)] : null, sce: !!st.scena, fermo: st.fermo ? st.fermo.kind : null, fuori: (st.gioc||[]).filter(q => !q.gk && (q.t === 0 ? q.x > 51 : q.x < 49)).length, dmin: Math.round(Math.min(...(st.gioc||[]).filter(q => !q.gk).map(q => Math.hypot(q.x - 50, q.y - 50)))) }); if (window.__T.length > 20000) window.__T.shift(); } catch (e) {} }, 100); });
const KIND = process.env.KIND || 'pen'; let chiesto = !!process.env.NOPEN;
const t0 = Date.now(); let goals = 0;
while (Date.now() - t0 < (+process.env.SEC || 200) * 1000) {
  const s = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), min: window.__CPM_CLOCK(), g: (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal').length }));
  if (s.ph === 'ended') break;
  if (!chiesto && s.ph === 'playing' && s.min >= 9) { chiesto = await page.evaluate(k => { const M = window.__CPM_MOTORE_OBJ(); M.chiedi.piazzato({ kind: k, x: k === 'pen' ? 89 : 83, y: 50, lato: 'home', batt: M.HERO, hold: 3 }); return 1; }, KIND); }
  if (process.env.FOTO && s.g >= 1 && !globalThis.__fatto) { globalThis.__fatto = 1; await page.waitForFunction(() => window.__CPM_PHASE() === 'playing', null, { timeout: 30000 }).catch(() => {});
    for (let k = 0; k < 12; k++) { const st = await page.evaluate(() => { const m = window.__CPM_MOTORE_OBJ().stato(); return m.poss.stato + ' ' + Math.round(m.palla.x) + ',' + Math.round(m.palla.y); }); await page.screenshot({ path: process.env.FOTO + '/f' + String(k).padStart(2, '0') + '.png' }); console.log('foto', k, st); await sleep(120); } }
  if (s.g >= (+process.env.GOALS || 2)) { await sleep(9000); break; }
  await sleep(500);
}
const T = await page.evaluate(() => window.__T);
const EV = await page.evaluate(() => (window.__CPM_EV ? window.__CPM_EV() : []).filter(e => e.ev === 'goal'));
const KO = await page.evaluate(() => window.__CPM_KO207 || []);
console.log('GOL', JSON.stringify(EV)); console.log('KO207', JSON.stringify(KO));
/* per ogni cambio di punteggio: la sequenza compressa dei 10 s successivi */
for (let i = 1; i < T.length; i++) if (T[i].sc !== T[i - 1].sc) {
  console.log('--- punteggio', T[i - 1].sc, '→', T[i].sc, 'a t', T[i].t, 'fase', T[i].ph, 'min', T[i].min);
  let last = ''; for (let j = i; j < T.length && T[j].t - T[i].t < 14000; j++) { const f = T[j]; const k = f.ph + '|' + f.ps + '|' + f.p + '|' + f.fermo + '|' + f.sce; if (k !== last) { console.log('   +' + (f.t - T[i].t) + 'ms', f.ph, 'min', f.min, f.ps, 'palla', f.p, f.fermo ? 'fermo ' + f.fermo : '', f.sce ? 'SCENA' : '', 'fuori', f.fuori, 'dmin', f.dmin); last = k; } }
}
await b.close(); srv.close();
