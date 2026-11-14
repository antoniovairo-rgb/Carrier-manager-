#!/usr/bin/env node
/* [giro 182 · PO-379 «i 3 compagni dello spogliatoio dove li ha pescati?»] GUARDIANO spogliatoio-182.
   Foto del PO (Primavera): Simone Napolitano, Zeno Vallone e Ivan Ratti nello spogliatoio, nessuno dei tre nella «Rosa 24»
   mostrata sopra. Causa misurata: alla creazione i compagni nascono con club:null (rosa finta «U18»), e syncTeammateNames
   (src/08) usciva subito con proStatus «u18» → in Primavera non venivano mai riallineati alla rosa vera.
   Sul gioco vero (?cpmtest=1) giudica, per Primavera e professionista:
   1. dopo il caricamento (migratePlayer vero, al montaggio di CareerApp) i 3 nomi dello spogliatoio sono TUTTI nella rosa che il
      pannello «Rosa» mostra (generateTeamRoster(club, stagione), la stessa sorgente del pannello);
   2. archetipi e legame restano quelli del salvataggio;
   3. migrazione idempotente: rimigrare il giocatore gia' migrato non cambia nulla (changed=false, compagni identici).
   Braccio rosso: CPM_ROSSO182=1 accende __CPM_NO_G182_SPOG → il guardiano DEVE uscire 1. «Non giudicato» = rosso.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node spogliatoio-182.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO182 === '1';
const fails = [], oks = [];
const ok = (c, m) => { (c ? oks : fails).push(m); console.log((c ? '  ✓ ' : '  ✗ ') + m); };
const AP = { campDone: true, presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true };
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
let giudicati = 0;
async function caso(nome, costruisci) {
  console.log(nome);
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => typeof window.__CPM_MIGRATE === 'function', null, { timeout: 60000 });
  /* il salvataggio come lo produce il gioco: compagni pescati alla CREAZIONE (club null) */
  const save = await page.evaluate(costruisci);
  await page.evaluate(([pl, rosso]) => { if (rosso) window.__CPM_NO_G182_SPOG = 1; localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: pl })); }, [save, ROSSO]);
  await page.addInitScript((rosso) => { window.__CPM_GLB = false; if (rosso) window.__CPM_NO_G182_SPOG = 1; }, ROSSO);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(1500);
  const r = await page.evaluate((prima) => {
    const st = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const p = st && st.player; if (!p) return { err: 'salvataggio assente' };
    const ros = generateTeamRoster(p.club || {}, p.season || 1).map(x => x.name);
    const tm = p.teammates || [];
    const fuori = tm.filter(t => !ros.includes(t.name)).map(t => t.name);
    const archOk = tm.length === prima.length && tm.every((t, i) => t.archetype === prima[i].archetype && t.bond === prima[i].bond);
    const m2 = window.__CPM_MIGRATE(p);
    const idem = !m2.changed || JSON.stringify(m2.player.teammates) === JSON.stringify(tm);
    return { n: tm.length, nomi: tm.map(t => t.name), prima: prima.map(t => t.name), fuori, archOk, idem, idemChanged: m2.changed, ros: ros.length };
  }, save.teammates);
  if (r.err) { ok(false, `${nome}: non giudicato (${r.err})`); await page.close(); return; }
  console.log(`    prima: ${r.prima.join(', ')} · dopo: ${r.nomi.join(', ')} · rosa ${r.ros}`);
  ok(r.n === 3, `${nome}: 3 compagni nello spogliatoio (${r.n})`);
  ok(r.n === 3 && r.fuori.length === 0, `${nome}: tutti nella rosa mostrata (fuori: ${r.fuori.join(', ') || 'nessuno'})`);
  ok(r.archOk, `${nome}: archetipi e legame conservati`);
  ok(r.idem, `${nome}: migrazione idempotente (seconda passata changed=${r.idemChanged})`);
  ok(errors.length === 0, `${nome}: zero errori di pagina ${errors.slice(0, 2).join(' | ')}`);
  giudicati++;
  await page.close();
}
try {
  await caso('1) Primavera — compagni pescati alla creazione (club null)', () => {
    const club = U18_CLUBS[0];
    const base = { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, season: 1, week: 3, weekLived: false, age: 17, position: 'Attaccante',
      stats: { 'velocità': 60, tecnica: 60, fisico: 60, 'mentalità': 60, tiro: 60, passaggio: 60, dribbling: 60, posizionamento: 60 }, ovr: 60, form: 70, morale: 70, fatigue: 0,
      coachTrust: 60, popularity: 20, contract: { duration: 1, wage: 577, expiresAtSeason: 2 }, matchHistory: [], u18Seasons: 0, campDone: true, presidentModalSeason: 1, jerseyNumSeason: 1,
      drawSeen: 1, mercatoSeen: 1, presentSeason: 1, tutorialDone: true };
    const tm = generateTeammates({ ...base, club: null }).map((t, i) => ({ ...t, bond: 40 + i * 7 }));
    return { ...base, club, teammates: tm };
  });
  await caso('2) Primavera, seconda stagione — compagni della stagione 1', () => {
    const club = U18_CLUBS[3];
    const base = { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, season: 2, week: 5, weekLived: false, age: 18, position: 'Attaccante',
      stats: { 'velocità': 62, tecnica: 62, fisico: 62, 'mentalità': 62, tiro: 62, passaggio: 62, dribbling: 62, posizionamento: 62 }, ovr: 62, form: 70, morale: 70, fatigue: 0,
      coachTrust: 60, popularity: 20, contract: { duration: 1, wage: 577, expiresAtSeason: 3 }, matchHistory: [], u18Seasons: 1, campDone: true, presidentModalSeason: 2, jerseyNumSeason: 2,
      drawSeen: 2, mercatoSeen: 2, presentSeason: 2, tutorialDone: true };
    const tm = generateTeammates({ ...base, season: 1 }).map((t, i) => ({ ...t, bond: 55 + i }));
    return { ...base, club, teammates: tm };
  });
  await caso('3) Professionista — compagni di una stagione vecchia', () => {
    const club = CLUBS.find(c => c.lg === 'Lega A') || CLUBS[0];
    const base = { name: 'Max Blond', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 4, weekLived: false, age: 21, position: 'Attaccante',
      stats: { 'velocità': 70, tecnica: 70, fisico: 70, 'mentalità': 70, tiro: 70, passaggio: 70, dribbling: 70, posizionamento: 70 }, ovr: 70, form: 70, morale: 70, fatigue: 0,
      coachTrust: 70, popularity: 30, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, matchHistory: [], u18Seasons: 1, bankBalance: 50000, campDone: true,
      presidentModalSeason: 3, jerseyNumSeason: 3, drawSeen: 3, mercatoSeen: 3, presentSeason: 3, tutorialDone: true };
    const tm = generateTeammates({ ...base, club, season: 1 }).map((t, i) => ({ ...t, bond: 70 - i * 9 }));
    return { ...base, club, teammates: tm };
  });
} catch (e) { ok(false, 'eccezione: ' + String(e && e.message || e).slice(0, 300)); }
await browser.close(); srv.close();
if (giudicati < 3) ok(false, `casi giudicati ${giudicati}/3: non giudicato = rosso`);
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G182_SPOG] ' : ''}spogliatoio-182: ${fails.length ? 'ROSSO' : 'VERDE'} (${oks.length} ok · ${fails.length} ko)`);
process.exit(fails.length ? 1 : 0);
