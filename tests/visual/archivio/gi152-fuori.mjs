/* [24/09] SONDA gi152 — la CI (runner lenti) boccia `final-state` su gi152 «Schema doppio dai e vai» in 4 run su 7 dal 7.980:
   «giocatore fuori campo @(105-107,5x)». Rifa' la passata final-state della sola gi152 N volte, con la CPU rallentata
   (CPM_THROTTLE, default 4) per imitare la CI, e dice CHI finisce oltre x=102. CPM_ROSSO=<flag>. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, forceSituation, waitBallSettle, frameState, sleep } from './lib/harness.mjs';
const N = +(process.env.CPM_N || 6), TH = +(process.env.CPM_THROTTLE || 4), GI = +(process.env.CPM_GI || 152);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
if (process.env.CPM_ROSSO) await page.addInitScript(r => { window[r] = true; }, process.env.CPM_ROSSO);
await openMatch(page, port);
const cdp = await page.context().newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: TH });
const out = [];
for (let k = 0; k < N; k++) {
  if (process.env.CPM_PRIMA) { await forceSituation(page, +process.env.CPM_PRIMA, { settle: 550, choose: true }); await page.evaluate(() => window.__CPM_RESOLVE(0)); await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 }); await sleep(300); }
  await forceSituation(page, GI, { settle: 550, choose: true });
  await page.evaluate(() => window.__CPM_RESOLVE(0)); await sleep(700);
  const oc = await page.evaluate(() => window.__CPM_OUTCOME && window.__CPM_OUTCOME.outKey);
  await waitBallSettle(page, { maxMs: 9000, quietMs: 700, pollMs: 110 });
  const s = await frameState(page);
  const fuori = s && s.ok ? s.players.concat([Object.assign({ hero: true }, s.hero)]).filter(p => p.x > 95 || p.x < 5).map(p => ({ x: p.x, y: p.y, team: p.team, role: p.role, gk: p.gk, hero: !!p.hero })) : 'stato non disponibile';
  out.push({ k, esito: oc, fuori }); await sleep(300);
}
const rec = await page.evaluate(() => window.__CPM_RECINTO24 || 0); const maxX = Math.max(...out.flatMap(o => Array.isArray(o.fuori) ? o.fuori.map(p => p.x) : [0]), 0);
console.log(JSON.stringify({ rosso: process.env.CPM_ROSSO || null, throttle: TH, oltre102: out.filter(o => Array.isArray(o.fuori) && o.fuori.some(p => p.x > 102)).length, maxX, recinto: rec, prove: out.map(o => o.esito + ':' + (Array.isArray(o.fuori) ? o.fuori.map(p => p.x).join('/') : o.fuori)) }));
await b.close(); srv.close();
