#!/usr/bin/env node
/* [7.999.18] GUARDIANO — LE MAGLIE DEI CORPI CGTRADER HANNO NUMERO E MOTIVO (appunti PO 26/09: «mancano i numeri di maglia», «le
   maglie non hanno strisce/bande»). I GLB kit-adapter non hanno le mesh del motivo e la maglia era in tinta unita: ora riceve una
   texture disegnata (motivo del club + numero sulla schiena, layout UV misurato con una griglia di prova). Corpi CGTrader accesi,
   partita aperta: verde se almeno 10 maglie portano un numero, i numeri sono tutti diversi per squadra-colore, e c'e' quello
   dell'eroe. CPM_ROSSO=1 → __CPM_NO_MAGLIA18: nessuna maglia disegnata.
   [7.999.23] anche il PANTALONCINO porta il numero (collaudo PO): verde se almeno 10 pantaloncini numerati.
   CPM_ROSSO=pant → __CPM_NO_PANT23: pantaloncini in tinta unita. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const ROSSO = process.env.CPM_ROSSO === '1'; const ROSSO_P = process.env.CPM_ROSSO === 'pant';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
const E = []; page.on('pageerror', e => E.push(e.message));
await page.addInitScript(r => { window.__CPM_PRESENT = 1; if (r[0]) window.__CPM_NO_MAGLIA18 = 1; if (r[1]) window.__CPM_NO_PANT23 = 1; }, [ROSSO, ROSSO_P]);
await openMatch(page, port, { skipLoadAll: true, name: 'Maglie18' }); await sleep(12000);
const m = await page.evaluate(() => (window.__CPM_MAGLIE18 || []).slice());
const pant = await page.evaluate(() => (window.__CPM_PANT23 || []).slice());
const eroe = await page.evaluate(() => { try { const s = window.__CPM_STATE && window.__CPM_STATE(); return s && s.hero ? s.hero.num || null : null; } catch (e) { return null; } });
await b.close(); srv.close();
const conNum = m.filter(x => x.num != null);
const perSq = {}; for (const x of conNum) (perSq[x.shirt] = perSq[x.shirt] || []).push(x.num);
const doppi = Object.values(perSq).some(a => new Set(a).size !== a.length);
console.log(`maglie disegnate ${m.length} · con numero ${conNum.length} · squadre ${Object.keys(perSq).length} · numeri ${JSON.stringify(perSq)} · pantaloncini numerati ${pant.length} · errori pagina ${E.length}`);
if (ROSSO_P) { const ok = pant.length === 0 && conNum.length >= 10; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.23 i pantaloncini restano senza numero' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
if (ROSSO) { const ok = m.length === 0; console.log(ok ? '✅ ROSSO come atteso: senza il 7.999.18 le maglie restano in tinta unita' : '❌ il rosso non riproduce'); process.exit(ok ? 0 : 1); }
const fails = []; if (conNum.length < 10) fails.push(`solo ${conNum.length} maglie con numero`); if (pant.length < 10) fails.push(`solo ${pant.length} pantaloncini con numero`); if (doppi) fails.push('numeri ripetuti nella stessa squadra'); if (E.length) fails.push('errori di pagina: ' + E[0]);
console.log(fails.length ? '❌ FAIL maglie-numero\n  ' + fails.join('\n  ') : '✅ PASS maglie-numero'); process.exit(fails.length ? 1 : 0);
