/* [7.312.0] GUARDIANO PERMANENTE — UNA GIORNATA GIÀ GIOCATA NON TORNA MAI PIÙ

   Collaudo PO, 7ª ricorrenza della stessa classe: «un'altra volta stesso bug. correggi definitivamente.
   le partite possono essere simulate, giocate NON deve più ricapitare. È grave» (screenshot: Lega A,
   GIORNATA 34 DI 34, gara già disputata riproposta).

   Le sei guardie precedenti (6.91 · 6.98 · 7.0.5 · 7.5.2 · 7.210 · 7.302) DEDUCONO che una gara è stata
   giocata da un altro campo: la voce di calendario marcata, il nome dell'avversario nello storico, la sede,
   la settimana, il conteggio in classifica. Basta che uno di quei campi non venga scritto perché l'intera
   catena sia cieca. L'unica rete che non deduceva nulla — `_committedMdRef` (6.73) — era un `useRef`:
   moriva a ogni riavvio dell'app, cioè proprio nel caso in cui serviva.

   Dal 7.312.0 il registro è un campo del salvataggio (`player.playedMd = {s, md[]}`), e questa probe lo
   verifica come PROPRIETÀ, non come implementazione:
     1. una giornata nel registro non viene più servita, anche se TUTTE le altre chiavi sono pulite
        (voce non marcata, storico vuoto, classifica a zero) — è il caso che nessuna guardia precedente vede;
     2. controprova: senza registro la stessa identica gara VIENE servita → il test non è vacuo;
     3. il registro è per STAGIONE: alla stagione successiva la stessa giornata torna legittima.

     node playedmd-registry-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

/* save sintetico: settimana 34, UNA voce di lega non giocata con matchday 34, storico VUOTO,
   classifica a zero → tutte le guardie 6.91→7.302 sono cieche per costruzione. */
const SAVE = (playedMd, season) => ({
  name: 'Test Registro', nation: 'Italia', avatarId: 0, age: 24, position: 'ATT', foot: 'R',
  season, week: 34, weekLived: 34, proStatus: 'pro',
  club: { id: 'par', n: 'FC Partenope', a: 'PRT', p: 70, c: '#38bdf8', c2: '#0c4a6e', nat: '🇮🇹', lg: 'Lega A' },
  contract: { years: 3, wage: 500000 }, stats: {}, ovr: 78, form: 70, morale: 70, fatigue: 20,
  coachTrust: 70, popularity: 50, value: 10, goals: 10, assists: 5, matches: 33,
  matchHistory: [], history: [], log: [], diary: [], totalGoals: 10, totalAssists: 5, totalMatches: 33,
  calendar: [{ matchday: 34, week: 34, opponentId: 'tor', opponentName: 'Torino Athletic', isHome: true, played: false, result: null }],
  standings: [], ...(playedMd ? { playedMd } : {}),
});

const boot = async (save) => {
  /* pagina NUOVA a ogni scenario: gli addInitScript si accumulano sulla stessa pagina e il secondo boot
     ripartiva dallo stato del primo (niente schermata Home, quindi niente CareerApp montata) */
  const page = await b.newPage();
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await page.addInitScript(s => { try { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify({ player: s, savedAt: Date.now(), version: 9 })); localStorage.setItem('cpm-intro-seen', '1'); } catch (e) { } }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded' });
  await sleep(2600);
  try { await page.getByText(/continua|riprendi/i).first().click({ timeout: 4000 }); } catch (e) { console.log('  (nessun bottone Continua)'); }
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.thisWeekMd), { timeout: 20000 }).catch(() => { });
  await sleep(900);
  const out = await page.evaluate(() => (window.__CPM_CAREER && window.__CPM_CAREER.thisWeekMd) ? window.__CPM_CAREER.thisWeekMd() : 'no-hook');
  await page.close();
  return out;
};

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

/* 2. CONTROPROVA per prima: senza registro la gara deve essere servita (altrimenti il test non misura nulla) */
const senza = await boot(SAVE(null, 5));
say(senza && senza !== 'no-hook' && senza.matchday === 34,
  `controprova — senza registro la giornata 34 VIENE servita: ${JSON.stringify(senza)}`);

/* 1. col registro la stessa identica gara non deve più uscire */
const con = await boot(SAVE({ s: 5, md: [34] }, 5));
say(con === null, `registro attivo — la giornata 34 NON viene più servita: ${JSON.stringify(con)}`);

/* 3. il registro è per stagione: alla stagione 6 la giornata 34 è di nuovo legittima */
const altraStag = await boot(SAVE({ s: 5, md: [34] }, 6));
say(altraStag && altraStag !== 'no-hook' && altraStag.matchday === 34,
  `registro per stagione — alla stagione successiva la giornata torna legittima: ${JSON.stringify(altraStag)}`);

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — una giornata committata non può essere riproposta, e il registro sopravvive al reload`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
