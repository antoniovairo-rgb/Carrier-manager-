#!/usr/bin/env node
/* [7.15.0] TEST — BUG PESANTE «ottavi di finale mai giocati»: la transizione girone→KO della Coppa Europea
   di club deve avvenire su TUTTI i path che risolvono la 6ª gara del girone (helper condiviso euroGroupKOPatch).
   (1) path SIMULA (simulateAndAdvance via __CPM_CAREER.step): 5/6 → sim 6ª → phase r16 + R16 in calendario;
   (2) HEAL migration: save GIÀ zombie (6/6, phase group, 18pt) → al load phase r16 + R16 schedulato;
   (3) eliminato (0pt, ultimo) → phase eliminated, nessun R16;
   (4) determinismo: stesso save → stesso avversario/sede;
   (5) niente spazio (week 37) → chiusura onesta senza voce oltre W37;
   (6) dedup: R16 già in calendario → nessun duplicato. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const groupOpps = [{ id: 'x1', n: 'FC Lusitano', a: 'LUS', p: 78, nat: '🇵🇹' }, { id: 'x2', n: 'SC Flandria', a: 'FLA', p: 71, nat: '🇧🇪' }, { id: 'x3', n: 'FC Anatolia', a: 'ANA', p: 74, nat: '🇹🇷' }];
const grWin = (i) => ({ opp: groupOpps[i % 3].n, oppCol: '#333', home: i % 2 === 0, won: true, drew: false, hs: 2, as: 0 });
const grLoss = (i) => ({ opp: groupOpps[i % 3].n, oppCol: '#333', home: i % 2 === 0, won: false, drew: false, hs: 0, as: 2 });
const egCal = (playedN, wStart = 21) => Array.from({ length: 6 }, (_, i) => ({ matchday: 950 + i, week: wStart + i * 2, opponentId: groupOpps[i % 3].id, opponentName: groupOpps[i % 3].n, isHome: i % 2 === 0, played: i < playedN, result: i < playedN ? { homeScore: 2, awayScore: 0, won: true, drew: false } : null, type: 'euro_group', competition: 'UEL', opponentData: groupOpps[i % 3] }));
const mkSave = (patch) => ({ phase: 'career', player: { name: 'KO Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 31, weekLived: true, age: 23, ovr: 80, tutorialDone: true, campDone: true, drawSeen: 4,
  euro: { active: true, competition: 'UEL', phase: 'group', pts: 15, groupResults: Array.from({ length: 5 }, (_, i) => grWin(i)), qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0, groupOpponents: groupOpps },
  calendar: egCal(5),
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 80, tecnica: 79, fisico: 78, 'mentalità': 80, tiro: 82, passaggio: 79, dribbling: 81, posizionamento: 80 },
  form: 74, morale: 72, fatigue: 12, contract: { duration: 3, wage: 12000, expiresAtSeason: 7 }, ...patch } });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
  await sleep(1200);
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  return page;
};
const euroState = (page) => page.evaluate(() => window.__CPM_CAREER.euro());

// ───── (1) PATH SIMULA: 5/6 giocate, 6ª in settimana → step() la simula → r16 + R16 in calendario
{
  const pg = await boot(mkSave({}));
  let st = await euroState(pg);
  if (st.phase !== 'group' || st.gr !== 5) issues.push(`setup sim: atteso group/5, trovato ${st.phase}/${st.gr}`);
  const res = await pg.evaluate(() => window.__CPM_CAREER.step());
  await sleep(1300);
  await pg.evaluate(() => window.__CPM_CAREER.dismiss());
  st = await euroState(pg);
  console.log('(1) SIMULA 6ª gara:', res, '→', JSON.stringify(st));
  if (st.phase !== 'r16') issues.push(`path SIMULA: fase attesa r16 dopo la 6ª gara, trovata ${st.phase} (ZOMBIE!)`);
  if (!st.koCal.some(k => k.ph === 'r16' && k.w <= 37)) issues.push('path SIMULA: voce R16 non schedulata in calendario');
  const _log = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); return (s.player.log || []).slice(0, 4).join(' | '); });
  if (!/OTTAVI/i.test(_log)) issues.push('path SIMULA: voce Notizie della qualificazione assente');
  await pg.close();
}
// ───── (2) HEAL MIGRATION: save GIÀ zombie (6/6, group, 18pt) → al load r16 + R16 schedulato
{
  const pg = await boot(mkSave({ euro: { active: true, competition: 'UEL', phase: 'group', pts: 18, groupResults: Array.from({ length: 6 }, (_, i) => grWin(i)), qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0, groupOpponents: groupOpps }, calendar: egCal(6), week: 33 }));
  const st = await euroState(pg);
  console.log('(2) HEAL zombie:', JSON.stringify(st));
  if (st.phase !== 'r16') issues.push(`HEAL: fase attesa r16 su save zombie, trovata ${st.phase}`);
  if (!st.koCal.some(k => k.ph === 'r16' && k.w >= 34 && k.w <= 37)) issues.push('HEAL: R16 non schedulato (o week fuori range): ' + JSON.stringify(st.koCal));
  await pg.close();
}
// ───── (3) ELIMINATO: 6/6 tutte perse (0pt, ultimo del girone) → eliminated, nessun R16
{
  const pg = await boot(mkSave({ euro: { active: true, competition: 'UEL', phase: 'group', pts: 0, groupResults: Array.from({ length: 6 }, (_, i) => grLoss(i)), qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0, groupOpponents: groupOpps }, calendar: egCal(6).map(m => ({ ...m, result: { homeScore: 0, awayScore: 2, won: false, drew: false } })), week: 33 }));
  const st = await euroState(pg);
  console.log('(3) eliminato:', JSON.stringify(st));
  if (st.phase !== 'eliminated') issues.push(`eliminato: fase attesa eliminated, trovata ${st.phase}`);
  if (st.koCal.length) issues.push('eliminato: R16 schedulato per errore');
  await pg.close();
}
// ───── (4) DETERMINISMO: stesso save zombie caricato 2 volte → stesso avversario/sede
{
  const runOnce = async () => { const pg = await boot(mkSave({ euro: { active: true, competition: 'UEL', phase: 'group', pts: 18, groupResults: Array.from({ length: 6 }, (_, i) => grWin(i)), qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0, groupOpponents: groupOpps }, calendar: egCal(6), week: 33 })); const st = await euroState(pg); await pg.close(); return st.koCal[0] || null; };
  const a = await runOnce(); const b = await runOnce();
  console.log('(4) determinismo:', JSON.stringify(a), JSON.stringify(b));
  if (!a || !b || a.opp !== b.opp || a.home !== b.home || a.w !== b.w) issues.push('R16 non deterministico: ' + JSON.stringify([a, b]));
}
// ───── (5) NIENTE SPAZIO (week 37) → chiusura onesta: fase r16 ma NESSUNA voce oltre W37
{
  const pg = await boot(mkSave({ euro: { active: true, competition: 'UEL', phase: 'group', pts: 18, groupResults: Array.from({ length: 6 }, (_, i) => grWin(i)), qualified: false, champion: false, eliminated: false, koResults: [], koRound: 0, groupOpponents: groupOpps }, calendar: egCal(6, 25), week: 37 }));
  const st = await euroState(pg);
  console.log('(5) niente spazio:', JSON.stringify(st));
  if (st.phase === 'group') issues.push('niente spazio: fase rimasta group (zombie)');
  if (st.koCal.some(k => k.w > 37)) issues.push('niente spazio: voce oltre W37 schedulata: ' + JSON.stringify(st.koCal));
  await pg.close();
}
// ───── (6) DEDUP: R16 già in calendario → l'helper non duplica (via hook diretto)
{
  const pg = await boot(mkSave({}));
  const dup = await pg.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player;
    const done = { ...p, euro: { ...p.euro, pts: 18, groupResults: Array.from({ length: 6 }, () => ({ opp: 'X', won: true, drew: false, hs: 2, as: 0 })) }, calendar: [...p.calendar.map(m => ({ ...m, played: true })), { matchday: 995, week: 35, opponentId: 'zz', opponentName: 'ZZ', isHome: true, played: false, result: null, type: 'euro', euroPhase: 'r16' }] };
    const k = window.__CPM_CAREER.euroGroupKOPatch(done);
    return { phase: k && k.euro && k.euro.phase, addedCal: !!(k && k.calendar) };
  });
  console.log('(6) dedup:', JSON.stringify(dup));
  if (dup.phase !== 'r16') issues.push('dedup: fase attesa r16, trovata ' + dup.phase);
  if (dup.addedCal) issues.push('dedup: voce R16 DUPLICATA con una già in calendario');
  await pg.close();
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ EURO KO ZOMBIE OK (sim-path · heal · eliminato · determinismo · clamp W37 · dedup)');
process.exit(issues.length ? 1 : 0);
