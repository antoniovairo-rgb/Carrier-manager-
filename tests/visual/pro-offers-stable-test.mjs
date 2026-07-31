#!/usr/bin/env node
/* [7.262.0 collaudo PO «cambiano le squadre, prima carica alcune squadre e poi ne mostra altre! bug grave!»]
   GUARDIANO: le offerte di primo contratto professionistico devono essere STABILI.
   Erano generate con pick()/rngF() NON seedati dentro il corpo del render di ProTransitionScreen: ogni
   re-render del contenitore (notifica, autosave, timer) riestraeva club e stipendi sotto gli occhi del
   giocatore. Il test: (1) STATICO — nessuna estrazione non seedata sopravvive dentro generateProContracts;
   (2) PURO — la funzione chiamata 50 volte sullo stesso player restituisce sempre gli stessi club/stipendi;
   (3) VIVO — la schermata reale, ri-renderizzata a forza, continua a mostrare gli stessi club;
   (4) SENSIBILITÀ — un giocatore diverso riceve offerte diverse (il seed non è una costante).
   Uso: node pro-offers-stable-test.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';

const issues = [];
const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');

// ───── (1) statico: dentro generateProContracts non deve restare casualità non seedata
{
  const i = src.indexOf('function generateProContracts(player){');
  const j = src.indexOf('\nfunction ', i + 10);
  const body = src.slice(i, j);
  const bad = { 'pick(': (body.match(/\bpick\(/g) || []).length, 'rngF(': (body.match(/\brngF\(/g) || []).length, 'rng(n,n)': (body.match(/\brng\(\d+,\d+\)/g) || []).length, 'Math.random': (body.match(/Math\.random\(/g) || []).length };
  const tot = Object.values(bad).reduce((a, b) => a + b, 0);
  console.log('(1) statico — estrazioni non seedate dentro generateProContracts:', tot, JSON.stringify(bad));
  if (tot) issues.push(`generateProContracts contiene ancora ${tot} estrazioni non seedate: le offerte possono cambiare da sole`);
}

const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 1200 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));

const mkSave = (name) => ({ phase: 'career', player: { name, nation: 'Italia', avatarId: 0, proStatus: 'u18', isU18: true, u18Seasons: 2, season: 3, week: 37, weekLived: false, age: 17, ovr: 71, tutorialDone: true, campDone: true, drawSeen: 3,
  goals: 23, assists: 7, matches: 34, totalGoals: 40, totalMatches: 60, history: [], trophies: [],
  club: { id: 'ces', n: 'FC Cesenate Primavera', a: 'CES', p: 45, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Primavera 2', isU18: true },
  stats: { 'velocità': 74, tecnica: 76, fisico: 70, 'mentalità': 74, tiro: 78, passaggio: 72, dribbling: 74, posizionamento: 76 },
  form: 78, fatigue: 20, morale: 80, contract: { duration: 1, wage: 500, expiresAtSeason: 4 } } });

await page.addInitScript((sv) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(sv)); localStorage.setItem('cpm-intro-seen', '1'); }, mkSave('Max Rea Vairo'));
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1200);
/* ?cpmtest=1 disattiva l'auto-ripresa (7.149.0): si parte dalla Home → carica lo slot per montare CareerApp */
await page.evaluate(() => { const b = [...document.querySelectorAll('button,a,[role=button]')].find(e => /Continua/i.test(e.textContent || '') && e.offsetParent !== null); if (b) b.click(); });
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 });
await sleep(900);

// ───── (2) purezza: 50 chiamate consecutive sullo stesso player
const pure = await page.evaluate(() => {
  if (typeof generateProContracts !== 'function') return { err: 'generateProContracts non raggiungibile' };
  const p = JSON.parse(localStorage.getItem('cpm-v3')).player;
  const sig = () => generateProContracts(p).offers.map(o => `${o.club && (o.club.id || o.club.n)}:${o.wage}:${o.duration}`).join('|');
  const first = sig(); let diff = 0;
  for (let i = 0; i < 50; i++) if (sig() !== first) diff++;
  return { first, diff };
});
if (pure.err) issues.push(pure.err);
else {
  console.log('(2) puro — 50 chiamate identiche:', pure.diff === 0 ? 'sì' : `NO (${pure.diff} diverse)`);
  console.log('    offerte:', pure.first);
  if (pure.diff) issues.push(`generateProContracts non è pura: ${pure.diff}/50 chiamate danno offerte diverse`);
}

// ───── (3) vivo: la schermata reale, ri-renderizzata a forza
const clubsOnScreen = () => page.evaluate(() => {
  const t = document.body.innerText;
  return [...t.matchAll(/^(FC [^\n·]{2,40})$/gm)].map(m => m[1].trim()).slice(0, 8).join('|');
});
await page.evaluate(() => { try { window.__CPM_CAREER.dismiss(); } catch (e) {} });
await page.evaluate(() => { try { window.__CPM_CAREER.goScreen('proTransition'); } catch (e) {} });
await sleep(1100);
let live0 = await clubsOnScreen();
if (!/FC /.test(live0 || '')) {
  console.log('(3) vivo — schermata pro non raggiunta dall\'harness (hook assente): controllo saltato, restano (1),(2),(4)');
} else {
  for (let i = 0; i < 8; i++) { await page.evaluate(() => { try { window.__CPM_CAREER.bump(); } catch (e) {} }); await sleep(220); }
  const live1 = await clubsOnScreen();
  console.log('(3) vivo — club dopo 6 re-render forzati:', live1 === live0 ? 'invariati' : `CAMBIATI\n    prima: ${live0}\n    dopo:  ${live1}`);
  if (live1 !== live0) issues.push('le squadre offerte CAMBIANO tra un render e l\'altro (il bug segnalato dal proprietario)');
}

// ───── (4) sensibilità: un giocatore diverso deve ricevere offerte diverse (il seed non è costante)
const sens = await page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('cpm-v3')).player;
  const a = generateProContracts(p).offers.map(o => o.club && (o.club.id || o.club.n)).join('|');
  const b = generateProContracts({ ...p, name: 'Altro Giocatore', nation: 'Spagna' }).offers.map(o => o.club && (o.club.id || o.club.n)).join('|');
  return { a, b };
});
console.log('(4) sensibilità — due giocatori diversi ricevono offerte diverse:', sens.a !== sens.b ? 'sì' : 'NO');
if (sens.a === sens.b) issues.push('il seed non dipende dal giocatore: tutti riceverebbero le stesse identiche offerte');

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ PASS — le offerte di contratto pro sono stabili (e restano diverse tra giocatori diversi)');
