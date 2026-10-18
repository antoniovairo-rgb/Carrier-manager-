#!/usr/bin/env node
/* [PO-252/3 giro 22] GUARDIANO: L'EROE NON E' IMMOBILE NEGLI INTERVENTI DIFENSIVI (banco PO-248 difetto #3: 4 difese su 16 con eroe
   fermo e senza gesto nell'80%+ dei primi 2 s di scena). Stessa grandezza del banco (`fermoQ`: quota di fotogrammi dei primi 2 s di
   scena dopo la scelta con eroe che non si sposta oltre 0,005u E senza gesto GLB di peso > 0,1), GLB acceso, pagina nuova per scena.
   Scene del banco: gi133 «Sprint disperato sulla linea» (riesce/sbaglia), gi31 «Scivolata netta», gi130 «Anticipo sulla traiettoria».
   [giro 50 PO-271] RIPARATO IL BRACCIO ROSSO CIECO. MISURATO (contatore __CPM_DIF252, sonda per fotogramma, bisezione su worktree):
   dal giro 31 (PO-220, `__CPM_NO_POSTO31`) il 3D apre la scena difensiva col portatore a 1,5 u dall'eroe — su 5eb5500 il pallone di
   gi133 stava a 51 u, dopo l'unione e135a74 a 1,5 u — quindi l'attesa del contrasto (7.415, pallone oltre 5 u) non scatta mai e la
   correzione 252 non gira (contatore 0 su 4 scene in entrambi i bracci): il rosso non poteva vedere niente. Inoltre il tetto
   dell'attesa e' sceso a 0,5 s (giro 16, `__CPM_NO_ATT220`). Tre bracci:
   REALE (gioco com'e'): nessuna scena >= 0,8 (non regressione di cio' che il giocatore vede);
   PROVA (__CPM_NO_POSTO31 + __CPM_NO_ATT220: la condizione originale del difetto): nessuna >= 0,8 E la correzione gira (contatore > 0);
   ROSSO (PROVA + __CPM_NO_DIF252): almeno 2 su 3 >= 0,8. Nei bracci PROVA/ROSSO la quota si misura sui primi 0,8 s: su 2 s il
   rosso usciva a 0,42-0,43 una volta su tre (dopo ~0,9 s di immobilita' parte la spinta del contrasto 7.420, che e' un'altra correzione). gi130 escluso dai bracci di prova: li' l'attesa scatta a caso (0 o 1).    */

import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
const REALI = [[133, 'success'], [133, 'fail'], [31, 'success'], [130, 'success']], PROVE = [[133, 'success'], [133, 'fail'], [31, 'success']];
const COND = { __CPM_NO_POSTO31: 1, __CPM_NO_ATT220: 1 };
const BRACCI = { reale: [REALI, {}], prova: [PROVE, COND], rosso: [PROVE, { ...COND, __CPM_NO_DIF252: 1 }] };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { reale: [], prova: [], rosso: [] }, giri = { prova: 0 };
for (const br of (process.env.CPM_SOLO ? [process.env.CPM_SOLO] : Object.keys(BRACCI))) for (const [gi, out] of BRACCI[br][0]) {
  const page = await pagina252(b, port, { ...BRACCI[br][1], ...(process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {}) });
  const r = await scena252(page, { gi, k: 0, out, secondi: 2.5, prima: () => { window.__CPM_DIF252 = 0; }, raccogli: () => ({ fr: window.__S252.fr.slice(), d: window.__CPM_DIF252 || 0 }) });
  await page.close();
  const F = ((r && r.fr) || []).filter(f => f.ck != null && f.h); if (F.length < 8) { console.log(`  ${br} gi${gi} ${out}: non giudicata`); continue; }
  const W = br === 'reale' ? 2.0 : 0.8;/* [giro 50] prova/rosso: la finestra dell'attesa (misurato: col rosso l'eroe sta fermo 0,85-1,4 s, poi parte la spinta 7.420) */
  const c0 = F[0].ck; const R2 = F.filter(f => f.ck - c0 <= W); let fermi = 0, n = 0, perc = 0;
  for (let i = 1; i < R2.length; i++) { const a = R2[i - 1], c = R2[i]; if (!(c.ck > a.ck)) continue; n++; const d = Math.hypot(c.h[0] - a.h[0], c.h[2] - a.h[2]); perc += d; const gesto = c.g && c.g[0] && (c.g[1] || 0) > 0.1; if (d <= 0.005 && !gesto) fermi++; }
  const q = n ? +(fermi / n).toFixed(2) : null; ris[br].push(q); if (br === 'prova' && r.d > 0) giri.prova++;
  console.log(`  ${br.padEnd(5)} gi${gi} ${out.padEnd(7)} fermo ${q} · percorso nei primi ${W} s ${perc.toFixed(1)}u · correzione 252 ${r.d} fotogrammi`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const V = ris.reale.filter(x => x != null), P = ris.prova.filter(x => x != null), R = ris.rosso.filter(x => x != null);
if (process.env.CPM_SOLO) { console.log('(braccio singolo, nessun verdetto)'); setTimeout(() => process.exit(0), 100); }
else if (V.length < 3 || P.length < 2 || R.length < 2) { console.log('❌ CIECO'); setTimeout(() => process.exit(2), 100); }
else { const ok = V.every(x => x < 0.8) && P.every(x => x < 0.8) && giri.prova >= 2 && R.filter(x => x >= 0.8).length >= 2;
  console.log(`\nreale: fermi ≥ 0,8 ${V.filter(x => x >= 0.8).length}/${V.length} · prova: ${P.filter(x => x >= 0.8).length}/${P.length} (correzione attiva in ${giri.prova}) · rosso: ${R.filter(x => x >= 0.8).length}/${R.length}`);
  console.log(ok ? '✅ difesa-252 VERDE' : '❌ difesa-252 ROSSO'); setTimeout(() => process.exit(ok ? 0 : 1), 100); }
