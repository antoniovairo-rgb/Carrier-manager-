#!/usr/bin/env node
/* GUARDIANO DI MISURA — DI QUANTO DIVERGONO LE QUATTRO VERSIONI DELLA STESSA PARTITA.

   DA DOVE VIENE. Direttiva PO sulla Match Experience: «la simulazione deve essere la SINGLE SOURCE OF
   TRUTH; cronaca, 3D, highlight e statistiche devono rappresentare lo stesso evento reale». L'audit ha
   misurato che quel principio non e' violato — non esiste: il gioco non ha un modello di eventi, ha
   QUATTRO generatori che raccontano la stessa partita senza consultarsi, e QUATTRO rappresentazioni di
   «cosa e' successo» scritte in punti diversi (`MATCH_TL`, `matchEvents`, il feed della cronaca,
   `mStats`).

   COSA GIUDICA — E COSA NO. Questo NON asserisce che tutto torni: asserisce di aver MISURATO. Il numero
   che stampa e' la BASELINE di F1, quella contro cui F3 dovra' dimostrare di aver raddrizzato il verso.
   Un rimedio senza il numero di partenza non si puo' ri-misurare, ed e' il motivo per cui questa fase
   esiste prima di toccare qualsiasi cosa.

   I TRE CONFRONTI, tutti a fine partita vera (autoplay a seed fisso, fino al fischio):
     1. GOL: quanti ne ha registrati il libro mastro, contro il TABELLONE. Sono lo stesso fatto scritto in
        due posti da quattro percorsi diversi (micro-simulatore · riga di cronaca · highlight dell'eroe ·
        palla ferma), e il libro mastro dice anche QUALE percorso ha segnato.
     2. GOL RACCONTATI: quante righe di cronaca portano `ef` di gol, contro i gol del libro mastro. Qui
        vive il verso invertito che l'audit ha misurato: oggi certe righe di cronaca NON commentano un
        gol, lo FANNO.
     3. TIRI DICHIARATI DAL TESTO: la somma di `ms.shots`/`ms.oppShots` che le righe di cronaca si portano
        dietro — 56 righe su 188 spostano il box-score. E' la misura di quanto le statistiche dipendono
        dal testo invece che dalla simulazione.

   ⚠️ LA FASE SI LEGGE DA `__CPM_PHASE` (helper `matchPhase`), MAI da `__CPM_STATE`: quest'ultima la
   espone dalle props del 3D, e `show3D` non include `ended` — a partita finita resta congelata e la
   sonda aspetta per sempre. Tre sonde ci sono gia' cascate (7.494, 7.495).

   ⚠️ IL TABELLONE SI LEGGE DA `__CPM_SCORE`, che sopravvive al fischio finale. Leggerlo dal 3D avrebbe
   la stessa malattia.

   PROVA DEL ROSSO: `__CPM_NOEV` spegne la registrazione. Il libro mastro resta vuoto e il guardiano deve
   diventare CIECO (exit 2) — e' il modo in cui una sonda di MISURA dimostra di leggere davvero cio' che
   dice di leggere, invece di stampare zeri convincenti.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node event-ledger-test.mjs [CPM_ROSSO=1]                 */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep, matchPhase } from './lib/harness.mjs';

const ROSSO = !!process.env.CPM_ROSSO;
const PARTITE = +(process.env.CPM_PARTITE || 3);
const TETTO_MS = +(process.env.CPM_TETTO || 240000);

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const errs = [];

async function partita(seed) {
  const page = await b.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 110)));
  await page.addInitScript(r => { window.__CPM_GLB = false; window.__CPM_TXT487 = null; if (r) window.__CPM_NOEV = 1; }, ROSSO);
  try {
    /* ⚠️ IL NOME CAMBIA LA PARTITA, il seed dell'autoplay cambia solo le SCELTE. La prima stesura di
       questo guardiano variava solo il secondo e otteneva tre partite identiche (14 eventi · 1 gol · 2
       tiri, tre volte): stava misurando una partita sola, credendo di misurarne tre. */
    await openMatch(page, port, { skipLoadAll: true, name: 'Ledger' + seed });
    await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 350 }), seed);
    const t0 = Date.now(); let finita = false;
    while (Date.now() - t0 < TETTO_MS) {
      await sleep(500);
      const ph = await matchPhase(page);
      if (ph === 'ended' || ph === 'ceremony') { finita = true; break; }
    }
    const d = await page.evaluate(() => ({
      ev: (window.__CPM_EV ? window.__CPM_EV() : []),
      txt: window.__CPM_TXT487 || [],
      score: (window.__CPM_SCORE ? window.__CPM_SCORE() : null)
    }));
    return { ...d, finita };
  } catch (e) { return { ev: [], txt: [], score: null, finita: false }; }
  finally { await page.close().catch(() => {}); }
}

const giri = [];
for (let i = 0; i < PARTITE; i++) giri.push(await partita(1000 + i * 37));
await b.close(); srv.close();

console.log(`\n=== LIBRO MASTRO DEGLI EVENTI · baseline F1${ROSSO ? ' · PROVA DEL ROSSO (__CPM_NOEV)' : ''} ===`);

let evTot = 0, scarti = 0, valide = 0;
const perSrc = {};
for (let i = 0; i < giri.length; i++) {
  const g = giri[i];
  const gol = g.ev.filter(e => e.ev === 'goal');
  const cron = g.ev.filter(e => e.ev === 'chronicle');
  evTot += g.ev.length;
  for (const x of gol) perSrc[x.src || '?'] = (perSrc[x.src || '?'] || 0) + 1;

  const tab = g.score ? (g.score.home || 0) + (g.score.away || 0) : null;
  const golRaccontati = (g.txt || []).filter(t => t.ef === 'team_goal' || t.ef === 'opp_goal').length;
  const tiriDaTesto = cron.reduce((a, c) => a + (c.shots || 0) + (c.oppShots || 0), 0);

  const ok = g.finita && tab != null;
  if (ok) valide++;
  const dGol = (tab == null) ? null : gol.length - tab;
  if (dGol) scarti++;

  console.log(`\n  partita ${i + 1}${g.finita ? '' : ' ⚠ non arrivata al fischio'}`);
  console.log(`    eventi registrati    ${String(g.ev.length).padStart(4)}  (${gol.length} gol · ${cron.length} righe di cronaca)`);
  console.log(`    gol libro mastro     ${String(gol.length).padStart(4)}  contro tabellone ${tab == null ? '—' : tab}${dGol ? `  ❌ scarto ${dGol > 0 ? '+' : ''}${dGol}` : '  ✅'}`);
  console.log(`    gol raccontati       ${String(golRaccontati).padStart(4)}  (righe di cronaca con ef di gol)`);
  console.log(`    tiri dichiarati      ${String(tiriDaTesto).padStart(4)}  dal TESTO delle righe, non dalla simulazione`);
}

console.log(`\n  gol per percorso: ${Object.keys(perSrc).length ? Object.entries(perSrc).map(([k, v]) => `${k} ${v}`).join(' · ') : '—'}`);
console.log(`  partite valide: ${valide}/${giri.length} · eventi totali registrati: ${evTot}`);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);

/* ⚠️ un guardiano che non ha registrato nulla non e' verde, e' cieco — ed e' esattamente cio' che deve
   succedere sotto `__CPM_NOEV`, altrimenti la prova del rosso non proverebbe niente. */
if (!evTot || !valide) {
  console.log('\n❌ CIECO: nessun evento registrato (o nessuna partita arrivata al fischio) — non c\'e\' misura');
  if (ROSSO) { console.log('✅ prova del rosso riuscita: senza la registrazione il libro mastro e\' vuoto e il guardiano se ne accorge'); process.exit(0); }
  process.exit(2);
}
if (ROSSO) { console.log('\n❌ PROVA DEL ROSSO FALLITA: col registro spento il guardiano ha misurato lo stesso'); process.exit(2); }
console.log(`\n✅ baseline misurata su ${valide} partite${scarti ? ` · ⚠ ${scarti} con scarto gol libro-mastro↔tabellone: e' il verso invertito, ed e' il numero che F3 dovra' abbattere` : ' · gol allineati al tabellone'}`);
