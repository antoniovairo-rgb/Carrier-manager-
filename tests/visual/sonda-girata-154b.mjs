#!/usr/bin/env node
/* [giro 154b] STRUMENTO, non guardiano. Sonda giro 154b: s1 seme 8 (come distanze-126), autoplay 'mano': per ogni scena sceglie l'azione con l'etichetta di CPM_SCELTE
   (lista per indice di scena, regex), e su «spalle alla porta» sceglie «Girata secca». Misura il contatto __CPM_CONT121.
   CPM_ROOT=<radice di un worktree> la fa girare su un'altra base (es. lavoro/189). Uso: CPM_SCELTE='["Tiro da fuori","Punizione a giro"]' node sonda-girata-154b.mjs */
import fs from 'node:fs';
const ROOT = process.env.CPM_ROOT || new URL('../..', import.meta.url).pathname.replace(/\/$/, ''); const H = await import(ROOT + '/tests/visual/lib/harness.mjs');
const { startServer, launchBrowser, installCdnRoutes, sleep } = H;
const raw = JSON.parse(fs.readFileSync(ROOT + '/tests/visual/fixtures/save-c177-s1w15.json'));
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean);
const SCELTE = JSON.parse(process.env.CPM_SCELTE || '[]');
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
let ls; if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' 8'; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' 8'; ls = { 'cpm-v3': JSON.stringify(sv) }; }
ls['cpm-match-speed'] = '2';
await page.addInitScript(([s, arm]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
  for (const f of arm) window[f] = 1; for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} } }, [ls, FLAGS]);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 8, policy: 'mano', tickMs: 150 }));
const t0 = Date.now(), fatte = {}, cont = [], log = [];
while (Date.now() - t0 < 500000) {
  const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE(), c: window.__CPM_CURSIT(), a: window.__CPM_ACTS ? window.__CPM_ACTS() : [], L: (window.__CPM_CONT121 || []).splice(0) })).catch(() => null);
  if (!st) break; for (const x of st.L) cont.push(x); if (st.ph === 'ended' || st.ph === 'ceremony') break;
  if (st.ph === 'hl_choose' && st.c && !fatte[st.c.i] && st.a.length) {
    const re = /spalle alla porta/i.test(st.c.t) ? /Girata secca/ : new RegExp(SCELTE[st.c.i] || '^$');
    let k = st.a.findIndex(l => re.test(l)); if (k < 0) k = 0;
    const ok = await page.evaluate((k) => { const R = window.__CPM_RESEED; window.__CPM_RESEED = undefined; try { return window.__CPM_RESOLVE(k); } finally { window.__CPM_RESEED = R; } }, k);
    fatte[st.c.i] = 1; log.push({ i: st.c.i, t: st.c.t, scelta: st.a[k], ok });
  }
  await sleep(100);
}
await b.close(); srv.close();
for (const l of log) { const c = cont.find(x => x.sk % 10000 === l.i && !x.bg && x.act) || cont.find(x => x.sk % 10000 === l.i);
  console.log(`hl ${l.i} | ${l.t.slice(0, 44)} | ${l.scelta} | act ${c ? c.act : '-'} | ${c ? (Math.hypot(c.gx, c.z) * 1.05).toFixed(1) + ' m' : 'nessun contatto'}`); }
