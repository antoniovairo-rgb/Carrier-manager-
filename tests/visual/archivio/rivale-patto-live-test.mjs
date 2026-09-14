#!/usr/bin/env node
/* [7.267.0] PROBE DAL VIVO dei due archi rifatti — la logica della carriera è CIECA al gate visivo, quindi
   un refuso nel render non lo vedrebbe nessuno finché non lo trova il proprietario in partita.
   Verifica sulla dashboard REALE: (1) la card «La tua storia» del duello col rivale esce e il suo corpo NON è
   più il vecchio template fisso del conto gol; (2) la card del patto col mister esce e chiede un obiettivo di
   uno dei quattro tipi (gol/assist/giocate decisive/gare da 7); (3) zero pageerror.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node rivale-patto-live-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));

await page.addInitScript(() => {
  const mh = Array.from({ length: 8 }, (_, i) => ({ week: i + 2, opponent: 'FC Avversario', goals: i % 3 === 0 ? 1 : 0, assists: i % 4 === 0 ? 1 : 0, rating: 6.4 + (i % 3) * 0.4, won: i % 2 === 0 }));
  mh[mh.length - 1] = { ...mh[mh.length - 1], rating: 7.6, simulated: false };
  const save = { phase: 'career', player: { name: 'Max Rea Vairo', nation: 'Italia', avatarId: 0, proStatus: 'pro',
    season: 4, week: 12, age: 21, ovr: 76, tutorialDone: true, weekLived: false, campDone: true, drawSeen: 4,
    presidentModalSeason: 4, jerseyNumSeason: 4, seasonPledge: { season: 4, tone: 'equilibrato' },
    goals: 9, assists: 5, matches: 8, totalGoals: 62, totalAssists: 20, trophies: [{ season: 3, type: 'league' }],
    matchHistory: mh, history: [], diary: [], log: [],
    club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
    coach: { name: 'Ramón Ferrer', style: 'offensivo', trustMod: 0 },
    rival: { name: 'Federico López', ovr: 81, age: 22, seasons: 4, goals: 12, totalGoals: 44, trophies: 0,
      relationship: 'rivale', awards: { palloneOros: [], scarpaOros: [] },
      club: { id: 'bar', n: 'FC Catalunya', p: 92, lg: 'Liga Ibérica', c: '#1d4ed8' } },
    calendar: [{ matchday: 12, week: 12, opponentId: 'bar', opponentName: 'FC Catalunya', isHome: true, played: false }],
    standings: [{ id: 'bar', n: 'FC Catalunya', pts: 30, gf: 25, ga: 10, played: 11 }, { id: 'cel', n: 'FC Celeste', pts: 26, gf: 20, ga: 12, played: 11 }],
    stats: { 'velocità': 78, tecnica: 77, fisico: 72, 'mentalità': 76, tiro: 79, passaggio: 74, dribbling: 78, posizionamento: 77 },
    form: 82, morale: 84, fatigue: 30, coachTrust: 70, teamChemistry: 65, contract: { duration: 3, wage: 20000, expiresAtSeason: 7 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
  localStorage.setItem('cpm-intro-seen', '1');
  window.__CPM_GLB = false;
});
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1000);
await page.evaluate(() => { const b = [...document.querySelectorAll('button,a,[role=button]')].find(e => /Continua/i.test(e.textContent || '') && e.offsetParent !== null); if (b) b.click(); });
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
await sleep(1400);

const txt = await page.evaluate(() => document.body.innerText);
const issues = [];

// ───── (1) il capitolo del rivale
const hasStory = /LA TUA STORIA/i.test(txt);
const mRiv = /Federico López/.test(txt);
console.log(`(1) capitolo rivale in dashboard: ${hasStory && mRiv}`);
if (!hasStory || !mRiv) issues.push('la card del duello col rivale non compare sulla dashboard');
const OLD = /ma con lui il conto riparte sempre da zero|Un tempo eravate alla pari/;
const body = (txt.match(/LA TUA STORIA[\s\S]{0,600}?Continua la storia/) || [''])[0];
console.log('    corpo: ' + body.replace(/\n+/g, ' ').slice(0, 240));
if (/62 a 44/.test(body) && OLD.test(body)) issues.push('il capitolo usa ancora il vecchio template fisso del conto gol in carriera');

// ───── (2) il patto col mister
const hasPact = /IL PATTO COL MISTER/i.test(txt);
const ASK = [/voglio \d+ gol/, /\d+ assist\./, /\d+ giocate decisive/, /\d+ partite vere, da 7 in pagella/];
const which = ASK.findIndex(r => r.test(txt));
console.log(`(2) patto col mister: ${hasPact} · tipo riconosciuto: ${['gol', 'assist', 'giocate decisive', 'gare da 7'][which] || 'NESSUNO'}`);
if (!hasPact) issues.push('la card del patto col mister non compare');
else if (which < 0) issues.push('la proposta del patto non usa nessuna delle quattro formule: il tipo non arriva al render');
const pactTxt = (txt.match(/IL PATTO COL MISTER[\s\S]{0,420}/) || [''])[0].replace(/\n+/g, ' ');
console.log('    proposta: ' + pactTxt.slice(0, 260));

// ───── (3) errori
console.log(`(3) pageerror: ${errors.length}${errors.length ? ' → ' + errors[0] : ''}`);
if (errors.length) issues.push('pageerror: ' + errors[0]);

await page.screenshot({ path: 'out/rivale-patto-live.png', fullPage: false }).catch(() => {});
await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — duello col rivale e patto col mister rendono correttamente dal vivo');
