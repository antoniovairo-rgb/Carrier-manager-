#!/usr/bin/env node
/* GIRO 4 · PO-222 (misura, sola lettura sul gioco) · decisione prepartita vs contatore presenze, su partite SIMULATE.
   Metodo: il giocatore completo si legge dal salvataggio persistito (localStorage 'cpm-v3', autosave del gioco) PRIMA di
   ogni passo: la decisione = calcCoachDecision(giocatore, 1) (funzione del gioco, globale), le presenze = player.matches.
   Il passo = __CPM_CAREER.step(): con la settimana non vissuta fa liveCurrentWeek(); con la settimana vissuta e una
   giornata presente chiama simulateAndAdvance() (la «Simula» del gioco). Dopo il passo si rilegge il salvataggio.
   ⚠️ Un salvataggio = una carriera. Variazione: fiducia iniziale (coachTrust) del salvataggio, 2 run.
   Uso: node probe-P222.mjs <fiducia> <passi> <cartella-output> */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep } from '/tmp/cpm157/tests/visual/lib/harness.mjs';

const FIX = '/tmp/cpm157/tests/visual/fixtures';
const [, , TRUST, PASSI, outDir = '.'] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const save = JSON.parse(fs.readFileSync(path.join(FIX, 'save-190-s12-ovr93.json'), 'utf8'));
const sv = JSON.parse(JSON.stringify(save)); const pl = sv.player || sv;
if (TRUST != null && TRUST !== '') pl.coachTrust = +TRUST;
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage();
await installCdnRoutes(page);
await page.addInitScript(([s]) => {
  window.__CPM_GLB = false; window.__CPM_REC = true; window.__CPM_PRESENT = 1;
  localStorage.setItem('cpm-match-speed', '2'); localStorage.setItem('cpm-v3', JSON.stringify(s));
}, [sv]);
await page.goto(`http://localhost:${srv.address().port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 });
await sleep(1200);
try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 20000 }); await sleep(1200);
try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}

const righe = [];
const leggi = () => page.evaluate(() => {
  try { const s = JSON.parse(localStorage.getItem('cpm-v3') || 'null'); const p = s && (s.player || s); if (!p) return null;
    const dec = typeof calcCoachDecision === 'function' ? calcCoachDecision(p, 1) : null;
    return { season: p.season, week: p.week, weekLived: !!p.weekLived, matches: p.matches || 0, coachTrust: p.coachTrust,
      squadRole: p.squadRole, decisione: dec ? dec.status : null, entryMinute: dec ? dec.entryMinute : null,
      contractExpired: !!p.contractExpired, injured: !!p.injured, isSuspended: !!p.isSuspended }; }
  catch (e) { return { errore: String(e && e.message) }; }
});
for (let i = 0; i < +PASSI; i++) {
  const prima = await leggi();
  const esito = await page.evaluate(() => { try { return window.__CPM_CAREER.step(); } catch (e) { return 'error:' + e.message; } });
  await sleep(600);
  const dopo = await leggi();
  righe.push({ passo: i, esito, prima, dopo, incremento: dopo && prima ? dopo.matches - prima.matches : null });
  if (esito === 'seasonEnd' || (dopo && dopo.errore)) break;
}
fs.writeFileSync(path.join(outDir, `P222-trust${TRUST || 'save'}.json`), JSON.stringify(righe, null, 1));
const simulati = righe.filter(r => r.esito === 'simulated');
const tab = {};
for (const r of simulati) { const k = (r.prima && r.prima.decisione) || 'nd'; tab[k] = tab[k] || { n: 0, conPresenza: 0 }; tab[k].n++; if (r.incremento > 0) tab[k].conPresenza++; }
console.log('passi', righe.length, 'simulati', simulati.length, 'per decisione (simulati, con presenza accreditata):', JSON.stringify(tab));
await ctx.close(); await b.close(); srv.close();
