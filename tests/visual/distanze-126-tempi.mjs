/* [giro 135] Sonda dei TEMPI di distanze-126: gioca UNA partita del guardiano con la stessa apertura
   (salvataggio, seme, velocita' 2, autoplay seedato tickMs 150) ma SENZA tetto di parete, e misura
   tempo reale fino a ended/ceremony, fps (rAF) medi e per fase, minuto di gioco ogni 30 s.
   CPM_SALVA=s1 CPM_SEME=1 CPM_FLAGS=__CPM_NO_FOLLA129 CPM_DENS=oggi CPM_TCAP=1500000 */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const FX = (f) => JSON.parse(fs.readFileSync(new URL('./fixtures/' + f, import.meta.url)));
const SALVA = { s1: 'save-c177-s1w15.json', s5: 'save-c177-s5w20.json', s12: 'save-190-s12-ovr93.json' };
const sk = process.env.CPM_SALVA || 's1', sd = +(process.env.CPM_SEME || 1);
const FLAGS = (process.env.CPM_FLAGS || '').split(',').filter(Boolean), DENS = process.env.CPM_DENS || '';
const TCAP = +(process.env.CPM_TCAP || 1500000), BR = process.env.CPM_BRACCIO || 'braccio';
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
const raw = FX(SALVA[sk]); let ls;
if (raw['cpm-v3']) { ls = { ...raw }; const sv = JSON.parse(ls['cpm-v3']); (sv.player || sv).name += ' ' + sd; ls['cpm-v3'] = JSON.stringify(sv); delete ls['cpm-v3-riserva']; delete ls['cpm-match-resume']; }
else { const sv = JSON.parse(JSON.stringify(raw)); (sv.player || sv).name += ' ' + sd; ls = { 'cpm-v3': JSON.stringify(sv) }; }
ls['cpm-match-speed'] = '2'; if (DENS) ls['cpm-folla'] = DENS;
await page.addInitScript(([s, arm]) => { window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_REALWAIT = 1; window.__CPM_PARETE103 = 150000;
  for (const f of arm) window[f] = 1; for (const k in s) { try { localStorage.setItem(k, s[k]); } catch (e) {} }
  window.__FR135 = 0; const tick = () => { window.__FR135++; requestAnimationFrame(tick); }; requestAnimationFrame(tick); }, [ls, FLAGS]);
const tL = Date.now();
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1500);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
await page.evaluate(() => window.__CPM_CAREER.playMatch());
await page.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'playing', null, { timeout: 60000 }).catch(() => {});
await page.evaluate((s) => window.__CPM_AUTOPLAY && window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 150 }), sd);
const t0 = Date.now(); let ph = '', last = null, fr0 = await page.evaluate(() => window.__FR135); const perFase = {}; const tracc = []; let tNext = 30000;
while (Date.now() - t0 < TCAP) {
  const st = await page.evaluate(() => ({ ph: window.__CPM_PHASE && window.__CPM_PHASE(), fr: window.__FR135, m: window.__CPM_CLOCK ? window.__CPM_CLOCK() : null })).catch(() => null);
  if (!st) break; const now = Date.now();
  if (last) { const f = perFase[last.ph] = perFase[last.ph] || { ms: 0, fr: 0 }; f.ms += now - last.t; f.fr += st.fr - last.fr; }
  last = { ...st, t: now }; ph = st.ph;
  if (now - t0 >= tNext) { tracc.push([Math.round((now - t0) / 1000), st.m]); tNext += 30000; }
  if (ph === 'ended' || ph === 'ceremony') break;
  await sleep(250);
}
const T = Date.now() - t0, frT = (last ? last.fr : fr0) - fr0;
const res = { braccio: BR, sk, sd, flags: FLAGS, dens: DENS || 'default', fine: ph, minuto: last && last.m, s_partita: +(T / 1000).toFixed(1), s_apertura: +((t0 - tL) / 1000).toFixed(1),
  fps_medi: +(frT / (T / 1000)).toFixed(2), fasi: Object.fromEntries(Object.entries(perFase).map(([k, v]) => [k, { s: +(v.ms / 1000).toFixed(1), fps: +(v.fr / (v.ms / 1000 || 1)).toFixed(2) }])), traccia: tracc };
console.log('RIS135 ' + JSON.stringify(res));
await ctx.close(); await b.close(); srv.close();
