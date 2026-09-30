/* [7.999.85 PO-151] Guardiano: nelle scene difensive fallite (gol subito) il tabellone NON cambia prima che
   l'esito si riveli (barra «in corso» ancora a schermo), e alla fine il gol c'e'. Rosso __CPM_NO_GA85
   (CPM_ROSSO85=1): il gol deve comparire mentre la barra «in corso» e' ancora visibile. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = !!process.env.CPM_ROSSO85;
const SCENE = (process.env.CPM_GI || '133,45,157,36').split(',').map(Number);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let anticipati = 0, finali = 0, giudicate = 0;
for (const gi of SCENE) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(ctx);
  const p = await ctx.newPage();
  await p.addInitScript((R) => { window.__CPM_GLB = false; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; if (R) window.__CPM_NO_GA85 = 1; }, ROSSO);
  await openMatch(p, port, { skipLoadAll: true, name: 'Vairo' }); await sleep(800);
  await p.evaluate(g => window.__CPM_FORCE_SIT(g, true), gi).catch(() => {});
  for (let i = 0; i < 40; i++) { if ((await p.evaluate(() => window.__CPM_PHASE())) === 'hl_choose') break; await sleep(150); }
  await p.evaluate(() => { window.__CPM_FORCE_OUTCOME = 'fail'; window.__CPM_RESOLVE(0); }).catch(() => {});
  let ant = 0, visto = false, fin = 0, key = null;
  for (let i = 0; i < 80; i++) {
    const s = await p.evaluate(() => ({ sc: window.__CPM_SCORE(), corso: !!document.querySelector('[data-cpm="incorso94"]'), esito: !!document.querySelector('[data-cpm="esito"]'), ph: window.__CPM_PHASE() }));
    if (s.corso) visto = true;
    if (s.corso && s.sc.away > 0) ant++;
    fin = s.sc.away;
    if (s.esito && i > 5) { await sleep(300); fin = (await p.evaluate(() => window.__CPM_SCORE())).away; break; }
    await sleep(100);
  }
  key = await p.evaluate(() => { const t = window.__CPM_TIMELINE() || []; const a = t.filter(x => x.type === 'ActionResolved').pop(); return a ? (a.key || a.outKey) : null; });
  console.log(`gi${gi} esito ${key} · barra in corso vista ${visto} · campioni col gol già nel tabellone durante «in corso» ${ant} · tabellone finale ospiti ${fin}`);
  if (key === 'goal_against' && visto) { giudicate++; if (ant) anticipati++; if (fin > 0) finali++; }
  await ctx.close();
}
await b.close(); srv.close();
console.log(`scene giudicate ${giudicate} · gol anticipati ${anticipati} · gol presenti alla fine ${finali}`);
if (giudicate < 2) { console.log('CIECO'); process.exit(2); }
if (ROSSO) { console.log(anticipati > 0 ? 'ROSSO OK: il difetto si vede' : 'ROSSO KO'); process.exit(anticipati > 0 ? 0 : 1); }
const ok = anticipati === 0 && finali === giudicate; console.log(ok ? 'VERDE' : 'KO'); process.exit(ok ? 0 : 1);
