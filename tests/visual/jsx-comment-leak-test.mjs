#!/usr/bin/env node
/* [7.272.0 collaudo PO «regressione» — screenshot del Tab Club] GUARDIANO contro i COMMENTI CHE FINISCONO
   A SCHERMO. Nel JSX un `/* … *​/` scritto fra i figli di un tag NON è un commento: è TESTO, e viene
   stampato al giocatore. Lo screenshot del proprietario mostrava, nella scheda del club, la riga
   «(commento del 7.265.0 sul colore per tono)» stampata davanti a «Progetto: La sorpresa del
   campionato». La scansione ne ha trovati QUATTRO, il più vecchio
   dal 7.32.1: è una classe di difetto ricorrente, non un caso isolato.
   Due reti: (1) STATICA — nessun commento deve seguire immediatamente la chiusura di un tag (`>` + `/*`),
   che è sempre posizione-figlio e quindi sempre renderizzato; (2) VIVA — nel testo visibile delle
   schermate principali della carriera non deve comparire nessun delimitatore di commento.
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node jsx-comment-leak-test.mjs */
import fs from 'node:fs';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';

const issues = [];
const src = fs.readFileSync(ROOT + '/CARRIER-MANAGER-AV.html', 'utf8');

// ───── (1) statica: `>` seguito subito da un commento = figlio JSX = testo stampato
{
  const bad = [];
  src.split('\n').forEach((l, i) => { if (/>\/\*/.test(l)) bad.push({ n: i + 1, s: (l.match(/>\/\*.{0,70}/) || [''])[0] }); });
  /* Il controllo statico è un'EURISTICA: `>` seguito da un commento è quasi sempre posizione-figlio, ma
     non sempre — se il tag chiude il ramo di un ternario o il valore di un'espressione, lì il commento è
     JS legittimo e racchiuderlo in graffe ROMPE la pagina (successo davvero: il primo tentativo di questo
     fix ha impedito il mount). Perciò i siti verificati a mano stanno in una lista esplicita, e
     l'autorità resta il controllo (2) dal vivo. */
  const JS_POS = [
    "[7.32.1 collaudo PO «la scritta deve essere uguale",   // ramo di ternario in IntroCinematic
    "[7.121.0 rifiniture] chip «da giocare»",                // fine espressione già dentro {…}
  ];
  const veri = bad.filter(b => !JS_POS.some(x => src.split('\n')[b.n - 1].includes(x)));
  console.log(`(1) statica — commenti in posizione-figlio JSX: ${veri.length}` + (bad.length - veri.length ? ` (${bad.length - veri.length} in posizione JS, ignorati)` : ''));
  veri.forEach(b => console.log(`    riga ${b.n}: ${b.s}`));
  if (veri.length) issues.push(`${veri.length} commenti verrebbero STAMPATI a schermo: vanno racchiusi in una espressione JSX`);
}

// ───── (2) viva: nessun frammento di commento nel testo visibile delle schermate principali
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 480, height: 1600 } });
await installCdnRoutes(page);
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 140)));
const save = { phase: 'career', player: {
  name: 'Leak Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 16, age: 25, ovr: 76,
  tutorialDone: true, campDone: true, jerseyNumSeason: 4, presidentModalSeason: 4, drawSeen: 4, coachPactSeason: 4,
  seasonPledge: { season: 4, tone: 'equilibrato' }, squadRole: 'titolare', coachTrust: 72, teamChemistry: 62,
  club: { id: 'cel', n: 'FC Celeste', a: 'CEL', p: 70, c: '#93c5fd', c2: '#ffffff', nat: '🇪🇸', lg: 'Liga Ibérica' },
  stats: { 'velocità': 76, tecnica: 75, fisico: 74, 'mentalità': 76, tiro: 78, passaggio: 75, dribbling: 77, posizionamento: 76 },
  form: 80, morale: 82, fatigue: 40, popularity: 48, totalMatches: 110, totalGoals: 45,
  matchHistory: Array.from({ length: 9 }, (_, i) => ({ week: 6 + i, opponent: 'FC Avversario', goals: i % 3 === 0 ? 1 : 0, assists: 0, rating: 6.4 + (i % 3) * 0.4, won: i % 2 === 0 })),
  contract: { duration: 3, wage: 12000, expiresAtSeason: 8 } } };
await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1000);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await sleep(1200);

const TABS = ['dashboard', 'club', 'profile', 'standings', 'calendar', 'coppe', 'nazionale', 'agent', 'training'];
const trovati = [];
for (const t of TABS) {
  await page.evaluate((x) => { try { window.__CPM_CAREER.goTab ? window.__CPM_CAREER.goTab(x) : (window.__CPM_CAREER.setTab && window.__CPM_CAREER.setTab(x)); } catch (e) {} }, t);
  await sleep(700);
  const r = await page.evaluate(() => {
    const txt = document.body.innerText || '';
    const m = txt.match(/\/\*[^\n]{0,80}|\*\/[^\n]{0,20}/g);
    return m ? m.slice(0, 3) : null;
  });
  if (r) trovati.push({ t, r });
}
console.log(`(2) viva — schermate visitate: ${TABS.length} · con testo di commento a video: ${trovati.length}`);
trovati.forEach(x => console.log(`    tab «${x.t}»: ${x.r.join(' | ')}`));
if (trovati.length) issues.push(`commento stampato a schermo su: ${trovati.map(x => x.t).join(', ')}`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL'); issues.forEach(i => console.log('  · ' + i)); process.exit(1); }
console.log('\n✅ NESSUN COMMENTO A SCHERMO (statica + schermate reali della carriera)');
