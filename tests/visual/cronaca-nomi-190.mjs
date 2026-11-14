#!/usr/bin/env node
/* [giro 190 · PO-380a · G181-01 «fallo di un giocatore su un giocatore»] GUARDIANO cronaca-nomi-190.
   Partite vere a motore acceso (lib/cronaca-motore.mjs, testimone del narratore): nessuna riga della cronaca contiene il
   segnaposto «un giocatore» / «un compagno». Misura di partenza (giro 190, 2 partite): 6 righe su 125 (4,8%), tutte di fallo —
   il fallo nato dentro la scena dell'eroe arriva senza chi/su. Dopo: 0 su 125, e quando a subire e' l'eroe la riga lo nomina.
   Criteri: 0 righe col segnaposto; almeno 100 righe; ogni partita arriva al fischio oltre l'85' (altrimenti NON GIUDICATO = rosso).
   Braccio rosso: CPM_ROSSO190A=1 accende __CPM_NO_G190A → deve trovare almeno una riga col segnaposto (uscita 1 = difetto visto).
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node cronaca-nomi-190.mjs  (≈ 4-5 minuti) */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { giocaPartita } from './lib/cronaca-motore.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROSSO = process.env.CPM_ROSSO190A === '1';
const srv = await startServer(); const b = await launchBrowser();
let tot = 0, troncata = false; const bad = [], errs = [], fini = [];
for (let i = 0; i < 2; i++) {
  const r = await giocaPartita(b, srv.address().port, { nome: 'Testi' + i, seed: 190 + i * 31, flags: ROSSO ? ['__CPM_NO_G190A'] : [] });
  errs.push(...r.errs); fini.push(`${r.minMax}' (${r.fine})`); if (r.fine !== 'fischio' || r.minMax < 85) troncata = true;
  for (const x of r.nar) { tot++; if (/\bun (giocatore|compagno)\b/i.test(x.txt)) bad.push(`${x.min}' ${x.txt}`); }
}
await b.close(); srv.close();
console.log(`partite: ${fini.join(' · ')} · righe ${tot} · col segnaposto ${bad.length}`);
for (const x of bad.slice(0, 6)) console.log('   ' + x);
for (const e of errs.slice(0, 3)) console.log('  ⚠ pageerror: ' + e);
const giudicato = !troncata && tot >= 100 && errs.length === 0;
const verde = giudicato && bad.length === 0;
console.log(`\n${ROSSO ? '[braccio ROSSO __CPM_NO_G190A] ' : ''}cronaca-nomi-190: ${!giudicato ? 'NON GIUDICATO (rosso)' : verde ? 'VERDE' : 'ROSSO'}`);
process.exit(verde ? 0 : 1);
