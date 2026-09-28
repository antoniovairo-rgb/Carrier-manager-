#!/usr/bin/env node
/* [7.999.43] GUARDIANO DELL'IMBRACATURA DEL COLLAUDO MASSIVO — una carriera di Nazionale attraversa un torneo senza intervento.
   Prima: `step()` si fermava su «blocked:euroMondiale/nationsCup» e i banchi chiudevano il torneo d'ufficio (clearTournaments), cioe' il
   torneo non veniva mai giocato. Con window.__CPM_SIM_NAT=1 il passo simula la partita della Nazionale con la funzione del bottone
   «Simula». Verde se: dalla stagione 4 settimana 20 (Europeo/Mondiale alla 24, eroe con 5 presenze) si arriva alla stagione 5 senza mai
   un «blocked», con almeno 3 partite di Nazionale simulate e il torneo chiuso da solo; snapshot() e screen() rispondono.
   Rosso: CPM_ROSSO=1 (flag spento) -> «blocked» -> FALLISCE. */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const page = await browser.newPage({ viewport: { width: 900, height: 900 } }); await installCdnRoutes(page);
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 160)));
await page.addInitScript(r => {
  window.__CPM_GLB = false; if (!r) window.__CPM_SIM_NAT = 1;
  const save = { phase: 'career', player: { name: 'Sim Nazionale', nation: 'Italia', avatarId: 0, proStatus: 'pro', season: 4, week: 20, age: 26, ovr: 86, tutorialDone: true, nationalCaps: 5,
    campDone: true, presidentModalSeason: 4, jerseyNumSeason: 4, drawSeen: 4, mercatoSeen: 4, presentSeason: 4, weekLived: false,
    club: { id: 'b04', n: 'FC Werkstadt', a: 'WRK', p: 80, c: '#dc2626', c2: '#111111', nat: '🇩🇪', lg: 'Deutsche Liga' },
    stats: { 'velocità': 86, tecnica: 86, fisico: 84, 'mentalità': 85, tiro: 87, passaggio: 84, dribbling: 86, posizionamento: 85 },
    form: 80, morale: 80, fatigue: 10, coachTrust: 85, contract: { duration: 3, wage: 60000, expiresAtSeason: 7 } } };
  localStorage.setItem('cpm-v3', JSON.stringify(save));
}, ROSSO);
await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
await sleep(1500); try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 30000 }); await sleep(1200);
const conta = {}; let iter = 0, blocked = 0, fine = false, snapOk = false, screenOk = false, emFine = null;
while (iter++ < 260) {
  const r = await page.evaluate(() => { const C = window.__CPM_CAREER; const res = C.step(); C.dismiss(); const s = C.snapshot(); return { res, season: s && s.season, week: s && s.week, em: s && s.euroMondiale ? { a: !!s.euroMondiale.active, d: !!s.euroMondiale.done, ph: s.euroMondiale.phase } : null, scr: C.screen(), snap: !!(s && typeof s === 'object' && s.name) }; }).catch(e => ({ res: 'error:' + e.message }));
  conta[String(r.res).split(':').slice(0, 2).join(':')] = (conta[String(r.res).split(':').slice(0, 2).join(':')] || 0) + 1;
  snapOk = snapOk || r.snap; screenOk = screenOk || typeof r.scr === 'string'; if (r.em) emFine = r.em;
  if (String(r.res).startsWith('blocked:')) { blocked++; if (blocked > 3) break; continue; }
  if (r.res === 'seasonEnd') { await page.evaluate(() => { window.__CPM_CAREER.startNewSeason(); }); await sleep(800); await page.evaluate(() => window.__CPM_CAREER.dismiss()); fine = true; break; }
  if (String(r.res).startsWith('error:')) break;
  await sleep(60);
}
const stato = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { season: s.season, week: s.week, em: s.euroMondiale ? { active: !!s.euroMondiale.active, done: !!s.euroMondiale.done, phase: s.euroMondiale.phase } : null }; });
await browser.close(); srv.close();
console.log('esiti del passo: ' + JSON.stringify(conta)); console.log('stato finale: ' + JSON.stringify(stato) + ' · torneo visto: ' + JSON.stringify(emFine));
const err = []; const ok = (c, m) => { if (!c) err.push(m); console.log((c ? 'ok   ' : 'NO   ') + m); };
ok(blocked === 0, `mai un passo bloccato dal torneo (${blocked})`);
const nat = Object.entries(conta).filter(([k]) => k.startsWith('nat:')).reduce((a, [, v]) => a + v, 0);
ok(nat >= 3, `partite di Nazionale simulate dal passo: ${nat} (almeno 3)`);
ok(fine, 'la stagione arriva in fondo da sola (fine stagione raggiunta)');
ok(snapOk && screenOk, 'snapshot() e screen() rispondono');
ok(errors.length === 0, `nessun errore di pagina (${errors.length}${errors.length ? ': ' + errors[0] : ''})`);
if (err.length) { console.log('\nIMBRACATURA NAZIONALE: FALLITO (' + err.length + ')' + (ROSSO ? ' — atteso col rosso' : '')); process.exit(1); }
console.log('\nIMBRACATURA NAZIONALE: PASS'); process.exit(0);
