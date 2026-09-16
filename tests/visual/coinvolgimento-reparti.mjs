#!/usr/bin/env node
/* [A12 · STRUMENTO] CHI TOCCA IL PALLONE, REPARTO PER REPARTO.
   Nasce dal collaudo del PO del 16/09: «brutta sta cosa dei difensori, il motore deve simulare una partita
   estremamente credibile». La pagella era piatta perche' il motore non fa MAI passare la palla dalla difesa,
   e senza un numero questo resta un'impressione. Qui si gioca una partita e si conta, per ciascuno dei
   ventidue, quante volte il motore gli intesta qualcosa — con il riepilogo per reparto, dedotto dallo
   schieramento iniziale (0 portiere · 1-4 difesa · 5-7 centrocampo · 8+ attacco).
   BASELINE 16/09 (7.922): difensori 8 su 8 con ZERO passaggi, 0-4 tocchi in tutto il reparto; portieri 0-1.
   Rosso `CPM_ROSSO=1` -> arma __CPM_NO923 (usato da un rimedio poi REVOCATO: vedi la nota della 7.922).
   ⚠️ Il campione e' magro per costruzione (una partita, e il motore produce ~25 passaggi per squadra):
   serve a dire SE un reparto esiste, non a tarare decimali. Sola lettura. */
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
  const _rep = (i) => { const k = i >= 21 ? 8 : (i < 10 ? i : i - 10); return k === 0 ? 'P' : (k <= 4 ? 'D' : (k <= 7 ? 'C' : 'A')); };
  const _som = (f, c) => r.pag.filter(q => _rep(q.i) === f).reduce((a, q) => a + c(q), 0);
  ['P', 'D', 'C', 'A'].forEach(f => {
    const n = r.pag.filter(q => _rep(q.i) === f);
    const vivi = n.filter(q => q.tocchi > 0).length;
    console.log(`REPARTO ${f}: ${n.length} uomini · tocchi ${_som(f, q => q.tocchi)} · passaggi ${_som(f, q => q.pa)} · contrasti ${_som(f, q => q.co)} · intercetti ${_som(f, q => q.ic)} · con almeno un tocco ${vivi}/${n.length}`);
  });
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
