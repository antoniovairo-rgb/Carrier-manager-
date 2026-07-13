#!/usr/bin/env node
/* [7.31.0] PROBE — RIGORI 3D nelle coppe pareggiate (direttiva PO): partita di COPPA reale → al 90' in
   pareggio (forzato via __CPM_SO_FORCE) parte la fase «shootout» con overlay CALCI DI RIGORE; la serie
   procede (reveal ✓/✗), l'esito del banner COMBACIA con koShootoutWin (stesso seed della risoluzione in
   CareerApp) e il post-partita committa il turno coerente (passato/eliminato). Controprova: in campionato
   il pareggio NON apre i rigori. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (patch) => ({ phase: 'career', player: { name: 'Rigori Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 12, weekLived: true, age: 24, ovr: 80, tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' }, drawSeen: 4, coachPactSeason: 4, bondEv: { s: 4, w: 11 }, sponsorDecl: { tier: 'tecnico', season: 4 }, matches: 8, goals: 5,
  cup: { active: true, round: 2, eliminated: false, champion: false, results: [{ round: 1, name: 'Sedicesimi', opponent: 'FC Rovigo', homeScore: 2, awayScore: 0, won: true }] },
  calendar: [{ matchday: 992, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null, type: 'cup', competition: 'Coppa Nazionale', cupRound: 2, cupRoundName: 'Ottavi' }],
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 70, fatigue: 10, morale: 68, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 520, height: 940 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 150)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  return page;
};
const click = (page, rx) => page.evaluate((x) => { const r = new RegExp(x, 'i'); const el = [...document.querySelectorAll('button,a,[role=button]')].find(e => r.test((e.textContent || '').trim()) && e.offsetParent !== null); if (el) { el.click(); return (el.textContent || '').slice(0, 26); } return null; }, rx);
const toPlaying = async (page) => {
  await click(page, '^CONTINUA'); await sleep(1100);
  await click(page, 'Gioca vs|Gioca partita|Gioca'); await sleep(1100);
  await click(page, 'Gioca la partita'); await sleep(1600);
  await click(page, 'Formazioni'); await sleep(1400);
  await click(page, 'Entra in campo|ENTRA|Scendi in campo|In campo'); await sleep(1200);
  await click(page, 'Salta'); await sleep(900);
  await page.waitForFunction(() => window.__CPM_PHASE && ['playing', 'hl_intro', 'hl_move', 'hl_choose'].includes(window.__CPM_PHASE()), null, { timeout: 30000 });
};

// (1) COPPA pareggiata → shootout 3D → esito coerente col motore → commit coerente
{
  const pg = await boot(mkSave({}));
  await toPlaying(pg);
  const expWon = await pg.evaluate(() => { const p = JSON.parse(localStorage.getItem('cpm-v3')).player; return koShootoutWin(p, 'cupko|' + (p.season || 1) + '|' + (p.cup?.round || 1)); });
  const forced = await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  if (!forced) issues.push('__CPM_SO_FORCE non disponibile/fallito');
  await sleep(1200);
  const st0 = await pg.evaluate(() => window.__CPM_SO_STATE && window.__CPM_SO_STATE());
  console.log('(1) dopo force:', JSON.stringify(st0), '· esito atteso (motore):', expWon);
  if (!st0 || st0.phase !== 'shootout') issues.push('fase shootout non raggiunta: ' + JSON.stringify(st0));
  if (st0 && st0.won !== expWon) issues.push(`esito serie (${st0.won}) ≠ koShootoutWin (${expWon})`);
  const ovl = await pg.evaluate(() => /CALCI DI RIGORE/i.test(document.body.innerText));
  if (!ovl) issues.push('overlay CALCI DI RIGORE assente');
  // lascia correre 3 rigori (reveal visibili), screenshot, poi salta la serie
  let sawReveal = false, sawKicker = false;
  for (let t = 0; t < 16; t++) {
    const s = await pg.evaluate(() => ({ st: window.__CPM_SO_STATE && window.__CPM_SO_STATE(), goal: /GOOOL!|PARATO!|FUORI!/.test(document.body.innerText), kick: /sul dischetto…/.test(document.body.innerText) }));
    if (s.goal) sawReveal = true; if (s.kick) sawKicker = true;
    if (s.st && s.st.step >= 5) break;
    await sleep(800);
  }
  await pg.screenshot({ path: 'out/shootout-live.png' });
  console.log('(1) suspense kicker:', sawKicker, '· reveal visto:', sawReveal);
  if (!sawKicker) issues.push('riga «sul dischetto…» mai vista');
  if (!sawReveal) issues.push('reveal GOOOL/PARATO/FUORI mai visto');
  await click(pg, 'Salta la serie'); await sleep(600);
  const stD = await pg.evaluate(() => window.__CPM_SO_STATE && window.__CPM_SO_STATE());
  const banner = await pg.evaluate(() => { const m = document.body.innerText.match(/PASSI IL TURNO!|ELIMINATI AI RIGORI|DAL DISCHETTO ALLA GLORIA/); return m ? m[0] : null; });
  console.log('(1) done:', stD && stD.done, '· banner:', banner);
  if (!stD || !stD.done) issues.push('skip serie non arrivato al banner finale');
  if (expWon && banner !== 'PASSI IL TURNO!') issues.push('banner incoerente con la vittoria: ' + banner);
  if (!expWon && banner !== 'ELIMINATI AI RIGORI') issues.push('banner incoerente con l\'eliminazione: ' + banner);
  await pg.screenshot({ path: 'out/shootout-banner.png' });
  // attende ended → continua → commit coerente in CareerApp
  await pg.waitForFunction(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended', null, { timeout: 20000 });
  const fin = await pg.evaluate(() => /ai rigori|rig\./i.test(document.body.innerText));
  console.log('(1) fischio finale cita i rigori:', fin);
  const _btns = await pg.evaluate(() => [...document.querySelectorAll('button,a,[role=button]')].filter(e => e.offsetParent !== null).map(e => (e.textContent || '').trim().slice(0, 28)).slice(0, 12));
  console.log('(1) bottoni a ended:', JSON.stringify(_btns));
  await click(pg, 'Continua|Vai avanti|Torna|Fine|→'); await sleep(2600);
  await click(pg, 'Continua|Chiudi|→'); await sleep(1800);
  const p = await pg.evaluate(() => JSON.parse(localStorage.getItem('cpm-v3')).player);
  const cupOk = expWon ? (p.cup && !p.cup.eliminated && (p.cup.round || 0) >= 3) : (p.cup && p.cup.eliminated === true);
  console.log('(1) commit coppa coerente:', cupOk, '· round:', p.cup && p.cup.round, '· eliminated:', p.cup && p.cup.eliminated);
  if (!cupOk) issues.push('commit coppa incoerente con l\'esito della serie: ' + JSON.stringify(p.cup));
  await pg.close();
}
// (2) CONTROPROVA — pareggio in CAMPIONATO: niente rigori, dritto a ended
{
  const pg = await boot(mkSave({ cup: null, calendar: [{ matchday: 12, week: 12, opponentId: 'inter', opponentName: 'FC Internazionale', isHome: true, played: false, result: null }] }));
  await toPlaying(pg);
  await pg.evaluate(() => window.__CPM_SO_FORCE && window.__CPM_SO_FORCE());
  await sleep(1400);
  const st = await pg.evaluate(() => window.__CPM_SO_STATE && window.__CPM_SO_STATE());
  console.log('(2) campionato → fase:', st && st.phase);
  if (!st || st.phase === 'shootout') issues.push('rigori partiti su un pareggio di CAMPIONATO');
  if (st && st.phase !== 'ended' && st.phase !== 'ceremony') issues.push('pareggio di campionato non arrivato a ended: ' + (st && st.phase));
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ RIGORI 3D OK (coppa → serie+banner coerenti col motore + commit · campionato → nessuna serie)');
process.exit(issues.length ? 1 : 0);
