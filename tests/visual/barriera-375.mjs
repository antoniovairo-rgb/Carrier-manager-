#!/usr/bin/env node
/* [giro 375 PO-637, decisione PO «Tutte le consigliate» dal giro 343] guardiano: BARRIERA A 9,15 m SULLA LINEA PALLONE-PORTA.
   Tutte le scene di punizione del catalogo + 5 costruite dal motore da punti di fallo diversi, teatro acceso e GLB acceso
   (sonda misura-375.mjs: pallone e corpi della barriera letti dalle MESH, 1 u = 1 m).
   VERDE: ogni scena giudicata, almeno 3 in barriera, centro della barriera a 9,15 ± 0,3 m dal pallone, scarto del centro dalla
   linea pallone -> centro porta <= 0,5 m, nessun corpo sotto 9 m. ROSSO (__CPM_NO_G375 = conto e schieramento di prima): almeno
   meta' delle scene fuori (centro oltre ±1 m da 9,15 o scarto dalla linea > 1 m). Una scena non giudicata e' rosso. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misura375 } from './misura-375.mjs';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const motivi = [];
console.log('— VERDE —'); const V = await misura375(b, port, false);
console.log('— ROSSO (__CPM_NO_G375) —'); const R = await misura375(b, port, true);
await b.close(); srv.close();
if (V.length < 10) motivi.push(`verde cieco: ${V.length} scene`);
for (const o of V) {
  if (o.ng) { motivi.push(`gi${o.idx} non giudicata (${o.ng})`); continue; }
  if (o.n < 3) motivi.push(`gi${o.idx}: ${o.n} in barriera`);
  if (Math.abs(o.centro - 9.15) > 0.3) motivi.push(`gi${o.idx}: centro a ${o.centro} m`);
  if (o.lato > 0.5) motivi.push(`gi${o.idx}: ${o.lato} m fuori dalla linea`);
  if (o.min < 9) motivi.push(`gi${o.idx}: un corpo a ${o.min} m`);
}
const giud = R.filter(o => !o.ng), fuori = giud.filter(o => Math.abs(o.centro - 9.15) > 1 || o.lato > 1).length;
if (giud.length < 10) motivi.push(`rosso cieco: ${giud.length} scene giudicate`);
else if (fuori < giud.length / 2) motivi.push(`il rosso non si vede: ${fuori}/${giud.length} scene fuori`);
console.log(`\nverde: ${V.length} scene · rosso: ${fuori}/${giud.length} scene fuori da 9,15 m sulla linea`);
console.log(motivi.length ? '❌ barriera-375 ROSSO: ' + motivi.join(' · ') : '✅ barriera-375 verde: barriera a 9,15 m sulla linea pallone-porta in tutte le scene (e il rosso si vede)');
process.exit(motivi.length ? 1 : 0);
