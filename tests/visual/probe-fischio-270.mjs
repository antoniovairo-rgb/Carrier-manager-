/* [giro 270] sonda: quanto dura in tempo reale la partita del banco partita-rigiocata-194 (save-194, playMatch(true), autoplay 150 ms) */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-194-primavera-w38.json', import.meta.url)));
const srv = await startServer(process.env.CPM_ROOT || undefined); const port = srv.address().port; const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
await page.addInitScript(([s, v]) => { window.__CPM_GLB = false; localStorage.setItem('cpm-match-speed', v); localStorage.setItem('cpm-v3', JSON.stringify(s)); }, [save, process.env.VEL || '4']);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }).catch(() => {}); await sleep(2500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
console.log('pm', await page.evaluate(() => { try { return window.__CPM_CAREER.playMatch(true); } catch (e) { return 'err ' + e.message; } }));
await sleep(1500);
for (let k = 0; k < 14; k++) { const ph0 = await page.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null); if (ph0 === 'playing') break;
  await page.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null);
    const x = bs.find(b => /Diplomatico|Siamo pronti|Continua|Chiudi|Prosegui|Avanti/i.test(b.textContent || '') && !/Chiudi la stagione|Vivi la Settimana/i.test(b.textContent || '')); if (x) x.click(); });
  await sleep(900); }
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 40000 }).catch(() => {});
await page.evaluate(() => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: 1941, policy: 'seeded', tickMs: 150 }));
const t0 = Date.now(); let ph, last = ''; const tp = {}; await page.evaluate(() => { const R = window.__R270 = { f: [], c: [] }; let lc = null; const fr = () => { const t = performance.now(); R.f.push(t); const c = window.__CPM_CLOCK && window.__CPM_CLOCK(); if (c !== lc) { R.c.push([t, c]); lc = c; } requestAnimationFrame(fr); }; requestAnimationFrame(fr); setInterval(() => { const c = window.__CPM_CLOCK && window.__CPM_CLOCK(); if (c !== lc) { R.c.push([performance.now(), c]); lc = c; } }, 50); });
while (Date.now() - t0 < (+process.env.TETTO || 600000)) {
  const st = await page.evaluate(() => { let m = null; try { m = window.__CPM_CLOCK && window.__CPM_CLOCK(); } catch (e) {} let sc = null; try { sc = window.__CPM_SCORE && window.__CPM_SCORE(); } catch (e) {} return { ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null, m, sc, sp: localStorage.getItem('cpm-match-speed') }; });
  ph = st.ph; tp[ph] = (tp[ph] || 0) + 3; const s = JSON.stringify({ ph: st.ph, sc: st.sc }); if (s !== last) { console.log(Math.round((Date.now() - t0) / 1000) + 's min ' + st.m, s); last = s; }
  if (ph === 'ended' || ph === 'ceremony') break; await sleep(3000); }
console.log('FASI', JSON.stringify(tp)); console.log('RITMO', JSON.stringify(await page.evaluate(() => { const R = window.__R270; const d = []; for (let i = 1; i < R.f.length; i++) d.push(R.f[i] - R.f[i - 1]); d.sort((a, b) => a - b); const g = []; for (let i = 1; i < R.c.length; i++) g.push(R.c[i][0] - R.c[i - 1][0]); const gs = [...g].sort((a, b) => a - b); const q = (a, x) => a.length ? Math.round(a[Math.floor(a.length * x)]) : null; return { fotogrammi: R.f.length, frame_med: q(d, .5), frame_p90: q(d, .9), minuti: R.c.length, gap_med: q(gs, .5), gap_p90: q(gs, .9), gap_primi10: g.slice(0, 10).map(Math.round), gap_ultimi10: g.slice(-10).map(Math.round) }; })));
  console.log('MINUTO_FINALE', await page.evaluate(() => window.__CPM_CLOCK && window.__CPM_CLOCK())); console.log('FINE', ph, Math.round((Date.now() - t0) / 1000) + 's', 'errori', errs.slice(0, 3).join(' | '));
await b.close(); srv.close(); process.exit(0);
