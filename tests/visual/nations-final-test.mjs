#!/usr/bin/env node
/* [7.41.0 Sprint 4] PROBE — finale Coppa delle Nazioni + host Europeo/Mondiale:
   (1) girone chiuso a pts≥4 (3ª gara simulata) → la coppa NON si chiude: coda estesa (isFinal, 4° avversario
       seedato NON già affrontato), trofeo ancora assente anche con 9 punti;
   (2) la FINALE simulata chiude la coppa: worldMemory con campo final, trofeo ⟺ finale vinta;
   (3) eliminato al girone (pts<4) → chiusura diretta senza finale (comportamento storico);
   (4) HOST: save con euroMondiale attivo senza host → la migration lo deriva (deterministico su doppio boot)
       e il pannello Nazionale dice «si gioca in …». */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const issues = [];

const mkSave = (over = {}) => ({ phase: 'career', player: { name: 'NC Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 22, weekLived: true, age: 24, ovr: 78, tutorialDone: true, campDone: true, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6, squadRole: 'titolare', coachTrust: 80, value: 20, popularity: 60, nationalCaps: 8,
  goals: 10, assists: 4, matches: 15, matchHistory: [], history: [{ season: 5, club: 'FC Werkstadt', clubId: 'b04', goals: 15, assists: 6, matches: 30, ovr: 76, league: 'Deutsche Liga' }],
  club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 66, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
  stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 78, tiro: 80, passaggio: 77, dribbling: 79, posizionamento: 78 },
  form: 75, morale: 70, fatigue: 10, contract: { duration: 3, wage: 12000, expiresAtSeason: 9 }, ...over } });

const NCQ = (pts) => ({ active: true, opponents: ['Francia', 'Spagna', 'Germania'], matchIdx: 2, pts, matches: [{ opp: 'Francia', won: pts >= 4, drew: false, homeScore: 2, awayScore: 1 }, { opp: 'Spagna', won: pts >= 6, drew: pts === 4, homeScore: 1, awayScore: pts >= 6 ? 0 : 1 }], done: false, season: 6 });

const boot = async (save) => {
  const page = await browser.newPage({ viewport: { width: 480, height: 1100 } });
  await installCdnRoutes(page);
  page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
  await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); }, save);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
  await page.evaluate(() => window.__CPM_CAREER.dismiss());
  await sleep(500);
  return page;
};
const simNC = async (page) => { await page.keyboard.press('n'); await sleep(700); await page.getByRole('button').filter({ hasText: 'Simula' }).first().click({ timeout: 6000 }); await sleep(1800); };
const readQ = (page) => page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); const p = s.player; return { q: p.nationsCupQueue, trophies: (p.trophies || []).filter(t => t.league === 'Coppa delle Nazioni').length, wm: (p.worldMemory || []).filter(m => m.type === 'nations_cup').slice(-1)[0] || null }; });

// ── (1)+(2) qualificato → finale → chiusura onesta ───────────────────────
{
  const page = await boot(mkSave({ nationsCupQueue: NCQ(6) }));
  await simNC(page); // 3ª gara del girone
  let st = await readQ(page);
  console.log('(1) dopo il girone:', JSON.stringify({ isFinal: st.q?.isFinal, opp4: (st.q?.opponents || [])[3], done: st.q?.done, trophies: st.trophies }));
  if (!st.q?.isFinal) issues.push('(1) coda non estesa alla FINALE dopo la qualificazione');
  if ((st.q?.opponents || []).length !== 4) issues.push('(1) 4° avversario (finalista) non aggiunto');
  if ((st.q?.opponents || []).slice(0, 3).includes((st.q?.opponents || [])[3])) issues.push('(1) finalista già affrontato nel girone');
  if (st.q?.done) issues.push('(1) coppa chiusa PRIMA della finale');
  if (st.trophies !== 0) issues.push('(1) trofeo assegnato senza finale');
  await simNC(page); // LA FINALE
  st = await readQ(page);
  console.log('(2) dopo la finale:', JSON.stringify({ done: st.q?.done, active: st.q?.active, final: st.wm?.final, won: st.wm?.won, trophies: st.trophies }));
  if (!st.q?.done || st.q?.active) issues.push('(2) coppa non chiusa dopo la finale');
  if (!st.wm || !st.wm.final) issues.push('(2) worldMemory senza il campo final');
  if (st.wm && ((st.wm.won ? 1 : 0) !== st.trophies)) issues.push('(2) trofeo ⟺ finale vinta violato (won ' + st.wm?.won + ', trophies ' + st.trophies + ')');
  await page.close();
}
// ── (3) eliminato al girone: chiusura diretta ────────────────────────────
{
  const page = await boot(mkSave({ nationsCupQueue: { ...NCQ(1), matches: [{ opp: 'Francia', won: false, drew: false, homeScore: 0, awayScore: 2 }, { opp: 'Spagna', won: false, drew: true, homeScore: 1, awayScore: 1 }] } }));
  await simNC(page);
  const st = await readQ(page);
  console.log('(3) eliminato:', JSON.stringify({ done: st.q?.done, isFinal: st.q?.isFinal, qualified: st.wm?.qualified }));
  if (!st.q?.done) issues.push('(3) coppa non chiusa a pts<4');
  if (st.q?.isFinal) issues.push('(3) finale aggiunta a un eliminato');
  await page.close();
}
// ── (4) host Europeo/Mondiale: migration + display + determinismo ────────
{
  const em = { active: true, type: 'Europeo', season: 6, phase: 'group', qualOpponents: ['Francia', 'Spagna'], qualMatchIdx: 2, qualPts: 6, qualDone: true, qualQualified: true, groupOpponents: ['Germania', 'Olanda', 'Portogallo'], groupMatchIdx: 0, groupPts: 0, groupMatches: [], koPhase: null, koOpponent: null, koResults: [], qualified: false, champion: false, eliminated: false, done: false };
  const hosts = [];
  for (let i = 0; i < 2; i++) {
    const page = await boot(mkSave({ nationsCupQueue: null, euroMondiale: em, season: 8, jerseyNumSeason: 8, presidentModalSeason: 8, drawSeen: 8 }));
    try { await page.waitForFunction(() => { const s = JSON.parse(localStorage.getItem('cpm-v3') || '{}'); return !!(s.player && s.player.euroMondiale && s.player.euroMondiale.host); }, null, { timeout: 9000 }); } catch (e) {}
    const h = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cpm-v3')); return s.player.euroMondiale?.host || null; });
    hosts.push(h);
    if (i === 0) {
      await page.keyboard.press('n'); await sleep(700);
      const txt = await page.evaluate(() => document.body.innerText);
      console.log('(4) host:', h, '·', new RegExp('si gioca in ' + h).test(txt) ? 'pannello ✓' : 'pannello SENZA host');
      if (!h) issues.push('(4) host non derivato dalla migration');
      if (h && !new RegExp('si gioca in ' + h).test(txt)) issues.push('(4) «si gioca in <host>» assente dal pannello Nazionale');
    }
    await page.close();
  }
  if (hosts[0] !== hosts[1]) issues.push('(4) host NON deterministico su doppio boot (' + hosts.join(' vs ') + ')');
}

await browser.close(); srv.close();
console.log(issues.length ? '❌ FAIL\n' + issues.map(i => '  ✗ ' + i).join('\n') : '✅ FINALE NAZIONI + HOST OK (estensione coda · trofeo⟺finale · eliminato diretto · host deterministico+display)');
process.exit(issues.length ? 1 : 0);
