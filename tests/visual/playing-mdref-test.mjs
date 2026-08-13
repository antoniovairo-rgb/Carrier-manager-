#!/usr/bin/env node
/* [P0 #3 — audit forense] IL RIFERIMENTO ALLA GARA APERTA NON DEVE SOPRAVVIVERE ALL'USCITA.
 *
 * ROOT CAUSE: `_playingMdRef` viene impostato da startMatch e descrive la gara di CLUB aperta. Veniva
 * azzerato SOLO da onMatchEnd, mentre l'uscita dal pre-partita (onQuit) e i return anticipati di
 * startMatch («non convocato», avversario non risolvibile) lo lasciavano carico. Il consumo in
 * onMatchEnd avveniva poi per QUALUNQUE fine partita, comprese quelle di Nazionale — che non passano da
 * startMatch. Catena: apro il pre-partita di campionato → torno indietro → gioco in Nazionale → il
 * commit registra come giocata una giornata di campionato mai disputata, e la bonifica la chiude.
 * Stagione a 33 su 34, senza che nulla lo segnali.
 *
 * Percorsi verificati (piano di messa in sicurezza, FASE 3):
 *   1 uscita dal pre-partita senza giocare → riferimento invalidato
 *   2 il calendario resta intatto dopo l'uscita (nessuna giornata marcata)
 *   3 riapertura del pre-partita dopo un'uscita → riferimento coerente con la gara vera
 *   4 partita realmente giocata → il commit continua a funzionare (regressione)
 *   5 nessuna giornata persa: il conto delle gare di campionato non cambia per un'uscita
 */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const guasti = [];

const SAVE = { phase: 'career', player: {
  name: 'Probe MdRef', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, age: 25, ovr: 82,
  campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4,
  tutorialDone: true, weekLived: true, seasonPledge: { season: 4, tone: 'equilibrato' },
  club: { id: 'mad', n: 'CF Madrid', a: 'CFM', p: 88, c: '#ffffff', c2: '#111111', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 82, tecnica: 82, fisico: 82, 'mentalità': 82, tiro: 82, passaggio: 82, dribbling: 82, posizionamento: 82 },
  form: 74, morale: 74, fatigue: 10, popularity: 50, value: 25, bankBalance: 90000, goals: 6, assists: 3, matches: 11,
  contract: { duration: 3, wage: 30000, expiresAtSeason: 8 } } };

async function apri(rompi = false) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => guasti.push('pageerror: ' + String(e.message).slice(0, 120)));
  await page.addInitScript(cfg => {
    window.__CPM_GLB = false;
    if (cfg.rompi) window.__CPM_NO_P0_3 = 1;   // ripristina il ciclo di vita difettoso (prova del rosso)
    localStorage.setItem('cpm-v3', JSON.stringify(cfg.sv));
  }, { sv: SAVE, rompi });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!(window.__CPM_CAREER && window.__CPM_CAREER.mdRef), { timeout: 20000 });
  await sleep(1200);
  return page;
}
/* apre il pre-partita come farebbe il giocatore: CTA «Gioca vs …» → modal → «Gioca la partita» */
const apriPrePartita = async (page) => {
  await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca vs/i.test(x.textContent || '')); if (b2) b2.click(); });
  await sleep(1500);
  await page.evaluate(() => { const b2 = Array.from(document.querySelectorAll('button')).find(x => /Gioca la partita/i.test(x.textContent || '')); if (b2) b2.click(); });
  await sleep(2500);
};
/* torna indietro dal pre-partita: e' il callback onQuit del bottone di ritorno */
const tornaIndietro = async (page) => {
  const ok = await page.evaluate(() => {
    const b2 = Array.from(document.querySelectorAll('button')).find(x => /^←|Torna|Indietro|Esci|Rimani in dashboard/i.test((x.textContent || '').trim()));
    if (b2) { b2.click(); return (b2.textContent || '').trim().slice(0, 20); } return null;
  });
  await sleep(1800); return ok;
};
const stato = (page) => page.evaluate(() => {
  const C = window.__CPM_CAREER; const g = C.get();
  let cal = null;
  try { const p = JSON.parse(localStorage.getItem('cpm-v3')).player;
    cal = { giocate: (p.calendar || []).filter(m => !m.type && m.played).length, tot: (p.calendar || []).filter(m => !m.type).length }; } catch (e) {}
  return { mdRef: C.mdRef(), week: g.week, matches: g.matches, screen: g.screen, cal };
});

/* ─────────── PROVA DEL ROSSO: col vecchio ciclo di vita il riferimento sopravvive all'uscita ─────────── */
{
  const page = await apri(true);
  const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
  await apriPrePartita(page);
  const dentro = await stato(page);
  await tornaIndietro(page);
  const fuori = await stato(page);
  await page.close();
  console.log(`ROSSO) con __CPM_NO_P0_3: gara ${md ? md.opp : '—'} · nel pre-partita ${dentro.mdRef ? 'riferimento CARICO' : 'nessuno'} → dopo l'uscita ${fuori.mdRef ? 'ANCORA CARICO — difetto riprodotto ✓' : 'invalidato'}`);
  if (!dentro.mdRef) guasti.push('(ROSSO) il pre-partita non ha nemmeno aperto la gara: lo scenario non è quello previsto');
  else if (fuori.mdRef) console.log('     (è la condizione che permetteva a una gara di Nazionale di committare una giornata di campionato)');
  else guasti.push('(ROSSO) l\'interruttore non riproduce il difetto: il guardiano non dimostra di proteggere nulla');
}

/* ─────────── 1+2: uscita dal pre-partita → riferimento invalidato, calendario intatto ─────────── */
{
  const page = await apri();
  const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
  const prima = await stato(page);
  await apriPrePartita(page);
  const dentro = await stato(page);
  const bott = await tornaIndietro(page);
  const dopo = await stato(page);
  await page.close();
  console.log(`\n1+2) gara della settimana: ${md ? md.opp : '—'} · uscita col bottone «${bott || '(non trovato)'}»`);
  console.log(`     riferimento: nel pre-partita ${dentro.mdRef ? 'md' + dentro.mdRef.matchday : 'nessuno'} → dopo l'uscita ${dopo.mdRef ? 'md' + dopo.mdRef.matchday + ' ✗' : 'nessuno ✓'}`);
  console.log(`     calendario di campionato: ${prima.cal && prima.cal.giocate} giocate → ${dopo.cal && dopo.cal.giocate} · presenze ${prima.matches} → ${dopo.matches}`);
  if (!dentro.mdRef) guasti.push('(1) il pre-partita non apre la gara: sonda cieca');
  if (dopo.mdRef) guasti.push('(1) IL RIFERIMENTO SOPRAVVIVE ALL\'USCITA dal pre-partita — è il P0');
  if (prima.cal && dopo.cal && dopo.cal.giocate !== prima.cal.giocate) guasti.push(`(2) il calendario è cambiato per una semplice uscita (${prima.cal.giocate} → ${dopo.cal.giocate})`);
  if (dopo.matches !== prima.matches) guasti.push(`(2) le presenze sono cambiate per una semplice uscita (${prima.matches} → ${dopo.matches})`);
}

/* ─────────── 3: riapertura dopo l'uscita → riferimento coerente con la gara vera ─────────── */
{
  const page = await apri();
  const md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd());
  await apriPrePartita(page); await tornaIndietro(page);
  await apriPrePartita(page);
  const s = await stato(page);
  await page.close();
  console.log(`\n3) riapertura dopo un'uscita → riferimento ${s.mdRef ? 'md' + s.mdRef.matchday : 'nessuno'} (gara vera md${md && md.matchday})`);
  if (!s.mdRef) guasti.push('(3) REGRESSIONE: dopo un\'uscita non si riesce piu\' ad aprire la gara');
  else if (md && s.mdRef.matchday !== md.matchday) guasti.push(`(3) riferimento incoerente: md${s.mdRef.matchday} invece di md${md.matchday}`);
}

/* ─────────── 4+5: partita realmente giocata → il commit continua a funzionare ─────────── */
{
  const page = await apri();
  const prima = await stato(page);
  const r = await page.evaluate(() => window.__CPM_CAREER.step());  // simula/gioca la settimana col path reale
  await sleep(3500);
  const dopo = await stato(page);
  await page.close();
  console.log(`\n4+5) settimana risolta col percorso reale (${r}): presenze ${prima.matches} → ${dopo.matches} · gare di campionato giocate ${prima.cal && prima.cal.giocate} → ${dopo.cal && dopo.cal.giocate} · riferimento residuo ${dopo.mdRef ? 'SI ✗' : 'no ✓'}`);
  if (dopo.mdRef) guasti.push('(4) dopo il commit il riferimento resta carico');
  if (prima.cal && dopo.cal && dopo.cal.giocate <= prima.cal.giocate && r === 'simulated') guasti.push('(4) REGRESSIONE: la gara simulata non risulta committata nel calendario');
}

await b.close(); srv.close();
console.log(guasti.length ? `\n❌ FAIL — ${guasti.length}\n` + guasti.map(g => '  ✗ ' + g).join('\n')
  : '\n✅ CICLO DI VITA DEL RIFERIMENTO OK (si invalida uscendo · il calendario non cambia per un\'uscita · la partita giocata si committa ancora)');
process.exit(guasti.length ? 1 : 0);
