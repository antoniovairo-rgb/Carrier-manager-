#!/usr/bin/env node
/* [7.14.0] TEST — LA STAGIONE A CAPITOLI: (1) arco «la piazza dubita» si apre su 3 gare senza gol e si
   chiude col riscatto; (2) «il rivale in casa» si apre a W≤4 col nuovo attaccante dal mercato VERO;
   (3) «il ritorno da ex» sulla settimana del match contro un club della tua storia. Persistenza arcSeen. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];
const mkPage = async (playerPatch) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1000 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 120)));
  const base = { phase: 'career', player: { name: 'Storia Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 3, week: 10, weekLived: false, age: 22, ovr: 78, tutorialDone: true, campDone: true, morale: 70, popularity: 40, coachTrust: 60,
    seasonPledge: { season: 3, tone: 'equilibrato' }, drawSeen: 3,
    club: { id: 'sal', n: 'FC Salernum', a: 'SAL', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega B' },
    stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
    form: 70, fatigue: 10, contract: { duration: 3, wage: 6000, expiresAtSeason: 6 }, ...playerPatch } };
  await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); }, base);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1500);
  try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 6000 }); } catch (e) {}
  await sleep(1100);
  return page;
};
const chapter = (page) => page.evaluate(() => { const vis = e => e.offsetParent !== null; const has = (rx) => [...document.querySelectorAll('div')].some(e => vis(e) && rx.test((e.textContent || '').trim()) && (e.textContent || '').length < 200); return { storia: has(/la tua storia/i), dubita: has(/La piazza mormora/), riscatto: has(/La risposta del campo/), rivale: has(/Il rivale in casa/), ex: has(/Il ritorno da ex/) }; });

// (1) LA PIAZZA DUBITA — 8 gare, ultime 3 senza gol
const mh0 = [...Array.from({ length: 5 }, (_, i) => ({ week: i + 2, opponent: 'X' + i, goals: 1, assists: 0, rating: 7, won: true })), ...Array.from({ length: 3 }, (_, i) => ({ week: i + 7, opponent: 'Y' + i, goals: 0, assists: 0, rating: 6, won: false }))];
let pg = await mkPage({ matchHistory: mh0, goals: 5, matches: 8 });
let ch = await chapter(pg);
console.log('dubita step1:', JSON.stringify(ch));
if (!ch.storia || !ch.dubita) issues.push('capitolo «La piazza mormora» non mostrato (3 gare senza gol)');
await pg.getByText('Continua la storia', { exact: false }).first().click({ timeout: 5000 }).catch(() => issues.push('CTA storia non cliccabile'));
await sleep(900);
let st = await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return { seen: p.arcSeen, morale: p.morale, diary: (p.diary || []).filter(d => d.type === 'story').length }; });
console.log('post-continua:', JSON.stringify(st));
if (!st.seen || !st.seen['dub1_S3']) issues.push('arcSeen dub1 non persistito');
if (st.morale !== 67) issues.push(`morale atteso 67 (70−3), trovato ${st.morale}`);
if (st.diary !== 1) issues.push('diario story mancante');
await pg.close();
// (1b) RISCATTO — dub1 visto + ultima gara con gol
pg = await mkPage({ matchHistory: [...mh0, { week: 10, opponent: 'FC Pisano', goals: 2, assists: 0, rating: 8.5, won: true }], goals: 7, matches: 9, week: 11, arcSeen: { dub1_S3: true } });
ch = await chapter(pg);
console.log('riscatto:', JSON.stringify(ch));
if (!ch.riscatto) issues.push('capitolo «La risposta del campo» non mostrato dopo il riscatto');
await pg.close();
// (2) IL RIVALE IN CASA — W2, S3: serve un nuovo Centravanti/Attaccante nel diff roster (dipende dal club/stagione)
pg = await mkPage({ week: 2, matchHistory: [], goals: 0, matches: 0 });
const hasRivalData = await pg.evaluate(() => { try { const cur = generateTeamRoster({ id: 'sal', n: 'FC Salernum', nat: '🇮🇹' }, 3), prev = generateTeamRoster({ id: 'sal', n: 'FC Salernum', nat: '🇮🇹' }, 2); return cur.some((r, i) => prev[i] && r.name !== prev[i].name && /Centravanti|Attaccante/.test(r.role)); } catch (e) { return 'err'; } });
ch = await chapter(pg);
console.log('rivale (dati presenti:', hasRivalData, '):', JSON.stringify(ch));
if (hasRivalData === true && !ch.rivale) issues.push('capitolo «Il rivale in casa» non mostrato con attaccante in arrivo');
if (hasRivalData === false && ch.rivale) issues.push('capitolo rivale mostrato SENZA attaccante in arrivo (falso positivo)');
await pg.close();
// (3) IL RITORNO DA EX — storia con vecchio club + match in calendario questa settimana
pg = await mkPage({ week: 12, matchHistory: [], goals: 0, matches: 0, history: [{ season: 1, club: 'FC Pisano', goals: 9, assists: 3, matches: 20, ovr: 66 }], calendar: [{ matchday: 11, week: 12, opponentId: 'pis', opponentName: 'FC Pisano', isHome: false, played: false, result: null }] });
ch = await chapter(pg);
console.log('ex:', JSON.stringify(ch));
if (!ch.ex) issues.push('capitolo «Il ritorno da ex» non mostrato nella settimana del match contro il vecchio club');
await pg.close();
await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ STAGIONE A CAPITOLI OK (dubita+riscatto · rivale · ritorno da ex · persistenza/effetti/diario)');
process.exit(issues.length ? 1 : 0);
