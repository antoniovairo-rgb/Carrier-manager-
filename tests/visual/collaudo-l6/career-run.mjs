// COLLAUDO L6 fase 1 (PO-153) — solo misura, nessuna modifica al gioco.
// Simula carriere × 10 stagioni sugli handler VERI (__CPM_CAREER.step/dismiss/startNewSeason),
// una pagina nuova per carriera, e scrive un JSON per carriera in docs/collaudi/dati-carriere-l6/.
// Uso: node career-run.mjs --ids=0,3,6 [--seasons=10]
import fs from 'fs';
import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from '../lib/harness.mjs';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const IDS = String(args.ids || '0').split(',').map(Number);
const SEASONS = Number(args.seasons || 10);
const OUT = path.join(ROOT, 'docs', 'collaudi', 'dati-carriere-l6');
fs.mkdirSync(OUT, { recursive: true });

const NATS = ['Italia', 'Spagna', 'Francia', 'Germania', 'Inghilterra', 'Portogallo', 'Brasile', 'Argentina', 'Olanda', 'Belgio'];
const ARCH = ['bomber', 'fantasista', 'velocista', 'trequartista', 'leader', 'centravanti', 'enfant', 'tuttocampista', 'dominatore', 'contropiede', 'pressing', 'fantasioso'];
const ROLES = ['Attaccante', 'Centrocampista', 'Difensore', 'Portiere'];
// club di partenza reali dal database CLUBS (righe 1152, 1278, 1363) + ovr di partenza
const TIERS = [
  { tag: 'debole', ovr: 60, club: { id: 'nub', n: 'FC Nürnberg', a: 'FCN', p: 48, c: '#dc2626', c2: '#f5f5f5', nat: '🇩🇪', lg: 'Deutsche Liga 2' } },
  { tag: 'media', ovr: 68, club: { id: 'gor', n: 'FC Deventer', a: 'DEV', p: 60, c: '#f59e0b', c2: '#dc2626', nat: '🇳🇱', lg: 'Liga Oranje' } },
  { tag: 'forte', ovr: 76, club: { id: 'juve', n: 'Torino Athletic', a: 'TAT', p: 95, c: '#f5f5f5', c2: '#0f0f0f', nat: '🇮🇹', lg: 'Lega A' } },
];
const cfgOf = k => { const t = TIERS[k % 3]; return { k, nation: NATS[k % 10], archetype: ARCH[k % 12], role: ROLES[k % 4], tier: t.tag, ovr: t.ovr, club: t.club, age: 17 + (k % 8), synthetic: true }; };
const pad = n => String(n).padStart(2, '0');

function saveFor(c) {
  const s = c.ovr;
  return { phase: 'career', player: { name: `Collaudo ${pad(c.k)}`, nation: c.nation, avatarId: 0, proStatus: 'pro', season: 1, week: 1, age: c.age, ovr: c.ovr, tutorialDone: true, archetype: c.archetype, position: c.role, foot: 'R',
    club: c.club, stats: { 'velocità': s, tecnica: s, fisico: s, 'mentalità': s, tiro: s, passaggio: s, dribbling: s, posizionamento: s },
    form: 70, morale: 72, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 5 } } };
}

// Riepilogo di fine stagione: solo i campi che servono al rapporto (sola lettura).
const SEASON_PICK = () => {
  const p = window.__CPM_CAREER.snapshot();
  const s = p.season;
  const mh = (p.matchHistory || []).filter(m => m.season === s);
  const keyCount = {};
  (p.matchHistory || []).forEach(m => { const k = m.season + '/' + m.week; keyCount[k] = (keyCount[k] || 0) + 1; });
  const dupKeys = Object.keys(keyCount).filter(k => keyCount[k] > 1);
  const st = (p.standings || []).map(r => ({ id: r.id || r.clubId, n: r.n || r.name, pts: r.pts, gf: r.gf, ga: r.ga, w: r.w, d: r.d, l: r.l, p: r.p || r.played }));
  return {
    season: s, week: p.week, age: p.age, ovr: p.ovr, position: p.position, archetype: p.archetype, proStatus: p.proStatus,
    club: { id: p.club && p.club.id, n: p.club && p.club.n, p: p.club && p.club.p, lg: p.club && p.club.lg },
    matchesStored: mh.length, mhSample: mh.slice(0, 2),
    mh: mh.map(m => ({ w: m.week, hs: m.homeScore, as: m.awayScore, g: m.goals, a: m.assists, r: m.rating, won: !!m.won, drew: !!m.drew, sim: !!m.simulated, minutes: m.minutesPlayed ?? null, home: m.isHome ?? null, opp: m.opponent, ctx: m.ctx || m.context || null, keys: Object.keys(m).join('|') })),
    cal: (p.calendar || []).map(c => ({ w: c.week, h: c.isHome ?? null, opp: c.opponentName ?? null, pl: !!c.played, res: c.result ?? null })),
    dupWeekKeys: dupKeys,
    standingsRows: st, standingsKeys: (p.standings && p.standings[0]) ? Object.keys(p.standings[0]).join('|') : '',
    trophies: (p.trophies || []).length, trophiesLast: (p.trophies || []).slice(-3),
    nationalCaps: p.nationalCaps || 0, nationalGoals: p.nationalGoals || 0, lastNationalSeason: p.lastNationalSeason ?? null,
    natHistoryLen: Array.isArray(p.natHistory) ? p.natHistory.length : (p.natHistory ? 'obj' : 0),
    euroMondiale: p.euroMondiale ? { active: !!p.euroMondiale.active, done: !!p.euroMondiale.done, type: p.euroMondiale.type || null } : null,
    nationsCupQueue: p.nationsCupQueue ? { active: !!p.nationsCupQueue.active, done: !!p.nationsCupQueue.done } : null,
    bankBalance: p.bankBalance ?? null, bank: p.bank ?? null,
    ledgerSeason: (p.ledger || []).filter(e => e.season === s).map(e => ({ ...e })).slice(-40),
    ledgerSample: (p.ledger || []).slice(0, 1),
    logTexts: (p.log || []).map(x => (x && (x.txt || x.text || x.msg || x)) + '').map(t => t.slice(0, 90)),
    impulseSeenN: Object.keys(p.impulseSeen || {}).length, impulseSeenIds: Object.keys(p.impulseSeen || {}),
    recentImpulses: p.recentImpulses || [],
    morale: p.morale, popularity: p.popularity, form: p.form, coachTrust: p.coachTrust, fatigue: p.fatigue,
    loan: p.loan ? { active: true } : null, sponsors: (p.sponsors || []).length, perkTrainer: p.perkTrainer ?? null, perkNutrition: p.perkNutrition ?? null,
    coachHistoryLen: (p.coachHistory || []).length, agent: p.agent ? { hasAgent: true } : null,
    contract: p.contract || null, transferOffersLen: (p.transferOffers || []).length, offerHistoryLen: (p.offerHistory || []).length,
    injured: !!p.injury || !!p.injured, vitaSeenN: Object.keys(p.vitaSeen || {}).length,
    diaryLen: (p.diary || []).length,
  };
};

async function runCareer(browser, port, c) {
  const t0 = Date.now();
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await installCdnRoutes(page);
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  const saveJson = JSON.stringify(saveFor(c));
  await page.addInitScript((s) => {
    window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1;
    try { localStorage.setItem('cpm-v3', s); } catch (e) {}
  }, saveJson);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
  await sleep(1000);
  const version = await page.evaluate(() => GAME_VERSION);
  const catalog = await page.evaluate(() => WEEKLY_IMPULSES.map(im => ({ id: im.id, cond: !!im.cond, addio: !!im.addio, mile: !!im.mile })));

  const seasons = [], screens = {}, impEvents = [];
  let seasonsDone = 0, iter = 0, stuck = 0, prev = null, endReason = 'ok', errStep = null, lastImp = null, natCallupSeason = 0, startSnap = null;
  while (seasonsDone < SEASONS && iter++ < 1500) {
    const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); const scr = C.screen(); C.dismiss(); const p = C.snapshot(); return { res, scr, lite: { s: p.season, w: p.week, lived: !!p.weekLived, ovr: p.ovr, bb: p.bankBalance, mh: (p.matchHistory || []).length, nat: p.nationalCaps || 0, imp: (p.recentImpulses || []).slice(-1)[0] || null, impN: Object.keys(p.impulseSeen || {}).length } }; });
    const { res, scr, lite } = r;
    screens[scr] = (screens[scr] || 0) + 1;
    if (scr === 'nationalCallup') natCallupSeason++;
    if (!startSnap) startSnap = lite;
    if (res && String(res).startsWith('error:')) { endReason = 'error'; errStep = res; break; }
    if (res === 'seasonEnd') {
      const summary = await page.evaluate(SEASON_PICK);
      summary.natCallupScreens = natCallupSeason; natCallupSeason = 0;
      summary.startBankBalance = startSnap ? startSnap.bb : null; summary.endBankBalance = lite.bb;
      seasons.push(summary); seasonsDone++;
      const ok = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
      if (ok !== true) { endReason = 'startNewSeason:' + ok; break; }
      await page.evaluate(() => window.__CPM_CAREER.dismiss());
      startSnap = null; prev = null; lastImp = null; await sleep(500); continue;
    }
    if (res && String(res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
    if (lite.imp && lite.imp !== lastImp) impEvents.push({ s: lite.s, w: lite.w, id: lite.imp });
    lastImp = lite.imp;
    const key = `${lite.s}/${lite.w}/${lite.lived}`;
    if (prev === key) { stuck++; if (stuck > 25) { endReason = `blocco S${lite.s}W${lite.w} res=${res}`; break; } } else stuck = 0;
    prev = key;
    await sleep(40);
  }
  const out = {
    collaudo: 'L6 fase 1 · PO-153', version, cfg: c, chromium: 'CPM_CHROME=/opt/pw-browsers/chromium (chromium-1194)',
    seasonsDone, iter, endReason, errStep, durationMs: Date.now() - t0, pageerrors: errors,
    catalogImpulses: catalog.length, catalog, screens, impEvents, seasons,
  };
  fs.writeFileSync(path.join(OUT, `carriera-${pad(c.k)}.json`), JSON.stringify(out, null, 1));
  console.log(`carriera ${pad(c.k)} [${c.tier}, ${c.role}, ${c.archetype}, ${c.nation}] stagioni ${seasonsDone}/${SEASONS} · ${endReason} · ${Math.round((Date.now() - t0) / 1000)}s · pageerrors ${errors.length}`);
  await page.close();
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
for (const k of IDS) {
  try { await runCareer(browser, port, cfgOf(k)); }
  catch (e) { console.log(`carriera ${pad(k)} ERRORE: ${String(e.message).slice(0, 200)}`); }
}
await browser.close(); srv.close();
console.log('FINE');
