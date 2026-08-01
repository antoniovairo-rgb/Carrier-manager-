#!/usr/bin/env node
/* [7.286.0 collaudo PO «i messaggi toast in base alla velocità di avanzamento nel gioco tendono ad
   "accavallarsi". Il toast della partita simulata ci mette troppo tempo per comparire»]
   MISURA della coda dei toast: si simula una settimana con partita e si registra, campionando il DOM,
   OGNI toast mostrato con il suo istante e la sua durata. Quello che conta:
     · quanti toast produce UNA settimana (la coda 7.147.0 ne mostra uno alla volta, 3.6s + 0.26s);
     · dopo quanto compare quello del RISULTATO — il solo che l'utente stia davvero aspettando;
     · se un toast è ancora a schermo quando la settimana è già cambiata (è l'«accavallamento» visto
       nello screenshot: il toast della simulazione sopra la storia della settimana dopo).
   Uso: CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node toast-timing-test.mjs */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const issues = [];
const srv = await startServer(); const port = srv.address().port;
const browser = await launchBrowser();

const CLUB = { id: 'tor', n: 'FC Granata', a: 'GRA', p: 70, c: '#6c1f2e', c2: '#f5f5f5', nat: '🇮🇹', lg: 'Lega A' };
const save = { phase: 'career', player: {
  name: 'Toast Probe', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 6, week: 12, age: 26, ovr: 84,
  tutorialDone: true, campDone: true, jerseyNum: 9, jerseyNumSeason: 6, presidentModalSeason: 6, drawSeen: 6,
  coachPactSeason: 6, presentedClub: 'tor', seasonPledge: { season: 6, tone: 'equilibrato' }, squadRole: 'titolare',
  club: CLUB, stats: { 'velocità': 84, tecnica: 84, fisico: 82, 'mentalità': 84, tiro: 87, passaggio: 82, dribbling: 85, posizionamento: 85 },
  form: 88, morale: 85, fatigue: 35, coachTrust: 78, teamChemistry: 70, popularity: 62, bankBalance: 4e6,
  goals: 12, assists: 5, matches: 11, totalMatches: 200, totalGoals: 110, matchHistory: [],
  contract: { duration: 3, wage: 1200000, expiresAtSeason: 9 } } };

const page = await browser.newPage({ viewport: { width: 480, height: 1400 } });
page.on('pageerror', e => issues.push('pageerror: ' + String(e.message).slice(0, 130)));
await installCdnRoutes(page);
await page.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, save);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1400);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
await sleep(900);

// registratore: campiona il toast e la settimana ogni 100ms
await page.evaluate(() => {
  window.__TT = [];
  const testo = () => {
    // il toast è l'unico nodo fisso in alto col bordo colorato: si cerca per contenuto tipico
    const cand = [...document.querySelectorAll('div')].filter(d => {
      const s = getComputedStyle(d);
      return s.position === 'fixed' && parseFloat(s.top) < 200 && d.innerText && d.innerText.length > 3 && d.innerText.length < 200 && d.children.length <= 3;
    });
    return cand.length ? cand[cand.length - 1].innerText.replace(/\s+/g, ' ').trim() : null;
  };
  let prev = null;
  window.__TT_ID = setInterval(() => {
    const t = testo();
    const wk = (window.__CPM_CAREER && window.__CPM_CAREER.get() || {}).week;
    if (t !== prev) { window.__TT.push({ t: Date.now(), txt: t, wk }); prev = t; }
  }, 100);
  window.__TT_T0 = Date.now();
});

// una settimana con partita, risolta col path SIMULA
const esito = await page.evaluate(() => { const C = window.__CPM_CAREER; return C.step(); });
console.log(`step della settimana → ${esito}`);
await sleep(26000);

const rec = await page.evaluate(() => { clearInterval(window.__TT_ID); return { ev: window.__TT, t0: window.__TT_T0 }; });
const eventi = rec.ev.filter(e => e.txt).map(e => ({ ms: e.t - rec.t0, txt: e.txt, wk: e.wk }));

console.log(`\n── toast osservati in una singola settimana: ${eventi.length}`);
for (const e of eventi) console.log(`   +${String(e.ms).padStart(6)}ms  W.${e.wk}  ${e.txt.slice(0, 74)}`);

const simIdx = eventi.findIndex(e => /Simulazione|Simulata|vs /i.test(e.txt));
const attesa = simIdx >= 0 ? eventi[simIdx].ms : null;
const wkIniziale = eventi.length ? eventi[0].wk : null;
const stantii = eventi.filter(e => wkIniziale != null && e.wk !== wkIniziale);

console.log(`\n   risultato della partita mostrato dopo ${attesa == null ? 'MAI' : attesa + 'ms'}${simIdx >= 0 ? ` (${simIdx} toast prima di lui)` : ''}`);
console.log(`   toast mostrati con la settimana già cambiata: ${stantii.length}`);

if (attesa == null) issues.push('il toast del risultato non è mai comparso');
else if (attesa > 4000) issues.push(`il risultato della partita compare dopo ${attesa}ms (soglia 4000): resta in coda dietro ${simIdx} toast minori`);
if (eventi.length > 6) issues.push(`una sola settimana produce ${eventi.length} toast in fila (soglia 6): la coda dura più della settimana`);

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — il risultato arriva subito e la coda non sopravvive alla settimana');
