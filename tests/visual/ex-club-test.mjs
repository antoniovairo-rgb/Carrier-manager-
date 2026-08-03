/* [7.313.0] GUARDIANO PERMANENTE — IL PRE-PARTITA DICE CHE È CONTRO LA EX SQUADRA

   Collaudo PO: «dovrebbe specificare per dare maggiore pathos che è contro la ex squadra»
   (screenshot: girone di Korward Champions Cup, nessun riferimento al passato dell'eroe).

   Il gioco SAPEVA già di questa storia — l'arco «Il ritorno da ex» (7.14.0) la racconta nel diario — ma
   solo per le gare di CAMPIONATO e solo sulla dashboard: la schermata che precede la partita, cioè
   l'unico momento in cui quella tensione conta, non ne diceva nulla.

   Il test verifica la proprietà, non l'implementazione:
     1. se l'avversario è nella storia dell'eroe, il pre-partita lo dichiara (fascia + badge) con i numeri VERI;
     2. controprova: con un avversario mai frequentato la fascia NON compare (niente falsi positivi);
     3. vale anche fuori dal campionato (il caso del proprietario era una coppa europea).

     node ex-club-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

const SAVE = ({ history, type }) => ({
  name: 'Test Ex', nation: 'Italia', avatarId: 0, age: 27, position: 'ATT', foot: 'R',
  season: 6, week: 12, weekLived: 12, proStatus: 'pro',
  club: { id: 'par', n: 'FC Partenope', a: 'PRT', p: 78, c: '#38bdf8', c2: '#0c4a6e', nat: '🇮🇹', lg: 'Lega A' },
  contract: { years: 3, wage: 900000 },
  stats: { velocità: 82, tecnica: 82, fisico: 78, mentalità: 78, tiro: 84, passaggio: 78, dribbling: 78, posizionamento: 80 },
  ovr: 82, form: 72, morale: 72, fatigue: 18, coachTrust: 75, popularity: 60, value: 30,
  goals: 6, assists: 3, matches: 11, matchHistory: [], history, log: [], diary: [],
  totalGoals: 60, totalAssists: 30, totalMatches: 180, playedMd: { s: 6, md: [] },
  calendar: [{ matchday: 12, week: 12, opponentId: 'tor', opponentName: 'Torino Athletic', isHome: false, played: false, result: null, ...(type ? { type, competition: 'Korward Champions Cup' } : {}) }],
  standings: [],
});

/* ⚠️ lezione 7.210: un avversario sintetico non sopravvive alla riparazione del calendario in migration —
   sul primo tentativo la gara di CAMPIONATO veniva ri-puntata su un altro club e il test misurava un'altra
   partita. Ora si legge l'avversario REALMENTE servito e si inietta LUI nello storico dell'eroe. */
const openPrematch = async (save, { exFromServed = false, storia = null } = {}) => {
  const page = await b.newPage();
  await page.setViewportSize({ width: 430, height: 940 });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  await page.addInitScript(s => { try { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify({ player: s, savedAt: Date.now(), version: 9 })); localStorage.setItem('cpm-intro-seen', '1'); } catch (e) { } }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded' });
  await sleep(2600);
  try { await page.getByText(/continua|riprendi/i).first().click({ timeout: 4000 }); } catch (e) { }
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 }).catch(() => { });
  await sleep(900);
  if (exFromServed) {
    const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
    if (!md) { errs.push('nessuna gara servita'); }
    else await page.evaluate(([opp, st]) => window.__CPM_CAREER.patch({ history: st.map(h => ({ ...h, club: opp.opp, clubId: null })) }), [md, storia]);
    await sleep(400);
  }
  await page.evaluate(() => { try { window.__CPM_CAREER.playMatch && window.__CPM_CAREER.playMatch(); } catch (e) { } });
  await sleep(2200);
  const body = await page.evaluate(() => document.body.innerText || '');
  return { page, body };
};

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

/* 1. avversario che l'eroe ha vestito: 3 stagioni, 120 presenze, 41 gol */
const STORIA = [
  { season: 2, club: 'Torino Athletic', clubId: 'tor', goals: 11, assists: 4, matches: 34, ovr: 72 },
  { season: 3, club: 'Torino Athletic', clubId: 'tor', goals: 14, assists: 6, matches: 43, ovr: 76 },
  { season: 4, club: 'Torino Athletic', clubId: 'tor', goals: 16, assists: 5, matches: 43, ovr: 79 },
];
const A = await openPrematch(SAVE({ history: STORIA, type: null }), { exFromServed: true, storia: STORIA });
const hasEx = /RITORNO DA EX/i.test(A.body), hasBadge = /EX SQUADRA/i.test(A.body);
const numeriOk = /3 stagioni/.test(A.body) && /120 presenze/.test(A.body) && /41 gol/.test(A.body);
say(hasEx && hasBadge, `campionato — la fascia «IL RITORNO DA EX» e il badge ci sono (fascia ${hasEx} · badge ${hasBadge})`);
say(numeriOk, `i numeri sono quelli VERI dello storico (3 stagioni · 120 presenze · 41 gol): ${numeriOk}`);
try { await A.page.screenshot({ path: 'out/ex-club-prematch.png', fullPage: true }); } catch (e) { }
await A.page.close();

/* 2. controprova: nessun passato con quel club → niente fascia */
const B = await openPrematch(SAVE({ history: [{ season: 2, club: 'FC Cesenate', clubId: 'ces', goals: 9, assists: 3, matches: 30, ovr: 70 }], type: null }));
say(!/RITORNO DA EX/i.test(B.body) && !/EX SQUADRA/i.test(B.body), 'controprova — con un avversario mai frequentato la fascia NON compare');
await B.page.close();

/* 3. il caso del proprietario: coppa europea, non campionato */
const C = await openPrematch(SAVE({ history: STORIA, type: 'euro_group' }));
say(/RITORNO DA EX/i.test(C.body), 'coppa europea — la fascia compare anche fuori dal campionato');
await C.page.close();

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — il pre-partita dichiara la ex squadra, coi numeri veri, in ogni competizione`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
