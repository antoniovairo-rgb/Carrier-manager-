/* [7.327.0] TEST MASSIVO — IL «MALEDETTO BUG» NON PUO' PIU' RIPETERSI
   (direttiva PO dopo l'8ª ricorrenza: «fai un test massivo su questa eventualita', non voglio piu' che si
   ripeta, e' un bug gravissimo!»)

   Attacca la catena COMMIT → SIDECAR → RECOVERY → SERVE in ogni combinazione che sappiamo produrre o
   aver prodotto il loop «partita gia' giocata»:

   A. MATRICE 48 combinazioni (deterministica, pagina pulita per ognuna):
        delta settimana {0,+1,+2} × chiavi sidecar {oid+on, solo oid, solo on, legacy senza chiavi}
        × stato voce {non giocata, gia' giocata} × nome nel risultato {esatto, variante}
      Invariante per ogni combo:
        · voce NON giocata e sidecar attribuibile (per id, per nome-chiave o per nome-risultato esatto)
          → DEVE essere committata: voce marcata, sidecar consumato, gol accreditati UNA volta;
        · voce GIA' giocata → il sidecar si scarta SENZA doppio conteggio (gol invariati);
        · in NESSUN caso, dopo il boot, getThisWeekMatchday riserve quella giornata;
        · zero pageerror.
      Confine accettato e dichiarato: sidecar LEGACY (senza chiavi) + nome in forma variante = risultato
      NON attribuibile a nessuna voce → scarto. Puo' capitare solo a un sidecar scritto da un build
      precedente; tutti i sidecar nuovi portano le chiavi ricche.

   B. CASI AVVERSARIALI: sidecar di un altro giocatore · di un'altra stagione · JSON malformato ·
      GEMELLA DI SEDE SBAGLIATA (ih=true ma in calendario resta solo la gemella away: NON va committata
      la partita sbagliata) · doppia gemella (home+away non giocate: committa SOLO la home).

   Gli altri anelli della difesa hanno i loro guardiani dedicati (dup-fixture: HEAL 1-4 · playedmd-registry:
   registro persistente · career-invariants). Questo test copre l'anello che le 8 ricorrenze hanno
   dimostrato essere l'ultimo a cedere: la prova del fischio finale.

     node loop-mass-test.mjs
*/
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = []; let scanned = 0;

const RESULT_BASE = { goals: 2, assists: 0, homeScore: 2, awayScore: 0, won: true, drew: false, wasBehind: false, opponent: 'FC Pisano', oppAbbr: 'PIS', oppCol: '#0a5', rating: 8.2, context: 'career', isHome: true, attendance: 12000, oppTactic: null, scoutReport: null, homeRoster: [], heroRoster: [], shots: 5, oppShots: 2, fouls: 1, corners: 3, possession: 58 };

const mkSave = (opts = {}) => ({ phase: 'career', player: {
  name: 'Loop Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12 + (opts.weekDelta || 0), weekLived: true, age: 23, ovr: 80,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4,
  goals: 5, matches: 8, matchHistory: [],
  calendar: opts.calendar || [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: !!opts.played, result: opts.played ? { homeScore: 2, awayScore: 0, won: true, drew: false } : null }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 72, fatigue: 10, morale: 70, contract: { duration: 3, wage: 9000, expiresAtSeason: 7 } } });

const boot = async (save, sidecarRaw, tag) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push(`pageerror[${tag}]: ` + String(e.message).slice(0, 120)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o.save)); if (o.sc != null) localStorage.setItem('cpm-pending-mr', o.sc); }, { save, sc: sidecarRaw });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(900);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) { }
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 }).catch(() => { });
  /* attesa SU CONDIZIONE, non a tempo fisso: il recovery dispatcha a +1200ms e nei casi a settimana
     ri-allineata c'e' un hop di setPlayer in piu' prima del commit — un'attesa fissa corta legge lo stato
     a meta' (34 falsi «risultato buttato» alla prima stesura, tutti a w+1/w+2). */
  await page.waitForFunction(() => !localStorage.getItem('cpm-pending-mr'), null, { timeout: 15000 }).catch(() => { });
  await sleep(1600); /* flush autosave dopo il commit */
  return page;
};
const state = (page) => page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('cpm-v3')).player;
  const md = (p.calendar || []).find(m => m.matchday === 11);
  const twinAway = (p.calendar || []).find(m => m.matchday === 25);
  let served = null; try { served = window.__CPM_CAREER && window.__CPM_CAREER.thisWeekMd && window.__CPM_CAREER.thisWeekMd(); } catch (e) { }
  return { played: !!(md && md.played), goals: p.goals, week: p.week, sidecar: !!localStorage.getItem('cpm-pending-mr'),
    twinAwayPlayed: !!(twinAway && twinAway.played), servedMd: served ? served.matchday : null };
});

/* ── A. MATRICE 48 ── */
console.log('── A. matrice 48 combinazioni ──');
for (const weekDelta of [0, 1, 2]) {
  for (const keys of ['oid+on', 'oid', 'on', 'legacy']) {
    for (const played of [false, true]) {
      for (const nameForm of ['esatto', 'variante']) {
        scanned++;
        const tag = `w+${weekDelta}/${keys}/${played ? 'giocata' : 'nuova'}/${nameForm}`;
        const result = { ...RESULT_BASE, opponent: nameForm === 'esatto' ? 'FC Pisano' : 'Pisano' };
        const sc = { v: 1, n: 'Loop Probe', s: 4, w: 12, result };
        if (keys.includes('oid')) sc.oid = 'pis';
        if (keys.includes('on')) sc.on = 'FC Pisano';
        if (keys !== 'legacy') sc.ih = true;
        /* il commit e' atteso quando la voce e' NUOVA e il sidecar e' attribuibile */
        const attribuibile = keys !== 'legacy' || nameForm === 'esatto';
        const expectCommit = !played && attribuibile;
        const pg = await boot(mkSave({ weekDelta, played }), JSON.stringify(sc), tag);
        const st = await state(pg); await pg.close();
        if (expectCommit) {
          if (!st.played) issues.push(`[${tag}] risultato BUTTATO: voce non committata — il maledetto loop`);
          if (st.goals !== 7) issues.push(`[${tag}] gol attesi 7 (5+2), trovati ${st.goals}`);
        } else if (played) {
          if (st.goals !== 5) issues.push(`[${tag}] DOPPIO CONTEGGIO su voce gia' giocata: gol ${st.goals}`);
        }
        if (st.sidecar) issues.push(`[${tag}] sidecar non consumato/ripulito`);
        if (st.servedMd === 11 && (st.played || expectCommit)) issues.push(`[${tag}] GIORNATA RISERVITA dal CTA dopo il commit`);
      }
    }
  }
}
console.log(`   ${scanned} combo verificate`);

/* ── B. AVVERSARIALI ── */
console.log('── B. casi avversariali ──');
const advCases = [
  { tag: 'altro giocatore', sc: JSON.stringify({ v: 1, n: 'ALTRO', s: 4, w: 12, oid: 'pis', result: RESULT_BASE }), expect: (st) => !st.played && st.goals === 5 && !st.sidecar },
  { tag: 'altra stagione', sc: JSON.stringify({ v: 1, n: 'Loop Probe', s: 3, w: 12, oid: 'pis', result: RESULT_BASE }), expect: (st) => !st.played && st.goals === 5 && !st.sidecar },
  { tag: 'JSON malformato', sc: '{corrotto###', expect: (st) => !st.played && st.goals === 5 },
  { tag: 'gemella di sede sbagliata', calendar: [{ matchday: 25, week: 25, opponentId: 'pis', opponentName: 'FC Pisano', isHome: false, played: false, result: null }],
    sc: JSON.stringify({ v: 1, n: 'Loop Probe', s: 4, w: 12, oid: 'pis', on: 'FC Pisano', ih: true, result: RESULT_BASE }),
    expect: (st) => !st.twinAwayPlayed && st.goals === 5 },
  { tag: 'doppia gemella: committa solo la home', calendar: [
      { matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: true, played: false, result: null },
      { matchday: 25, week: 25, opponentId: 'pis', opponentName: 'FC Pisano', isHome: false, played: false, result: null }],
    sc: JSON.stringify({ v: 1, n: 'Loop Probe', s: 4, w: 12, oid: 'pis', on: 'FC Pisano', ih: true, result: RESULT_BASE }),
    expect: (st) => st.played && !st.twinAwayPlayed && st.goals === 7 && !st.sidecar },
];
for (const c of advCases) {
  const pg = await boot(mkSave({ calendar: c.calendar }), c.sc, c.tag);
  const st = await state(pg); await pg.close();
  const ok = c.expect(st);
  console.log(`   ${ok ? '✅' : '❌'} ${c.tag}: ${JSON.stringify(st)}`);
  if (!ok) issues.push(`[avversariale: ${c.tag}] stato inatteso ${JSON.stringify(st)}`);
  scanned++;
}

await browser.close(); srv.close();
console.log(`\nscenari totali: ${scanned}`);
issues.slice(0, 20).forEach(i => console.log('  ✗', i));
console.log(issues.length ? `\n❌ FAIL — ${issues.length} violazioni` : '\n✅ PASS — 53 scenari: il risultato del fischio finale non si perde MAI, nessun doppio conteggio, nessuna giornata riservita');
process.exit(issues.length ? 2 : 0);
