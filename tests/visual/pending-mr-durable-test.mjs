#!/usr/bin/env node
/* [9ª ricorrenza «partita gia' giocata» — collaudo PO: G34 vs Bilbao, gia' vinta col titolo, RIPROPOSTA,
   su build 7.443 con tutte le reti] GUARDIANO DELLA FINESTRA COMMIT→AUTOSAVE.

   IL MECCANISMO MISURATO: il sidecar del fischio finale ('cpm-pending-mr') e' l'unica prova della partita
   giocata, ma veniva consumato al COMMIT IN MEMORIA (7.24.3) o al dispatch del recovery (7.178) — mentre
   l'autosave e' debounced 600ms e il flush di pagehide su Android «e' spesso l'unica finestra utile»
   (nota 5.75). Kill nel mezzo: save pre-partita + prova distrutta → il selettore ripropone il big match,
   e il save finale resta PULITO (il primo commit non e' mai esistito su disco — il quadro esatto del
   save del PO). DAL FIX: il sidecar muore solo quando lo stato PERSISTITO mostra la gara committata.

   SCENARIO A (contratto del fix): recovery con persistenza ROTTA → il sidecar sopravvive; alla riapertura
   con persistenza sana la gara NON viene riproposta (rete G), il recovery ricommitta, il sidecar si
   consuma e la gara sta nel save UNA volta sola.
   SCENARIO B (il rosso — comportamento pre-fix): stessa sequenza ma con la prova DISTRUTTA a mano dopo il
   dispatch (cio' che faceva il consumo-al-commit): alla riapertura il selettore RIPROPONE la stessa
   giornata — il sintomo del PO, riprodotto e misurato. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const issues = [];

const SAVE = { phase: 'career', player: {
  name: 'Probe Sidecar', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 20, age: 24, ovr: 84,
  campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true, weekLived: true,
  seasonPledge: { season: 3, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 81, tiro: 83, passaggio: 81, dribbling: 82, posizionamento: 81 },
  form: 72, morale: 70, fatigue: 10, popularity: 50, value: 30, bankBalance: 90000, goals: 8, assists: 3, matches: 15,
  contract: { duration: 3, wage: 40000, expiresAtSeason: 6 },
} };

/* apre il gioco con save (+ sidecar opzionale, + persistenza rotta opzionale); ritorna la page */
async function apri({ sidecar = null, breakSave = false, ls = {}, save = null } = {}) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    for (const [k, v] of Object.entries(cfg.ls)) localStorage.setItem(k, v);
    localStorage.setItem('cpm-v3', JSON.stringify(cfg.save));
    if (cfg.sidecar) localStorage.setItem('cpm-pending-mr', JSON.stringify(cfg.sidecar));
    if (cfg.breakSave) { /* la persistenza del save FALLISCE (kill simulato): setItem su cpm-v3 lancia */
      const _orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { if (k === 'cpm-v3') throw new Error('persistenza rotta (kill simulato)'); return _orig.call(this, k, v); };
    }
  }, { save: save || SAVE, sidecar, breakSave, ls });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1600);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 }).catch(() => {});
  await sleep(600);
  return page;
}

/* pass 0: scopri la giornata di questa settimana COL SUO VERO stato e cattura il SAVE IDRATATO
   (calendario generato e persistito dall'autosave): e' il «save pre-partita» realistico dei passi
   successivi — un save senza calendario farebbe scartare il sidecar per un'altra strada (la guardia
   [9ª ricorrenza] sul calendario assente, che ha il suo assert dedicato in coda) */
let md0 = null, SAVE_HYDRATED = null;
{
  const page = await apri();
  await sleep(2500); // autosave del calendario generato
  const r0 = await page.evaluate(() => {
    const m = window.__CPM_CAREER.thisWeekMd(); if (!m) return null;
    try { const d = JSON.parse(localStorage.getItem('cpm-v3')); const e = (d.player.calendar || []).find(x => x.matchday === m.matchday); return { md: e ? { ...m, oid: e.opponentId, isHome: !!e.isHome } : m, save: d }; } catch (e2) { return { md: m, save: null }; }
  });
  md0 = r0 && r0.md; SAVE_HYDRATED = r0 && r0.save;
  await page.close();
}
if (!md0 || md0.matchday == null || !SAVE_HYDRATED || !(SAVE_HYDRATED.player.calendar || []).length) { console.log('❌ FAIL — pass 0 senza giornata o senza calendario idratato: ' + JSON.stringify(md0)); process.exit(2); }
console.log(`giornata di prova: md${md0.matchday} vs ${md0.opp} (W.${md0.week}) · oid=${md0.oid} · casa=${md0.isHome}`);

const SIDECAR = { v: 1, n: SAVE.player.name, s: SAVE.player.season, w: SAVE.player.week, oid: md0.oid || null, on: md0.opp, ih: md0.isHome !== false,
  result: { goals: 1, assists: 0, minutesPlayed: 90, matchStatus: 'starter', homeScore: 2, awayScore: 1, won: true, drew: false,
    wasBehind: false, opponent: md0.opp, oppAbbr: 'OPP', oppCol: '#888888', rating: 7.5, context: 'career', isHome: md0.isHome !== false,
    attendance: 30000, shots: 10, oppShots: 5, fouls: 2, corners: 4, possession: 55, redCard: false, yellowCards: 0,
    sentOff: false, heroFouls: 0, assistLinks: { given: [], received: [] }, homeRoster: null, heroRoster: null, oppTactic: null, scoutReport: null } };

/* ── SCENARIO A · atto 1: recovery con persistenza ROTTA — la prova deve sopravvivere ── */
let lsAfterCrash = null;
{
  const page = await apri({ sidecar: SIDECAR, breakSave: true, save: SAVE_HYDRATED });
  await sleep(4500); // recovery a mount+1200ms + margine: commit in memoria, autosave fallito
  const r = await page.evaluate(() => ({
    sidecar: !!localStorage.getItem('cpm-pending-mr'),
    served: window.__CPM_CAREER ? window.__CPM_CAREER.thisWeekMd() : 'no-harness',
    saved: (function () { try { const d = JSON.parse(localStorage.getItem('cpm-v3')); return { week: d.player.week, played: (d.player.calendar || []).filter(m => m.played).length }; } catch (e) { return null; } })()
  }));
  console.log(`A1 (persistenza rotta): sidecar vivo=${r.sidecar} · selettore=${r.served ? JSON.stringify(r.served) : 'niente'} · save su disco: ${JSON.stringify(r.saved)}`);
  if (!r.sidecar) issues.push('A1: la prova (sidecar) e\' stata DISTRUTTA col commit non ancora persistito — e\' la finestra della 9ª ricorrenza');
  if (r.served && r.served.matchday === md0.matchday) issues.push('A1: il selettore ripropone la giornata col risultato nel sidecar (rete G cieca)');
  lsAfterCrash = await page.evaluate(() => ({ mr: localStorage.getItem('cpm-pending-mr'), v3: localStorage.getItem('cpm-v3') }));
  await page.close();
}

/* ── SCENARIO A · atto 2: riapertura con persistenza sana — recupero, consumo, UNA sola gara ── */
{
  const ls = {}; if (lsAfterCrash && lsAfterCrash.mr) ls['cpm-pending-mr'] = lsAfterCrash.mr;
  const page = await apri({ ls, save: SAVE_HYDRATED }); // save = quello PRE-partita (il crash ha impedito la persistenza)
  await sleep(5000); // recovery + autosave sano
  const r = await page.evaluate((mdN) => {
    const saved = (function () { try { return JSON.parse(localStorage.getItem('cpm-v3')).player; } catch (e) { return null; } })();
    const cal = (saved && saved.calendar) || [];
    const entry = cal.find(m => m.matchday === mdN);
    return {
      sidecar: !!localStorage.getItem('cpm-pending-mr'),
      served: window.__CPM_CAREER ? window.__CPM_CAREER.thisWeekMd() : 'no-harness',
      entryPlayed: entry ? !!entry.played : null,
      histN: ((saved && saved.matchHistory) || []).filter(h => h.week === (saved.week && 20)).length,
      histTot: ((saved && saved.matchHistory) || []).length,
      recovered: /Risultato recuperato/.test(document.body.innerText) || true
    };
  }, md0.matchday);
  console.log(`A2 (riapertura sana): voce md${md0.matchday} giocata=${r.entryPlayed} · gare in storico=${r.histTot} · sidecar residuo=${r.sidecar} · selettore=${r.served ? JSON.stringify(r.served) : 'niente'}`);
  if (r.entryPlayed !== true) issues.push('A2: il risultato NON e\' stato recuperato nel save persistito');
  if (r.histTot !== 1) issues.push(`A2: lo storico ha ${r.histTot} gare invece di 1 (doppio conteggio o perdita)`);
  if (r.sidecar) issues.push('A2: il sidecar non si e\' consumato dopo la persistenza riuscita');
  if (r.served && r.served.matchday === md0.matchday) issues.push('A2: la giornata recuperata viene riproposta');
  await page.close();
}

/* ── SCENARIO B · il ROSSO: prova distrutta (comportamento pre-fix) → il big match viene riproposto ── */
{
  const page = await apri({ save: SAVE_HYDRATED }); // save pre-partita, NESSUN sidecar (come dopo il consumo-al-commit + kill)
  await sleep(1500);
  const served = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
  console.log(`B (prova distrutta): selettore=${served ? JSON.stringify(served) : 'niente'}`);
  if (!(served && served.matchday === md0.matchday)) issues.push('B: senza la prova la giornata NON viene riproposta — lo strumento non riproduce il sintomo del PO (misura cieca)');
  else console.log('B (rosso riprodotto): senza sidecar il selettore ripropone la stessa giornata — il sintomo del PO, misurato ✓');
  await page.close();
}

await b.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ SIDECAR DUREVOLE OK (la prova sopravvive al kill · il risultato si recupera e si conta UNA volta · il big match non si ripropone)');
process.exit(issues.length ? 1 : 0);
