#!/usr/bin/env node
/* [PO-222 · giro 33, eccezione PO 15/10 «Sì, solo questi due»] GUARDIANO: LO SQUALIFICATO NON FA PRESENZA SU «SIMULA».
 *
 * Misura sugli handler VERI (__CPM_CAREER, ?cpmtest=1); lo stato si legge da localStorage 'cpm-v3' (autosave), cioe'
 * cio' che il giocatore ritrova ricaricando. Ogni braccio parte da una pagina nuova, stessa settimana di lega.
 *   - sano (controllo), bottone «Simula»            → presenza +1 (altrimenti la misura e' cieca)
 *   - squalificato, bottone «Simula» VERO           → presenza +0, voce di storico marcata `squalificato` con voto nullo,
 *                                                    squalifica scontata (isSuspended:false)
 *   - squalificato, step() del banco (senza azzerare) → presenza +0
 *   - infortunato / svincolato, step()               → presenza +0 (gia' cosi' prima: controllo di non-regressione)
 * Il bottone vero azzera la squalifica PRIMA di chiamare simulateAndAdvance (src/18 ~6671): la correzione deve vederla
 * comunque, ed e' per questo che il braccio principale passa dal bottone e non da patch.
 * Prova del rosso: CPM_ROSSO=1 arma window.__CPM_NO_SQ222 → torna la presenza dello squalificato: il guardiano DEVE uscire 1.
 * Uso: CPM_CHROME=/opt/pw-browsers/chromium node squalifica-222.mjs   (CPM_JSON=1 stampa i numeri grezzi)
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const guasti = []; const righe = [];
const ok = (c, m) => { righe.push((c ? '✓ ' : '✗ ') + m); if (!c) guasti.push(m); };

const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const baseSave = (extra) => ({ phase: 'career', player: { name: 'Collaudo Zona G', nation: 'Italia', avatarId: 0, proStatus: 'pro',
  season: 2, week: 1, age: 20, ovr: 70, tutorialDone: true, club: CLUB,
  stats: { 'velocità': 70, tecnica: 69, fisico: 68, 'mentalità': 70, tiro: 72, passaggio: 69, dribbling: 71, posizionamento: 70 },
  form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 },
  matches: 0, totalMatches: 0, goals: 0, totalGoals: 0, matchHistory: [], bankBalance: 0,
  yellAccum: 0, seasonCards: { y: 0, r: 0 }/* senza yellAccum la migrazione (src/17 ~2535) azzera isSuspended al caricamento */, ...extra } });

async function apri(save) {
  const ctx = await browser.newContext({ viewport: { width: 900, height: 900 } });
  const page = await ctx.newPage();
  await installCdnRoutes(page);
  const errori = []; page.on('pageerror', e => errori.push(String(e.message).slice(0, 160)));
  await page.addInitScript(({ s, rosso }) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_SQ222 = true;
    localStorage.setItem('cpm-v3', JSON.stringify(s)); }, { s: save, rosso: ROSSO });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  for (let i = 0; i < 12; i++) {
    const n = await page.evaluate(() => (window.__CPM_CAREER.openingPending() || []).length);
    if (!n) break;
    await page.evaluate(() => window.__CPM_CAREER.resolveOpening()); await sleep(300);
  }
  return { ctx, page, errori };
}

const stato = (page) => page.evaluate(() => {
  const p = (JSON.parse(localStorage.getItem('cpm-v3') || '{}').player) || {};
  const h = p.matchHistory || []; const u = h[h.length - 1] || null;
  return { week: p.week, matches: p.matches || 0, totalMatches: p.totalMatches || 0, goals: p.goals || 0, assists: p.assists || 0,
    histN: h.length, susp: !!p.isSuspended,
    ultima: u && { cup: !!u.cup, nc: !!u.nonConvocato, sq: !!u.squalificato, inj: !!u.injured, svinc: !!u.svincolato, rating: u.rating, goals: u.goals, assists: u.assists } };
});

// settimana di lega con partita (stessa per tutti i bracci: calendario deterministico)
let W = null, WC = null, WE = null;
{ const { ctx, page } = await apri(baseSave({}));
  for (let w = 1; w <= 38 && !(W && (WC || WE)); w++) {
    await page.evaluate((w) => window.__CPM_CAREER.patch({ week: w, weekLived: false }), w); await sleep(250);
    const t = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
    if (t && !t.type && !W) W = w;
    if (t && t.type === 'cup' && !WC) WC = w;
    if (!t && !WE && w > 2) WE = w;
  }
  await ctx.close(); }
if (!W) { console.log('✗ nessuna settimana di lega con partita: misura cieca'); process.exit(1); }

async function braccio(id, extra, via, sett) {
  const { ctx, page, errori } = await apri(baseSave({ week: sett === 'coppa' ? WE : (sett || W), weekLived: false, ...extra }));
  if (sett === 'coppa') {
    await page.evaluate((w) => { const C = window.__CPM_CAREER, p = C.snapshot();
      C.patch({ week: w, weekLived: false, cup: { active: true, round: 1, results: [], bracket: [], eliminated: false },
        calendar: [...(p.calendar || []), { matchday: 991, week: w, opponentId: 'b07', opponentName: 'SV Rheinau', isHome: true, played: false, result: null,
          type: 'cup', competition: 'Coppa Nazionale', cupRound: 1, cupRoundName: 'Ottavi di Finale' }] }); }, WE);
    await sleep(600);
  }
  const prima = await stato(page);
  const suspVivo = await page.evaluate(() => !!(window.__CPM_CAREER.snapshot() || {}).isSuspended);
  // «Vivi la settimana»
  await page.evaluate(() => { const C = window.__CPM_CAREER; C.step(); C.dismiss(); }); await sleep(500);
  let azione = '';
  if (via === 'bottone' || via === 'nonconv') {
    // il prompt partita vero (Gioca/Simula/Annulla) e il click sul suo «Simula»
    await page.evaluate((st) => window.__CPM_CAREER.apriPartita(st), via === 'nonconv' ? 'not_called' : 'starter'); await sleep(500);
    azione = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(x => /Simula/.test(x.textContent || '') && !/Non puoi/.test(x.textContent || ''));
      if (!b.length) return 'nessun bottone Simula'; window.__nc222 = [...document.querySelectorAll('button')].some(x => /non convocato/.test(x.textContent || '')); const t = (b[b.length - 1].textContent || '').trim(); b[b.length - 1].click(); return t; });
  } else {
    // step() dichiara «simulated» anche quando simulateAndAdvance esce su openingGate (interazione d'apertura rimasta pendente):
    // si ripete finche' la settimana avanza davvero (stesso fenomeno del collaudo: 1 esecuzione su 4 «non avanzata»)
    for (let i = 0; i < 5; i++) {
      const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const r = C.step(); C.dismiss(); return r; });
      azione += r + ' '; await sleep(600);
      if ((await page.evaluate(() => window.__CPM_CAREER.snapshot().week)) !== prima.week) break;
    }
  }
  await sleep(900);
  const dopo = await stato(page);
  await ctx.close();
  return { id, via, azione, suspVivo, prima, dopo, errori, dM: dopo.matches - prima.matches, dT: dopo.totalMatches - prima.totalMatches, avanzata: dopo.week === prima.week + 1 };
}

const R = [];
R.push(await braccio('sano', {}, 'bottone'));
R.push(await braccio('squalificato', { isSuspended: true }, 'bottone'));
R.push(await braccio('squalificato-banco', { isSuspended: true }, 'step'));
R.push(await braccio('infortunato', { injured: true, injuryWeeks: 4, injuryType: 'stiramento' }, 'step'));
R.push(await braccio('svincolato', { contractExpired: true }, 'step'));
R.push(await braccio('non-convocato', { coachTrust: 5 }, 'nonconv'));/* fiducia < 12 → calcCoachDecision «not_called» (src/08): il prompt lo ricalcola all'apertura */
const SC = WC || (WE ? 'coppa' : null);
if (SC) { R.push(await braccio('sano-coppa', {}, 'bottone', SC));
  R.push(await braccio('infortunato-coppa', { injured: true, injuryWeeks: 4, injuryType: 'stiramento' }, 'step', SC));
  R.push(await braccio('squalificato-coppa', { isSuspended: true }, 'bottone', SC)); }
if (process.env.CPM_JSON === '1') console.log(JSON.stringify({ settimana: W, R }, null, 1));

const g = (id) => R.find(r => r.id === id);
console.log(`PO-222 · settimana di lega W${W} · coppa ${WC ? 'W' + WC : 'iniettata in W' + WE}${ROSSO ? ' · ROSSO (__CPM_NO_SQ222)' : ''}`);
console.log('braccio              via      presenze  totali  storico  ultima voce');
for (const r of R) console.log(`${r.id.padEnd(20)} ${r.via.padEnd(8)} ${String(r.prima.matches + '→' + r.dopo.matches).padEnd(9)} ${String(r.prima.totalMatches + '→' + r.dopo.totalMatches).padEnd(7)} ${String(r.prima.histN + '→' + r.dopo.histN).padEnd(8)} ${JSON.stringify(r.dopo.ultima)}  [${String(r.azione).slice(0, 40)}]`);

for (const r of R) { ok(r.avanzata, `${r.id}: la settimana avanza (misura non cieca)`); ok(!r.errori.length, `${r.id}: nessun errore di pagina ${r.errori.join(' | ')}`); }
ok(g('sano').dM === 1 && g('sano').dT === 1, 'sano: presenza +1 (controllo)');
for (const id of ['squalificato', 'squalificato-banco']) {
  const r = g(id);
  ok(r.dM === 0 && r.dT === 0, `${id}: nessuna presenza (stagione ${r.dM >= 0 ? '+' : ''}${r.dM}, carriera ${r.dT >= 0 ? '+' : ''}${r.dT})`);
  ok(r.dopo.goals === r.prima.goals && r.dopo.assists === r.prima.assists, `${id}: nessun gol/assist accreditato`);
  ok(!!(r.dopo.ultima && r.dopo.ultima.sq && r.dopo.ultima.rating == null), `${id}: voce di storico marcata «squalificato», senza voto`);
}
for (const id of ['squalificato', 'squalificato-banco']) ok(g(id).suspVivo, `${id}: squalifica viva prima della partita (misura non cieca)`);
ok(g('non-convocato').dM === 0 && g('non-convocato').dT === 0 && !!(g('non-convocato').dopo.ultima || {}).nc, 'non convocato (bottone): nessuna presenza, voce marcata «nonConvocato»');
if (g('sano-coppa')) {
  ok(g('sano-coppa').dM === 1 && g('sano-coppa').dopo.ultima && g('sano-coppa').dopo.ultima.cup, 'coppa sano: presenza +1 e voce di coppa (controllo)');
  ok(g('infortunato-coppa').dM === 0 && g('infortunato-coppa').dT === 0 && (g('infortunato-coppa').dopo.ultima || {}).rating == null, 'coppa infortunato: nessuna presenza, voce senza voto');
  ok(g('squalificato-coppa').dM === 0 && !!(g('squalificato-coppa').dopo.ultima || {}).sq, 'coppa squalificato: nessuna presenza, voce marcata');
} else ok(false, 'nessuna gara di coppa misurabile');
ok(!g('squalificato').dopo.susp, 'squalificato (bottone): squalifica scontata dopo la partita');
ok(g('infortunato').dM === 0 && g('svincolato').dM === 0, 'infortunato/svincolato: nessuna presenza (non-regressione)');

console.log(righe.join('\n'));
console.log(guasti.length ? `\n✗ ROSSO squalifica-222: ${guasti.length} controlli falliti` : '\n✅ VERDE squalifica-222');
await browser.close(); srv.close();
process.exit(guasti.length ? 1 : 0);
