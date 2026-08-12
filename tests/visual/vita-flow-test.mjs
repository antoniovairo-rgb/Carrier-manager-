#!/usr/bin/env node
/* [7.416.0] GUARDIANO — LA VITA DELL'EROE ACCADE NEL FLUSSO REALE
   (collaudo PO «in una stagione mai capitato un evento...»)

   LA LEZIONE: il guardiano della varieta' (vita-variety) chiama il MOTORE direttamente — e il motore
   era perfetto. Ma il blocco d'integrazione del 7.412 stava SOLO in doAdvanceWeek, mentre nelle
   settimane con partita (cioe' quasi tutte) l'avanzamento passa da simulateAndAdvance o dal
   post-partita, e «Vivi la Settimana» ha la sua cascata che ritorna sempre prima: il motore non
   veniva MAI interrogato nel flusso che il giocatore usa davvero. Con 15%/settimana la probabilita'
   di zero eventi in 38 settimane e' ~0,2%: l'osservazione del PO ERA la misura. Un sistema puo'
   essere perfetto in ogni sua regola e non accadere mai — e' la stessa classe di difetto del
   procuratore (7.380), e questo guardiano e' il gemello di quello: guida una carriera VERA con
   __CPM_CAREER (liveCurrentWeek/simulateAndAdvance/doAdvanceWeek autentici) per UNA stagione e
   verifica che gli eventi di vita ACCADANO (p.vitaSeen cresce). Misurato col fix: ~5-7/stagione.
   PROVA DEL ROSSO: con --spenta il motore torna null (interruttore test __CPM_VITA_OFF) e il
   guardiano DEVE fallire.

     CPM_CHROME=… PLAYWRIGHT_BROWSERS_PATH=… node vita-flow-test.mjs [--spenta]                     */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';

const OFF = process.argv.includes('--spenta');
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((off) => {
  window.__CPM_GLB = false; if (off) window.__CPM_VITA_OFF = 1;
  const save = { phase: 'career', player: {
    name: 'Vita Reale', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 2, age: 22, ovr: 78,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 78, tecnica: 77, fisico: 76, 'mentalità': 77, tiro: 79, passaggio: 77, dribbling: 78, posizionamento: 77 },
    form: 72, morale: 70, fatigue: 10, popularity: 40, value: 12, bankBalance: 60000,
    hasAgent: false, contract: { duration: 3, wage: 4000, expiresAtSeason: 5, years: 3 },
  } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, OFF);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, { timeout: 40000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, { timeout: 20000 });
await sleep(1200);

let iter = 0, weeksLived = 0, done = false;
while (iter++ < 220 && !done) {
  const r = await page.evaluate(() => {
    const C = window.__CPM_CAREER; if (!C) return null;
    const res = C.step(); C.dismiss();
    return { res, st: C.get() };
  });
  if (!r) { console.log('❌ FAIL — harness sparito'); process.exit(2); }
  const { res, st } = r;
  if (res === 'seasonEnd') { done = true; break; }
  if (res && String(res).startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments()); continue; }
  if (res && String(res).startsWith('error:')) { console.log('❌ FAIL — step: ' + res); process.exit(2); }
  if (res === 'lived') weeksLived++;
  await sleep(20);
}
const fin = await page.evaluate(() => window.__CPM_CAREER.get());
const v = fin.vita || null;
console.log(`stagione attraversata: settimane vissute ${weeksLived} · eventi vita distinti ${v ? v.seen : '(sonda assente)'}${v && v.ids && v.ids.length ? ' · ' + v.ids.map(s => s.replace('vita_', '')).join(', ') : ''}`);
await b.close(); srv.close();

if (!v) { console.log('❌ FAIL — la sonda vita non esiste in __CPM_CAREER.get()'); process.exit(2); }
if (weeksLived < 15) { console.log(`❌ FAIL — solo ${weeksLived} settimane vissute: la carriera non e' stata guidata davvero`); process.exit(2); }
if (v.seen < 1) { console.log('\n❌ FAIL — ZERO eventi di vita in una stagione vissuta: «in una stagione mai capitato un evento»'); process.exit(2); }
if (v.seen < 3) console.log(`⚠️  solo ${v.seen} eventi in una stagione (attesi ~5-7): sotto osservazione, non e' un rosso`);
console.log('\n✅ PASS — la vita dell\'eroe accade nel flusso reale, non solo nel motore');
