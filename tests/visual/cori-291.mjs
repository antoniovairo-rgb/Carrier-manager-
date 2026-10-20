#!/usr/bin/env node
/* [7.999.177 PO-291 guardiano] «Festeggiamenti post partita, dice sempre la stessa cosa "c'è solo un Vairo": genera varianti non
   ripetitive». Prova la funzione vera della pagina (window.__CPM_CORI291) su 10 feste di fila, passando la memoria come fa la festa:
   1) ogni festa ha 2 cori diversi fra loro e col cognome dell'eroe;
   2) nessun coro si ripete nelle 3 feste successive (memoria degli ultimi 6);
   3) in 10 feste almeno 10 cori diversi;
   4) i cori sui gol seguono i gol dell'eroe (2 gol: «Doppietta»/«Due gol» possibili, mai «Tripletta»).
   ROSSO: CPM_PROVA_ROSSO=1 accende __CPM_NO_CORI291 (sempre gli stessi due cori) e pretende che 2) e 3) cadano. */
import { startServer, launchBrowser, installCdnRoutes } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function giro(rosso) {
  const ctx = await b.newContext(); const page = await ctx.newPage(); await installCdnRoutes(page);
  if (rosso) await page.addInitScript(() => { window.__CPM_NO_CORI291 = true; });
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 90000 });
  await page.waitForFunction(() => typeof window.__CPM_CORI291 === 'function', null, { timeout: 60000 });
  const r = await page.evaluate(() => { let usati = []; const feste = [];
    for (let w = 1; w <= 10; w++) { const c = window.__CPM_CORI291('Vairo', w % 4, 'Marco Vairo|2|' + w, usati); feste.push({ c, g: w % 4 }); usati = usati.concat(c).slice(-6); }
    return feste; });
  await ctx.close();
  const ko = [];
  r.forEach((f, i) => { if (f.c.length !== 2 || f.c[0] === f.c[1]) ko.push(`festa ${i + 1}: cori non distinti`); if (!f.c.every(t => /vairo/i.test(t))) ko.push(`festa ${i + 1}: coro senza il cognome`);
    if (f.g !== 3 && f.c.some(t => /Tripletta|tre volte/.test(t))) ko.push(`festa ${i + 1}: tripletta con ${f.g} gol`);
    if (f.g !== 2 && f.c.some(t => /Doppietta|Due gol/.test(t))) ko.push(`festa ${i + 1}: doppietta con ${f.g} gol`); });
  const rip = []; r.forEach((f, i) => { for (let j = i + 1; j <= i + 3 && j < r.length; j++) f.c.forEach(t => { if (r[j].c.includes(t)) rip.push(`«${t}» festa ${i + 1} e ${j + 1}`); }); });
  if (rip.length) ko.push(`ripetuti a breve: ${rip.slice(0, 3).join('; ')}`);
  const dist = new Set(r.flatMap(f => f.c)).size; if (dist < 10) ko.push(`solo ${dist} cori diversi in 10 feste`);
  return { ko, dist, rip: rip.length, es: r.slice(0, 3).map(f => f.c.join(' / ')) };
}
const v = await giro(false); console.log('VERDE', JSON.stringify({ dist: v.dist, rip: v.rip, es: v.es })); v.ko.forEach(k => console.log('  ❌ ' + k));
let ok = v.ko.length === 0;
if (process.env.CPM_PROVA_ROSSO) { const r = await giro(true); console.log('ROSSO', JSON.stringify({ dist: r.dist, rip: r.rip }));
  if (r.dist >= 10 || r.rip === 0) { console.log('  ❌ il rosso non si distingue'); ok = false; } else console.log('  ✅ il rosso fa ricadere i cori ripetuti'); }
await b.close(); srv.close();
console.log(ok ? 'CORI-291: ✅ VERDE' : 'CORI-291: ❌ ROSSO'); process.exit(ok ? 0 : 1);
