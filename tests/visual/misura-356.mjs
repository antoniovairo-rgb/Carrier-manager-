#!/usr/bin/env node
/* [giro 356 · PO-557] SONDA DI MISURA — economia dello staff personale lungo una carriera simulata sugli handler VERI
 * (__CPM_CAREER.step → liveCurrentWeek/simulateAndAdvance/doAdvanceWeek → startNewSeason).
 * Registra a ogni settimana: stagione, eta', OVR, stipendio, conto, e il costo settimanale dello staff a ogni livello
 * calcolato dalla funzione VERA del gioco (staffCost24) con lo stipendio di quella settimana.
 * Rinnovo: il flusso di rinnovo vive in un modale (fuori ambito, giro 354): a contratto scaduto la sonda rinnova a
 * 3 anni alla stima di mercato del gioco (_ovrToWageWeekly133, la stessa che mostra il procuratore). Dichiarato.
 * Uso: CPM_STAGIONI=8 node misura-356.mjs  [CPM_NO_G356=1 per il prezzario di prima]  → stampa JSON su stdout (riga «DATI ») */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const STAG = +(process.env.CPM_STAGIONI || 6), OVR0 = +(process.env.CPM_OVR || 63), ROSSO = !!process.env.CPM_NO_G356;
const CLUB = { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 74, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' };
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
const st0 = { 'velocità': OVR0, tecnica: OVR0, fisico: OVR0, 'mentalità': OVR0, tiro: OVR0 + 1, passaggio: OVR0, dribbling: OVR0, posizionamento: OVR0 };
await page.addInitScript(c => { window.__CPM_GLB = false; window.__CPM_SIM_NAT = 1; if (c.rosso) window.__CPM_NO_G356 = true;
  localStorage.setItem('cpm-v3', JSON.stringify({ phase: 'career', player: { name: 'Sim Staff', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 2, week: 1, age: 19, ovr: c.ovr, tutorialDone: true,
    club: c.club, stats: c.st, form: 70, morale: 72, fatigue: 10, bankBalance: 0, contract: { duration: 3, wage: 1, expiresAtSeason: 5 } } })); }, { rosso: ROSSO, ovr: OVR0, club: CLUB, st: st0 });
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 });
await sleep(800);
// primo contratto da professionista alla stima del gioco
await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ contract: { duration: 3, wage: _ovrToWageWeekly133(P.ovr, P.club.p), expiresAtSeason: (P.season || 2) + 3 } }); });
await sleep(400);
const righe = []; let stag = 0, iter = 0, rinnovi = 0;
while (stag < STAG && iter++ < STAG * 140) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const x = String(C.step()); C.dismiss(); return x; });
  if (r === 'seasonEnd') { await page.evaluate(() => window.__CPM_CAREER.startNewSeason()); stag++; await sleep(500); await page.evaluate(() => window.__CPM_CAREER.dismiss());
    const rin = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot();
      if (P.contractExpired || !P.contract || (P.contract.duration | 0) <= 0) { window.__CPM_CAREER.patch({ contractExpired: false, contract: { duration: 3, wage: _ovrToWageWeekly133(P.ovr, (P.club && P.club.p) || 60), expiresAtSeason: (P.season || 1) + 3 } }); return true; } return false; });
    if (rin) rinnovi++; await sleep(300); continue; }
  if (r.startsWith('blocked:')) { await page.evaluate(() => window.__CPM_CAREER.clearTournaments && window.__CPM_CAREER.clearTournaments()); continue; }
  if (r.startsWith('error:')) { console.log('errore step', r); break; }
  if (r === 'simulated' || r === 'advanced') {
    const s = await page.evaluate(() => { const P = window.__CPM_CAREER.snapshot(); const c = {};
      STAFF24.forEach(d => { c[d.k] = [1, 2, 3].map(L => staffCost24(P, d.k, L)); });
      const ing = (typeof staffIngaggio356 === 'function') ? Object.fromEntries(STAFF24.map(d => [d.k, [1, 2, 3].map(L => staffIngaggio356(P, d.k, L))])) : null;
      return { s: P.season, w: P.week, age: P.age, ovr: P.ovr, wage: (P.contract && P.contract.wage) || 0, bank: Math.round(P.bankBalance || 0), agent: !!P.hasAgent, c, ing }; });
    righe.push(s); }
  await sleep(60);
}
console.log('DATI ' + JSON.stringify({ rosso: ROSSO, ovr0: OVR0, stagioni: stag, rinnovi, errors: errors.slice(0, 3), righe }));
await browser.close(); srv.close();
