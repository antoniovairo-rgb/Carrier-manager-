#!/usr/bin/env node
/* [PO-252/4 giro 22] GUARDIANO: IL RINVIO DIFENSIVO NON VIAGGIA PIU' VELOCE DI UN CALCIO VERO (banco PO-248 difetto #4: 5 difese su 16
   oltre 40 u/s, fino a 92). Stessa grandezza del banco (`v arco` = distanza percorsa dal pallone durante l'arco / durata dell'arco,
   dal testimone __CPM_GK229 in tempo di scena), GLB acceso, pagina nuova per scena, interventi difensivi RIUSCITI (dove si rinvia).
   [giro 50 PO-271] RIPARATO IL BRACCIO ROSSO. MISURATO (testimone __CPM_RINVIO252 ora scritto in entrambi i bracci, 24 scene): con le
   regie di oggi i rinvii di gi133/31/130/146 sono corti e VARIABILI (gi133: 20,7u in un giro, 7,2u nel successivo: il bersaglio ha una
   componente casuale preesistente), quindi la velocita' rossa (distanza / durata di tabella 0,32-0,6 s) superava 40 u/s solo per caso
   (1 scena su 20). Due scene hanno invece il rinvio LUNGO e stabile: gi36 «Duello aereo su corner» 28,7-29,1u (rosso 0,6 s = 48 u/s,
   verde 1,1 s = 26 u/s, 5 giri su 5) e gi35 «Contropiede avversario» 23,2u (rosso 38,7 · verde 26, 5 su 5). E la misura campionata
   (__CPM_GK229, tempo di scena) seguiva spesso un altro volo (2u in 0,4 s): ora il giudice e' la velocita' DI PROGETTO dell'arco
   d'esito, distanza / durata scritte nel punto in cui la correzione decide — la stessa grandezza che la correzione controlla.
   Verde: velocita' di progetto ≤ 32 u/s su tutte; rosso __CPM_NO_RINVIO252 (solo gi36 e gi35): almeno una oltre 40 u/s.          */

import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
const BRACCI = { verde: [[133, 0], [31, 0], [130, 2], [31, 1], [146, 0], [36, 0], [35, 0]], rosso: [[36, 0], [35, 0]] };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { verde: [], rosso: [] };
for (const br of ['verde', 'rosso']) for (const [gi, k] of BRACCI[br]) {
  const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_RINVIO252: 1 } : {});
  const r = await scena252(page, { gi, k, out: 'success', secondi: 3, prima: () => { window.__CPM_RINVIO252 = []; }, raccogli: () => ({ rv: (window.__CPM_RINVIO252 || []).slice() }) });
  await page.close();
  const w = ((r && r.rv) || []).filter(x => x.dur > 0).slice(-1)[0]; const v = w ? +(w.d / w.dur).toFixed(1) : null;
  ris[br].push(v);
  console.log(`  ${br.padEnd(5)} gi${gi} az.${k} ${w ? `rinvio ${w.d}u in ${w.dur} s → ${v} u/s` : 'nessun arco d\'esito (n.g.)'}`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const V = ris.verde.filter(x => x != null), R = ris.rosso.filter(x => x != null);
if (V.length < 5 || R.length < 1) { console.log('❌ CIECO'); setTimeout(() => process.exit(2), 100); }
else { const ok = Math.max(...V) <= 32 && R.some(x => x > 40);
  console.log(`\nverde: v max ${Math.max(...V)} u/s · rosso: v max ${Math.max(...R)} u/s (${R.filter(x => x > 40).length} oltre 40)`);
  console.log(ok ? '✅ rinvio-252 VERDE' : '❌ rinvio-252 ROSSO'); setTimeout(() => process.exit(ok ? 0 : 1), 100); }
