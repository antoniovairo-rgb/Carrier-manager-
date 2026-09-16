/* [7.922] Perché le pagelle sono piatte: cosa sa DAVVERO il motore di ciascuno dei ventidue. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const server = await startServer(); const port = server.address().port;
const browser = await launchBrowser();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
await installCdnRoutes(ctx); const page = await ctx.newPage();
await page.addInitScript(() => { window.__CPM_GLB = true; });
await openMatch(page, port, { skipLoadAll: true, name: 'Vairo' });
await page.evaluate(() => { if (window.__CPM_AUTOPLAY) window.__CPM_AUTOPLAY(true, { seed: 4242, policy: 'seeded', tickMs: 120 }); }).catch(() => {});
try { await page.waitForFunction(() => window.__CPM_GLB_READY === true, { timeout: 90000 }); } catch (_e) {}
for (let i = 0; i < 40; i++) { const f = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()); if (f === 'playing') break; await sleep(500); }
await sleep(75000); /* si lascia girare a lungo: il conto per giocatore cresce solo col tempo di gioco */
const r = await page.evaluate(() => {
  const m = window.__CPM_MOTORE_OBJ && window.__CPM_MOTORE_OBJ(); if (!m) return null;
  const _ev=(m._S&&m._S.eventi)||[];
  const _tipi={};_ev.forEach(e=>{_tipi[e.t]=(_tipi[e.t]||0)+1;});
  const _pass=_ev.filter(e=>e.t==='passaggio').slice(-3).map(e=>({da:e.da?e.da.i:'NIENTE',a:e.a?e.a.i:'NIENTE',ch:e.chi?e.chi.i:'NIENTE'}));
  const p = m.pagelle(), t = m.tabellino(), s = m.stato();
  return { tipi:_tipi, pass:_pass, min: s.tick, tab: { home: t.home, away: t.away }, pag: p.map(q => ({ i: q.i, t: q.team, gk: q.gk, v: q.voto,
    pa: q.passaggi, ok: q.passOk, ti: q.tiri, gol: q.gol, as: q.assist, co: q.contrasti, ic: q.intercetti, sp: q.spazzate, pr: q.parate, fa: q.falli, am: q.amm, tocchi: q.tocchi })) };
});
if (r) {
  console.log('tipi di evento:', JSON.stringify(r.tipi));
  console.log('ultimi passaggi:', JSON.stringify(r.pass));
  console.log(`minuto ${r.min} · tabellino casa passaggi ${r.tab.home.passaggi} contrasti ${r.tab.home.contrasti} intercetti ${r.tab.home.intercetti} spazzate ${r.tab.home.spazzate} parate ${r.tab.home.parate}`);
  const voti = r.pag.map(q => q.v);
  const sei = voti.filter(v => v === 6).length;
  console.log(`voti: ${voti.length} giocatori · ESATTAMENTE 6,0: ${sei} · minimo ${Math.min(...voti)} · massimo ${Math.max(...voti)} · diversi ${new Set(voti).size}`);
  console.log('i · lato · voto · tocchi · passaggi(ok) · tiri · gol · assist · contrasti · intercetti · spazzate · parate · falli');
  r.pag.forEach(q => console.log(`  ${String(q.i).padStart(2)} ${q.t.padEnd(4)} ${String(q.v).padStart(4)} ${String(q.tocchi).padStart(4)} ${String(q.pa).padStart(3)}(${q.ok}) ${String(q.ti).padStart(2)} ${q.gol} ${q.as} ${String(q.co).padStart(2)} ${String(q.ic).padStart(2)} ${String(q.sp).padStart(2)} ${String(q.pr).padStart(2)} ${q.fa}`));
}
await browser.close(); server.close();
