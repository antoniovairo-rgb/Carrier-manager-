#!/usr/bin/env node
/* [7.277.0 collaudo PO «dopo il primo caricamento cambiano i contenuti, c'è una sorta di refresh!» +
   «le parole del protagonista non devono cambiare in automatico allo scroll della rassegna stampa»]
   GUARDIANO della STABILITÀ della rassegna stampa post-partita.
   Il difetto: generateLocalPressAnalysis pescava a caso (2 Math.random per migliore-in-campo e flop,
   2 pick() per le citazioni di mister ed eroe) ed è chiamata INLINE nel render del riepilogo di fine
   partita — senza memo. Ogni re-render (uno scroll basta) riscriveva il giornale sotto gli occhi del
   giocatore. Stessa classe delle offerte pro (7.262.0); stessa cura: il SEED, non il memo.
   Due reti:
   (1) PURA — a parità di fatti della gara, N chiamate devono dare un risultato IDENTICO (byte a byte),
       e gare diverse devono dare risultati diversi (altrimenti il seed è degenere e il testo congelato).
   (2) VIVA — nel riepilogo di fine partita vero, dopo N scroll/re-render, «Le parole del protagonista»,
       il migliore in campo e i titoli devono essere gli stessi della prima lettura.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node press-stability-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const baseSave = () => ({ phase: 'career', player: {
  name: 'Press Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 25, ovr: 78,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 74, teamChemistry: 64,
  club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 78, tecnica: 78, fisico: 75, 'mentalità': 77, tiro: 80, passaggio: 76, dribbling: 79, posizionamento: 78 },
  form: 82, morale: 80, fatigue: 34, popularity: 52, totalMatches: 120, totalGoals: 52,
  matchHistory: Array.from({ length: 8 }, (_, i) => ({ week: 4 + i, opponent: 'FC Avversario', goals: i % 3 === 0 ? 1 : 0, assists: 0, rating: 6.5 + (i % 3) * 0.3, won: i % 2 === 0 })),
  contract: { duration: 3, wage: 14000, expiresAtSeason: 8 } } });

const boot = async () => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, o = baseSave());
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  return page;
};
let o;
const page = await boot();

// ───── (1) rete PURA: stessa gara ⇒ stesso giornale, gare diverse ⇒ giornali diversi
{
  const r = await page.evaluate(() => {
    const G = window.generateLocalPressAnalysis;
    if (typeof G !== 'function') return { err: 'generateLocalPressAnalysis non esposta' };
    const roster = ['Marco Rossi', 'Luca Bianchi', 'Paolo Verdi', 'Ivan Neri', 'Ugo Galli'].map(n => ({ name: n }));
    const call = (o) => JSON.stringify(G(
      { won: o.won, drew: !!o.drew, opponent: o.opp, homeScore: o.hs, awayScore: o.as, isDerby: false },
      { goals: o.g, assists: o.a, rating: o.r, name: 'Press Probe', club: 'FC Celeste', homeRoster: roster },
      { season: o.s, week: o.w, age: 25, matchHistory: [], archetype: null, records: { topSeasonGoals: 0, topSeasonAssists: 0, topOvr: 78 } }
    ));
    const SCEN = [
      { won: true, opp: 'FC Avversario', hs: 2, as: 1, g: 1, a: 0, r: 7.4, s: 4, w: 12 },
      { won: false, drew: true, opp: 'FC Avversario', hs: 1, as: 1, g: 0, a: 1, r: 6.6, s: 4, w: 13 },
      { won: false, opp: 'AC Rivale', hs: 0, as: 3, g: 0, a: 0, r: 5.2, s: 4, w: 14 },
      { won: true, opp: 'US Terza', hs: 4, as: 0, g: 3, a: 1, r: 9.1, s: 5, w: 2 },
    ];
    const inst = SCEN.map(s => { const runs = []; for (let i = 0; i < 40; i++) runs.push(call(s)); return runs.every(x => x === runs[0]) ? null : s.opp + ' ' + s.hs + '-' + s.as; }).filter(Boolean);
    const firme = SCEN.map(call);
    const uniche = new Set(firme).size;
    // stessa gara, settimana diversa ⇒ deve cambiare qualcosa (il seed non è congelato)
    const w1 = call(SCEN[0]), w2 = call({ ...SCEN[0], w: 20 });
    return { inst, uniche, tot: SCEN.length, weekVaria: w1 !== w2 };
  });
  if (r.err) { issues.push('(1) ' + r.err); console.log('(1) ❌ ' + r.err); }
  else {
    console.log(`(1) pura — scenari instabili su 40 chiamate: ${r.inst.length}/${r.tot} · giornali distinti: ${r.uniche}/${r.tot} · varia con la settimana: ${r.weekVaria}`);
    if (r.inst.length) issues.push(`(1) la rassegna cambia a parità di gara: ${r.inst.join(' · ')}`);
    if (r.uniche < r.tot) issues.push('(1) gare diverse producono lo stesso identico giornale (seed degenere)');
    if (!r.weekVaria) issues.push('(1) la stessa gara in settimane diverse dà un testo identico (seed insensibile alla settimana)');
  }
}

// ───── (2) rete VIVA: il riepilogo di fine partita non cambia allo scroll
{
  for (let a = 0; a < 14 && !(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function')); a++) {
    await page.evaluate(() => {
      const C = window.__CPM_CAREER; C.dismiss(); const pm = C.playMatch ? C.playMatch() : 'nomatch';
      if (pm !== true) { const r = C.step(); if (String(r).startsWith('blocked')) C.clearTournaments(); }
    });
    await sleep(900);
  }
  if (!(await page.evaluate(() => typeof window.__CPM_AUTOPLAY === 'function'))) {
    issues.push('(2) impossibile raggiungere il live di campionato');
  } else {
    await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 5, policy: 'seeded' }));
    const t0 = Date.now(); let arrivato = false;
    while (Date.now() - t0 < 300000) {
      const txt = await page.evaluate(() => document.body.innerText || '');
      if (/Le parole del protagonista/i.test(txt) && /MIGLIORE IN CAMPO/i.test(txt)) { arrivato = true; break; }
      await sleep(1500);
    }
    if (!arrivato) issues.push('(2) riepilogo di fine partita non raggiunto entro il tempo massimo');
    else {
      await sleep(600);
      const leggi = () => page.evaluate(() => {
        const t = document.body.innerText || '';
        const q = (t.split(/Le parole del protagonista/i)[1] || '').split('\n').filter(x => x.trim())[0] || '';
        const m = (t.split(/MIGLIORE IN CAMPO/i)[1] || '').split('\n').filter(x => x.trim())[0] || '';
        const c = (t.split(/LA CURVA/i)[1] || '').split('\n').filter(x => x.trim())[0] || '';
        return { q: q.trim(), m: m.trim(), c: c.trim() };
      });
      const base = await leggi();
      console.log(`(2) viva — protagonista: «${base.q.slice(0, 70)}…» · MVP: ${base.m}`);
      const diff = [];
      for (let i = 0; i < 8; i++) {
        // scroll REALE del contenitore + resize: gli stessi eventi che re-renderizzano il pannello
        await page.evaluate((k) => {
          document.querySelectorAll('*').forEach(e => { if (e.scrollHeight > e.clientHeight + 40) e.scrollTop = (k % 2) ? e.scrollHeight : 0; });
          window.dispatchEvent(new Event('resize'));
        }, i);
        await sleep(400);
        const now = await leggi();
        if (now.q !== base.q) diff.push(`giro ${i + 1}: parole del protagonista cambiate`);
        if (now.m !== base.m) diff.push(`giro ${i + 1}: migliore in campo cambiato (${base.m} → ${now.m})`);
        if (now.c !== base.c) diff.push(`giro ${i + 1}: voce della curva cambiata`);
      }
      console.log(`(2) viva — variazioni su 8 re-render: ${diff.length}`);
      diff.slice(0, 4).forEach(d => console.log('    ' + d));
      if (diff.length) issues.push(`(2) il giornale cambia da solo allo scroll: ${diff.length} variazioni`);
    }
  }
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — la rassegna stampa è stabile: stessi fatti, stesso giornale');
