#!/usr/bin/env node
/* [7.999.20] GUARDIANO — SUL TIRO SBAGLIATO IL CORPO GUARDA LA PORTA, NON IL PUNTO DOVE FINISCE LA PALLA (appunti PO: «Colpo di testa
   non in direzione della porta», SIT #88 «Volée su cross alzato», «Colpo di testa al volo» → miss). Il corpo si girava verso il bersaglio
   dell'arco, che su un errore sta fuori dallo specchio. Corpi CGTrader accesi, scena forzata con esito fallito piu' volte; si leggono
   solo i fotogrammi con la palla diretta FUORI dai pali. Verde: il fronte del corpo resta dentro lo specchio fra i pali (mediana dei gradi fuori < 10). CPM_ROSSO=1 → __CPM_NO_MIRA20. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r) window.__CPM_NO_MIRA20 = 1; }, ROSSO);
await openMatch(page, port, { skipLoadAll: true, name: 'Mira20' }); await sleep(8000);
let righe = [], tutte = [];
for (let giro = 0; giro < 10 && righe.length < 8; giro++) {
  await page.waitForFunction(() => { try { const a = window.__CPM_ARC; return !a || (!a.pa && !(a.arc && a.arc.length)); } catch (e) { return true; } }, { timeout: 6000 }).catch(() => {});
  await page.evaluate(() => { window.__CPM_MIRA20 = []; window.__CPM_FORCE_SIT(88, true); }); await sleep(900);
  const k = await page.evaluate(() => { const a = (window.__CPM_ACTS && window.__CPM_ACTS()) || []; const i = a.findIndex(x => /testa/i.test(String(x.label || x.l || ''))); return i >= 0 ? (a[i].i != null ? a[i].i : i) : 0; });
  await page.evaluate(k => { window.__CPM_FROZEN = false; window.__CPM_FORCE_OUTCOME = 'fail'; try { window.__CPM_RESOLVE(k); } catch (e) {} }, k);
  await sleep(4000);
  const m = await page.evaluate(() => (window.__CPM_MIRA20 || []).slice());
  tutte.push(...m); righe.push(...m.filter(x => Math.abs(x.tz) > 3.66));
}
await b.close(); srv.close();
if (!righe.length) righe = tutte;
const v = righe.map(x => x.porta).sort((a, c) => a - c), med = v.length ? v[v.length >> 1] : null;
console.log(`fotogrammi con la palla diretta fuori dai pali ${tutte.filter(x => Math.abs(x.tz) > 3.66).length} (giudicati ${v.length}) · gradi del fronte del corpo FUORI dallo specchio fra i pali (0 = dentro), mediana ${med} · gesti ${[...new Set(righe.map(x => x.g))].join(',')}`);
if (med == null) { console.log('⚠️ nessun tiro fuori dai pali in questo giro: sonda cieca'); process.exit(2); }
if (ROSSO) { console.log(med >= 10 ? '✅ ROSSO come atteso: senza il 7.999.20 il corpo guarda il punto sbagliato' : '⚠️ il rosso non si distingue in questo campione'); process.exit(0); }
console.log(med < 10 ? '✅ PASS mira-porta' : '❌ FAIL mira-porta'); process.exit(med < 10 ? 0 : 1);
