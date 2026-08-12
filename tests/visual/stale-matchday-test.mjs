#!/usr/bin/env node
/* [7.418.0] GUARDIANO — LA PARTITA GIA' GIOCATA NON SI RIGIOCA, DA NESSUN PATH
   (collaudo PO «di nuovo il bug della partita gia' giocata! risolvi definitivamente, e' grave» —
    8ª ricorrenza della classe)

   LA LEZIONE: sette reti (A→G) accumulate in sei release vivevano DENTRO getThisWeekMatchday, cioe'
   proteggevano solo il path del VIVO. Ma «Simula» e «Avanza» pescavano dal calendario GREZZO
   (`find(week && !played)`): una gemella stantia che il vivo rifiutava veniva RISIMULATA, ricontata
   in classifica e storico — ed e' cosi' che lo stato tornava incoerente e il bug riaffiorava.
   Ora il rilevatore e' UNO (_isStaleMd, puro) e lo usano tutti e tre i selettori, con la rete nuova
   (H): la giornata N di lega si gioca con N-1 gare in classifica — se la mia riga dice played ≥ N,
   la voce e' stantia qualunque campo un desync abbia sporcato.

   COSA MISURA: il rilevatore puro su NOVE scenari costruiti — sei avvelenati (ciascuno con UNA sola
   spia sporca: gemella marcata per settimana / per avversario+sede / per numero giornata / storico
   con 2 gare / storico stessa settimana / SOLO la classifica che dice played ≥ N) che DEVONO essere
   flaggati, e tre legittimi (ritorno a sedi invertite / giornata futura / coppa attiva) che NON
   devono. La prova del rosso e' lo scenario (H): prima del fix nessuna rete lo copriva.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node stale-matchday-test.mjs                            */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript(() => {
  window.__CPM_GLB = false;
  const save = { phase: 'career', player: {
    name: 'Anti Replay', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 20, age: 24, ovr: 82,
    club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
    stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 81, tiro: 83, passaggio: 81, dribbling: 82, posizionamento: 81 },
    form: 72, morale: 70, fatigue: 10, popularity: 50, value: 30, bankBalance: 90000,
    contract: { duration: 3, wage: 40000, expiresAtSeason: 6 },
  } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.staleMd), { timeout: 20000 });

const R = await page.evaluate(() => {
  const C = window.__CPM_CAREER;
  /* base pulita: stagione 3, 18 squadre, 10 giornate in classifica, storico coerente */
  const base = {
    season: 3, week: 11,
    club: { id: 'mad', n: 'CF Madrid', p: 88 },
    calendar: [
      { week: 10, matchday: 10, opponentName: 'FC Catalunya', opponentId: 'cat', isHome: true, played: true },
      { week: 11, matchday: 11, opponentName: 'FC Balear', opponentId: 'bal', isHome: false, played: false },
    ],
    matchHistory: [{ season: 3, week: 10, opponent: 'FC Catalunya', isHome: true }],
    standings: Array.from({ length: 18 }, (_, i) => ({ id: i === 0 ? 'mad' : 'c' + i, n: i === 0 ? 'CF Madrid' : 'Club ' + i, played: 10, pts: 15 })),
    playedMd: { s: 3, md: [10] },
  };
  const md = (o) => ({ week: 11, matchday: 11, opponentName: 'FC Catalunya', opponentId: 'cat', isHome: true, played: false, ...o });
  const out = {};
  /* — AVVELENATI: ogni scenario lascia sporca UNA SOLA spia — */
  /* gemella nel calendario: stessa settimana di una giocata */
  out.twinWeek = C.staleMd({ ...base, matchHistory: [], standings: [], playedMd: null }, md({ week: 10, matchday: 12 }));
  /* gemella per avversario+sede gia' giocata */
  out.twinSide = C.staleMd({ ...base, matchHistory: [], standings: [], playedMd: null }, md({ week: 12, matchday: 13 }));
  /* stesso numero di giornata gia' marcato in calendario */
  out.twinMdNum = C.staleMd({ ...base, matchHistory: [], standings: [], playedMd: null }, md({ week: 12, matchday: 10, opponentName: 'FC Basco', opponentId: 'bas', isHome: false }));
  /* lo storico ha gia' DUE gare di lega con quel club */
  out.hist2 = C.staleMd({ ...base, calendar: [], standings: [], playedMd: null, matchHistory: [{ season: 3, week: 3, opponent: 'FC Catalunya' }, { season: 3, week: 12, opponent: 'FC Catalunya' }] }, md({ week: 14, matchday: 14 }));
  /* lo storico ha la gara di QUESTA settimana con quel club */
  out.histWk = C.staleMd({ ...base, calendar: [], standings: [], playedMd: null }, md({ week: 10, matchday: 12, isHome: false }));
  /* (H) SOLO LA CLASSIFICA: nessuna gemella, storico vuoto, registro vuoto — ma la tabella dice 10 giocate e la voce e' la giornata 9 */
  out.soloClassifica = C.staleMd({ ...base, calendar: [], matchHistory: [], playedMd: null }, md({ week: 12, matchday: 9, opponentName: 'FC Basco', opponentId: 'bas' }));
  /* registro persistente playedMd */
  out.registro = C.staleMd({ ...base, calendar: [], matchHistory: [], standings: [] }, md({ week: 12, matchday: 10, opponentName: 'FC Basco' }));
  /* — LEGITTIMI: non devono MAI essere flaggati — */
  /* il RITORNO: stesso avversario, sede OPPOSTA, giornata futura */
  out.ritorno = C.staleMd(base, md({ week: 25, matchday: 27, isHome: false }));
  /* la prossima giornata regolare */
  out.prossima = C.staleMd(base, md({ week: 11, matchday: 11, opponentName: 'FC Balear', opponentId: 'bal', isHome: false }));
  /* una coppa ATTIVA */
  out.coppaViva = C.staleMd({ ...base, cup: { active: true } }, { week: 11, matchday: 40, type: 'cup', opponentName: 'FC Cup', played: false });
  return out;
});
await b.close(); srv.close();

const attesi = { twinWeek: true, twinSide: true, twinMdNum: true, hist2: true, histWk: true, soloClassifica: true, registro: true, ritorno: false, prossima: false, coppaViva: false };
const guasti = [];
for (const [k, want] of Object.entries(attesi)) {
  const got = R[k];
  if (got !== want) guasti.push(`${k}: atteso ${want ? 'STANTIA' : 'legittima'}, avuto ${JSON.stringify(got)}`);
}
console.log('scenari: ' + Object.entries(R).map(([k, v]) => `${k}=${v}`).join(' · '));
if (guasti.length) { console.log(`\n❌ FAIL — ${guasti.length}`); guasti.forEach(g => console.log('  · ' + g)); process.exit(2); }
console.log('\n✅ PASS — la partita gia\' giocata non passa da nessuna porta, e le legittime passano tutte');
