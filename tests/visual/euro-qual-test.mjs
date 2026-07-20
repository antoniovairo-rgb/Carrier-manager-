#!/usr/bin/env node
/* [7.157.0] PROBE qualificazione europea al rollover: club Lega A che chiude in posizione P →
   dopo startNewSeason deve esistere player.euro (competizione + 6 gare a calendario) SE P è in zona euro.
   Verifica l'allineamento display⟺rollover: la SeasonEndScreen mostra euro fino al 7° posto (index 6). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

// 18 club di Lega A (id reali dal DB) + il nostro club "sal"
const LEGA_A = ['int','juv','mil','nap','rom','laz','ata','fio','tor','bol','sas','udi','gen','cag','ver','lec','mon','sal'];
// standings: colloca "sal" ESATTAMENTE all'indice pos-1 (pts strettamente decrescenti per rank → sort stabile)
const mkStandings = (pos) => {
  const others = LEGA_A.filter(id => id !== 'sal');
  const ranks = []; let oi = 0;
  for (let i = 0; i < 18; i++) {
    if (i === pos - 1) ranks.push({ id: 'sal', n: 'FC Salernum' });
    else { ranks.push({ id: others[oi], n: others[oi].toUpperCase() }); oi++; }
  }
  return ranks.map((r, i) => ({ ...r, pts: (18 - i) * 3, gd: 18 - i, gf: 40 - i, ga: 20 }));
};

const mkSave = (pos) => ({ phase: 'career', screen: 'career', player: {
  name: 'Euro Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 5, week: 38, weekLived: true, age: 25, ovr: 82,
  tutorialDone: true, campDone: true, jerseyNumSeason: 5, presidentModalSeason: 5, drawSeen: 5, mercatoSeen: 5,
  seasonPledge: { season: 5, tone: 'equilibrato' },
  club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 55, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' },
  stats: { 'velocità': 82, tecnica: 81, fisico: 80, 'mentalità': 82, tiro: 84, passaggio: 81, dribbling: 83, posizionamento: 82 },
  form: 72, fatigue: 20, morale: 70, coachTrust: 75, contract: { duration: 3, wage: 12000, expiresAtSeason: 8 },
  standings: mkStandings(pos), calendar: [], matchHistory: [], history: [], goals: 15, assists: 8, matches: 34,
  seasonObjectives: [], leagueOverrides: { sal: 'Lega A' }/* Salernum PROMOSSA in Lega A (come il save del PO) */,
} });

const runPos = async (pos) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 900 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push(`P${pos} pageerror: ` + String(e.message).slice(0, 120)));
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, mkSave(pos));
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 40000 });
  await sleep(1400);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await sleep(800);
  const before = await page.evaluate(() => window.__CPM_CAREER.get());
  const startRes = await page.evaluate(() => window.__CPM_CAREER.startNewSeason());
  await sleep(1400);
  const after = await page.evaluate(() => window.__CPM_CAREER.get());
  const euro = await page.evaluate(() => window.__CPM_CAREER.euro());
  const ls = await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); return s && s.player ? { season: s.player.season, euro: s.player.euro ? { comp: s.player.euro.competition, active: s.player.euro.active } : null, egCal: (s.player.calendar || []).filter(m => m.type === 'euro_group').length } : null; } catch (e) { return 'err:' + e.message; } });
  await page.close();
  return { pos, startRes, before, after, euro, ls };
};

for (const pos of [4, 6, 7, 8]) {
  const r = await runPos(pos);
  const has = r.euro && r.euro.active;
  const nGames = r.euro ? (r.euro.egCal || []).length : 0;
  console.log(`pos ${pos}° → start:${r.startRes} · season ${r.before.season}→${r.after.season} · euro:${has ? 'SÌ' : 'no'}${has ? ` (${nGames} gare girone)` : ''} · LS:${JSON.stringify(r.ls)}`);
  // atteso: pos 1-7 → euro SÌ con 6 gare · pos 8 → no
  if (pos <= 7 && !has) issues.push(`pos ${pos}°: EURO NON PARTITO (atteso qualificato)`);
  if (pos <= 7 && has && nGames !== 6) issues.push(`pos ${pos}°: euro attivo ma ${nGames} gare a calendario (attese 6)`);
  if (pos === 8 && has) issues.push(`pos 8°: euro partito ma NON dovrebbe (8° fuori zona)`);
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ EURO QUAL OK (1-7 partono con 6 gare · 8 no)');
process.exit(issues.length ? 1 : 0);
