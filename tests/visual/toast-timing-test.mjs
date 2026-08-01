#!/usr/bin/env node
/* [7.286.0 collaudo PO «i messaggi toast in base alla velocità di avanzamento nel gioco tendono ad
   "accavallarsi". Il toast della partita simulata ci mette troppo tempo per comparire»]
   GUARDIANO DELLA CODA DEI TOAST. La coda (7.147.0) mostra un toast alla volta: con sei messaggi in una
   settimana il RISULTATO della partita — l'unica cosa che stai aspettando — usciva per ultimo, dopo che la
   settimana successiva era già a schermo. Qui si misura sul contenitore React VERO, accodando un burst noto
   (hook `__CPM_CAREER.notify`, test-only) invece di sperare che la settimana produca abbastanza eventi:
     (1) il toast PRIORITARIO (risultato) esce per primo, non in fondo;
     (2) l'intera raffica si esaurisce in tempi umani, non in mezzo minuto;
     (3) un toast MINORE accodato in una settimana e non ancora mostrato non insegue in quella dopo;
     (4) il toast SOLITARIO resta leggibile ≥3s (la cura del 7.147.0 non va persa inseguendo la velocità).
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
await sleep(1200);

// il toast VERO è il Notif: fixed, top 20, radius 40px, z-index 9999
const REC = () => {
  window.__TT = [];
  const testo = () => {
    for (const d of document.querySelectorAll('div')) {
      const s = getComputedStyle(d);
      if (s.position === 'fixed' && s.borderRadius.startsWith('40px') && s.zIndex === '9999' && d.innerText)
        return d.innerText.replace(/\s+/g, ' ').trim();
    }
    return null;
  };
  let prev = null;
  window.__TT_ID = setInterval(() => { const t = testo(); if (t !== prev) { window.__TT.push({ t: Date.now(), txt: t }); prev = t; } }, 80);
  window.__TT_T0 = Date.now();
};
const STOP = () => { clearInterval(window.__TT_ID); return window.__TT.map(e => ({ ms: e.t - window.__TT_T0, txt: e.txt })); };

// ── (1)(2) raffica di sei: cinque minori + il risultato, prioritario
await page.evaluate(REC);
await page.evaluate(() => {
  const C = window.__CPM_CAREER;
  ['A crescita', 'B stipendio', 'C staff', 'D evento', 'E record'].forEach(m => C.notify(m));
  C.notify('F RISULTATO 3-1', null, { prio: true });
});
await sleep(22000);
const burst = (await page.evaluate(STOP)).filter(e => e.txt);
console.log('── raffica di 6 toast in una settimana');
for (const e of burst) console.log(`   +${String(e.ms).padStart(6)}ms  ${e.txt}`);
const ris = burst.find(e => /RISULTATO/.test(e.txt));
const drain = burst.length ? burst[burst.length - 1].ms : 0;
console.log(`   risultato mostrato dopo ${ris ? ris.ms + 'ms' : 'MAI'} · ultimo toast a ${drain}ms`);
if (!ris) issues.push('(1) il toast del risultato non è mai comparso');
else if (ris.ms > 1500) issues.push(`(1) il risultato compare dopo ${ris.ms}ms: non ha scavalcato la coda`);
if (burst.length < 6) issues.push(`(2) mostrati solo ${burst.length}/6 toast della raffica`);
if (drain > 17000) issues.push(`(2) la raffica impiega ${drain}ms a scorrere (soglia 17000): sopravvive alla settimana`);

// ── (3) un minore accodato e non ancora mostrato non insegue nella settimana dopo
await page.evaluate(REC);
await page.evaluate(() => { const C = window.__CPM_CAREER; C.notify('X occupa la scena'); C.notify('Y minore della settimana vecchia'); });
await sleep(400);
let mossa = null;
for (let i = 0; i < 20; i++) { mossa = await page.evaluate(() => window.__CPM_CAREER.step()); if (mossa === 'advanced' || mossa === 'simulated') break; await sleep(150); }
await sleep(9000);
const dopo = (await page.evaluate(STOP)).filter(e => e.txt);
const inseguito = dopo.some(e => /Y minore/.test(e.txt));
console.log(`\n── settimana avanzata (${mossa}) con «Y» ancora in coda → mostrato dopo: ${inseguito ? 'SÌ (accavallamento)' : 'no, scartato'}`);
if (mossa !== 'advanced' && mossa !== 'simulated') issues.push(`(3) non si è riusciti ad avanzare la settimana (${mossa})`);
else if (inseguito) issues.push('(3) un toast minore della settimana precedente insegue in quella nuova');

// ── (4) il toast solitario resta leggibile
await page.evaluate(REC);
await page.evaluate(() => window.__CPM_CAREER.notify('Z toast solitario'));
await sleep(6000);
const solo = await page.evaluate(STOP);
const iZ = solo.findIndex(e => e.txt && /Z toast/.test(e.txt));
const durata = iZ >= 0 && solo[iZ + 1] ? solo[iZ + 1].ms - solo[iZ].ms : null;
console.log(`── toast solitario a schermo per ${durata == null ? '?' : durata + 'ms'}`);
if (durata == null) issues.push('(4) toast solitario non misurabile');
else if (durata < 3000) issues.push(`(4) il toast solitario dura ${durata}ms (<3000): persa la leggibilità del 7.147.0`);

await page.close();

// ── (5) direttiva PO: la cascata di fine stagione TRATTIENE il pulsante della stagione nuova
{
  const cal = Array.from({ length: 34 }, (_, i) => ({ week: i + 1, matchday: i + 1, opponentId: 'o' + i, opponentName: 'Club ' + i, isHome: i % 2 === 0, played: true, result: { won: true, drew: false, homeScore: 2, awayScore: 0, simulated: true } }));
  const ids = ['juve', 'tor', 'inter', 'milan', 'napoli', 'roma', 'ata', 'lazio', 'fio', 'bol', 'udi', 'sas', 'cag', 'sam', 'gen', 'ver', 'mon2', 'lec'];
  const st = ids.map((id, i) => ({ id, n: id === 'tor' ? 'FC Granata' : 'Club ' + id.toUpperCase(), pts: 92 - i * 5, played: 34, w: 20, d: 0, l: 14, gf: 60 - i, ga: 25 + i })).sort((a, b) => b.pts - a.pts);
  const s2 = JSON.parse(JSON.stringify(save)); Object.assign(s2.player, { week: 37, calendar: cal, standings: st, goals: 26, assists: 9, matches: 34 });
  const p2 = await browser.newPage({ viewport: { width: 480, height: 1500 } });
  p2.on('pageerror', e => issues.push('pageerror(fine): ' + String(e.message).slice(0, 120)));
  await installCdnRoutes(p2);
  await p2.addInitScript((o) => { window.__CPM_GLB = false; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, s2);
  await p2.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 40000 });
  await p2.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1400);
  try { await p2.getByText('Continua', { exact: false }).first().click({ timeout: 4000 }); } catch (e) {}
  await p2.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 25000 });
  await sleep(800);
  let fine = false;
  for (let i = 0; i < 12; i++) { const r = await p2.evaluate(() => { const C = window.__CPM_CAREER; const x = C.step(); C.dismiss(); return x; }); if (r === 'seasonEnd') { fine = true; break; } if (typeof r === 'string' && r.startsWith('blocked:')) await p2.evaluate(() => window.__CPM_CAREER.clearTournaments()); await sleep(300); }
  if (!fine) issues.push('(5) non si è raggiunta la fine stagione');
  else {
    for (const lbl of [/Salta il gala/i, /Continua alla Fine Stagione/i]) { try { await p2.getByRole('button', { name: lbl }).first().click({ timeout: 2500 }); await sleep(900); } catch (e) {} }
    // si accoda una cascata come farebbe il rollover, poi si guarda il pulsante
    await p2.evaluate(() => { const C = window.__CPM_CAREER; ['premi', 'crescita', 'economia', 'movimenti'].forEach(m => C.notify('rollover ' + m)); });
    await sleep(600);
    const stato = (lbl) => p2.evaluate((l) => { const b = [...document.querySelectorAll('button')].find(x => new RegExp(l, 'i').test(x.innerText)); return b ? { txt: b.innerText.trim().slice(0, 40), off: b.disabled } : null; }, lbl);
    const durante = await stato('Riepilogo in corso|Inizia Stagione');
    console.log(`\n── fine stagione con la cascata in corso → pulsante: ${durante ? `«${durante.txt}» disabilitato=${durante.off}` : 'NON TROVATO'}`);
    if (!durante) issues.push('(5) pulsante di inizio stagione non trovato');
    else if (!durante.off) issues.push('(5) si può avviare la nuova stagione mentre la cascata di toast è ancora in corso');
    await sleep(12000);
    const poi = await stato('Riepilogo in corso|Inizia Stagione');
    console.log(`── cascata esaurita → pulsante: ${poi ? `«${poi.txt}» disabilitato=${poi.off}` : 'NON TROVATO'}`);
    if (poi && poi.off) issues.push('(5) il pulsante resta bloccato anche a coda vuota');
  }
  await p2.close();
}

await browser.close(); srv.close();
if (issues.length) { console.log('\n❌ FAIL\n' + issues.map(x => ' · ' + x).join('\n')); process.exit(1); }
console.log('\n✅ PASS — il risultato arriva per primo, la raffica scorre e nulla insegue nella settimana dopo');
