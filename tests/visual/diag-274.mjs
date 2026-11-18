#!/usr/bin/env node
/* [giro 274] diagnosi: stessa partita di salti-274 (stesso nome, stesso seme), piu' l'elenco delle scene e dei salti con la scena che li ospita. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI = (process.env.CPM_NOMI || 'Ivo Mansi').split(','), TETTO = +(process.env.CPM_TETTO || 330000), ROSSO = process.env.CPM_ROSSO || '';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const [k0, nome] of NOMI.entries()) { const k = process.env.CPM_K != null ? +process.env.CPM_K : k0;
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_BALLSET274 = 1; if (r) r.split('+').forEach(x => window[x] = 1); }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 7 + k);
  const t0 = Date.now(); let ph = null; const righe = [];
  while (Date.now() - t0 < TETTO) { const s = await page.evaluate(() => { const p = window.__CPM_PHASE && window.__CPM_PHASE(); let st = null; try { st = window.__CPM_STATE && window.__CPM_STATE(); } catch (e) {} return { p, t: Math.round(performance.now()), c: st && st.clock, a: st && st.act, b: st && st.ball && [st.ball.x, st.ball.y, st.ball.worldY], h: st && st.hero && [st.hero.x, st.hero.y] }; }).catch(() => null);
    if (s && s.p !== ph) { righe.push(`${s.t} ${s.p} ${s.c}' ${s.a ? `${s.a.ht}/${s.a.pat}/${s.a.t}/${s.a.rew}/${s.a.kind}/${s.a.ok}` : '-'} palla ${s.b} eroe ${s.h}`); ph = s.p; } if (s && (s.p === 'ended' || s.p === 'ceremony')) break; await sleep(150); }
  const r = await page.evaluate(() => ({ bj: (window.__CPM_BJ478 || []).filter(x => !x.mask && !x.nascosto && x.ph === 'hl_result'), voli: window.__CPM_VOLO274 || [], t274: window.__CPM_TESTA274 || [], t146: (window.__CPM_TESTA146 || []).filter((x, i, a) => i === 0 || a[i - 1][0] !== x[0] || x[1] > 3),
    tl: (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).filter(e => /Highlight|Resolved/.test(e.type || e.t || '')).map(e => JSON.stringify(e).slice(0, 200)) }));
  console.log(`### ${nome} (seme ${7 + k})`); console.log(righe.join('\n')); console.log('SALTI', JSON.stringify(r.bj)); const tele = r.bj.filter(x => x.dt > 0 && (x.src === 'arco' && x.al != null && x.ad > 0 ? x.d > 2 * (x.al * x.dt / x.ad) + 1 : x.d / x.dt > 50)); console.log('NONSPIEGATI ' + tele.length); console.log('FIRMA ' + righe.filter(x => / hl_result /.test(x)).map(x => x.split(' ').slice(2, 4).join(':')).join(' | ')); console.log('VOLI', JSON.stringify(r.voli)); console.log('TESTA274', JSON.stringify(r.t274)); console.log('T146', JSON.stringify(r.t146)); console.log('TL\n' + r.tl.join('\n'));
  await ctx.close(); }
await b.close(); srv.close();
