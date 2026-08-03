/* [7.314.0] GUARDIANO PERMANENTE — LA CLASSIFICA E IL NOME VENGONO DALLA STESSA RIGA

   Collaudo PO: «è il Cesenate Primavera, è sbagliato: è la prima squadra in sofferenza!»
   (screenshot: «Il FC Cesenate Primavera è nei guai — 16° posto»).

   CAUSA: i club giovanili EREDITANO l'id del club senior (`U18_CLUBS` = `{...c, n:'<nome> Primavera'}`),
   quindi la ricerca per id trovava la riga della PRIMA SQUADRA — il 16° posto era il suo — ma la frase
   stampava il nome preso dallo storico di carriera, cioè quello della Primavera. Posizione di uno, nome
   dell'altro: la stessa classe del 7.71 (la lettera d'addio che citava la Primavera al posto del senior).

   Il test verifica la proprietà: il nome citato è quello del club di cui si sta citando il piazzamento.

     node exclub-name-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

/* classifica a 18: l'ex club (id 'ces') e' 16° → zona «nei guai» (pos >= len-2) */
const ROWS = [];
for (let i = 0; i < 18; i++) ROWS.push({ id: 'x' + i, n: 'Club ' + i, pts: 60 - i * 3, gf: 30, ga: 20, played: 20 });
ROWS[15] = { id: 'ces', n: 'FC Cesenate', pts: 15, gf: 12, ga: 30, played: 20 };

const SAVE = {
  name: 'Test Ex Nome', nation: 'Italia', avatarId: 0, age: 26, position: 'ATT', foot: 'R',
  season: 11, week: 12, weekLived: 12, proStatus: 'pro',
  club: { id: 'tat', n: 'Torino Athletic', a: 'TAT', p: 84, c: '#1f2937', c2: '#ffffff', nat: '🇮🇹', lg: 'Lega A' },
  contract: { years: 3, wage: 1200000 },
  stats: { velocità: 88, tecnica: 88, fisico: 82, mentalità: 85, tiro: 90, passaggio: 84, dribbling: 84, posizionamento: 88 },
  ovr: 92, form: 89, morale: 100, fatigue: 46, coachTrust: 85, popularity: 80, value: 60,
  goals: 12, assists: 6, matches: 11, matchHistory: [], log: [], diary: [],
  /* lo storico porta il nome GIOVANILE, con l'id del club senior — esattamente il save del proprietario */
  history: [{ season: 1, club: 'FC Cesenate Primavera', clubId: 'ces', goals: 14, assists: 5, matches: 30, ovr: 62 }],
  totalGoals: 120, totalAssists: 55, totalMatches: 260, playedMd: { s: 11, md: [] },
  calendar: [], standings: ROWS,
};

const page = await b.newPage();
await page.setViewportSize({ width: 430, height: 940 });
await installCdnRoutes(page);
page.on('pageerror', e => errs.push(e.message.slice(0, 160)));
await page.addInitScript(s => { try { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify({ player: s, savedAt: Date.now(), version: 9 })); localStorage.setItem('cpm-intro-seen', '1'); } catch (e) { } }, SAVE);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'domcontentloaded' });
await sleep(2600);
try { await page.getByText(/continua|riprendi/i).first().click({ timeout: 4000 }); } catch (e) { }
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 }).catch(() => { });
await sleep(1600);
/* ⚠️ terza volta che ci inciampo (7.210 · 7.313): una classifica sintetica NON sopravvive alla riconciliazione
   in migration, che la ricostruisce col pool REALE della lega. Quindi si legge la classifica vera, si prende
   la penultima riga — quella in zona «nei guai» — e si finge che LEI sia il club giovanile dove l'eroe e'
   cresciuto: nome con «Primavera», id del senior. E' esattamente la forma del save del proprietario. */
const EX = await page.evaluate(() => {
  const st = [...((window.__CPM_CAREER.get ? window.__CPM_CAREER.get() : {}).standings || [])].sort((a, b) => (b.pts || 0) - (a.pts || 0));
  if (st.length < 6) return null;
  const r = st[st.length - 2];
  return { id: r.id || r.clubId, n: r.n || r.name };
});
if (!EX) errs.push('classifica non leggibile dopo la migrazione');
else await page.evaluate(ex => window.__CPM_CAREER.patch({
  history: [{ season: 1, club: ex.n + ' Primavera', clubId: ex.id, goals: 14, assists: 5, matches: 30, ovr: 62 }], worldSeen: null,
}), EX);
await sleep(400);
/* l'evento «Il mondo fuori» e' UNO di un pool scelto per settimana: si scorrono le settimane finche' esce
   quello del club dove sei cresciuto (nessuna forzatura della logica — solo il calendario che avanza). */
let body = await page.evaluate(() => document.body.innerText || '');
for (let w = 3; w <= 37 && !/è nei guai|vola/.test(body); w++) {
  await page.evaluate(wk => window.__CPM_CAREER.patch({ week: wk, worldSeen: null }), w);
  await sleep(300);
  body = await page.evaluate(() => document.body.innerText || '');
}

let fails = 0;
const say = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✅' : '❌'} ${msg}`); };

const guai = /è nei guai/.test(body);
say(guai, `la card «il club dove sei cresciuto» è a schermo: ${guai}`);
if (guai) {
  const riga = (body.split('\n').find(l => /è nei guai/.test(l)) || '').trim();
  say(!/Primavera/i.test(riga), `il nome citato NON è quello giovanile: «${riga}»`);
  say(!!EX && riga.indexOf(EX.n) >= 0, `il nome citato è quello della riga di classifica (${EX && EX.n}): «${riga}»`);
} else {
  console.log('   nota: la card non è comparsa — il test non può misurare (evento dietro cancelli seedati)');
}
try { await page.screenshot({ path: 'out/exclub-name.png', fullPage: true }); } catch (e) { }

if (errs.length) { console.log('❌ pageerror:', errs.slice(0, 3).join(' | ')); fails++; }
console.log(fails ? `\n❌ FAIL — ${fails}` : `\n✅ PASS — piazzamento e nome vengono dalla stessa riga di classifica`);
await b.close(); srv.close();
process.exit(fails ? 2 : 0);
