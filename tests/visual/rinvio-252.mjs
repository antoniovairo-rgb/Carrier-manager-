#!/usr/bin/env node
/* [PO-252/4 giro 22] GUARDIANO: IL RINVIO DIFENSIVO NON VIAGGIA PIU' VELOCE DI UN CALCIO VERO (banco PO-248 difetto #4: 5 difese su 16
   oltre 40 u/s, fino a 92). Stessa grandezza del banco (`v arco` = distanza percorsa dal pallone durante l'arco / durata dell'arco,
   dal testimone __CPM_GK229 in tempo di scena), GLB acceso, pagina nuova per scena, interventi difensivi RIUSCITI (dove si rinvia).
   Verde: v arco massima ≤ 32 u/s su tutte; rosso __CPM_NO_RINVIO252: almeno una oltre 40 u/s.                                     */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
const CASI = [[133, 0], [31, 0], [130, 2], [31, 1], [146, 0]];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { verde: [], rosso: [] };
for (const br of ['verde', 'rosso']) for (const [gi, k] of CASI) {
  const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_RINVIO252: 1 } : {});
  const r = await scena252(page, { gi, k, out: 'success', secondi: 3, prima: () => { window.__CPM_GK229 = []; }, raccogli: () => ({ gk: (window.__CPM_GK229 || []).slice(), rv: window.__CPM_RINVIO252 || null }) });
  await page.close();
  const A = ((r && r.gk) || []).filter(x => x.at && x.aT >= 0);
  let v = null; if (A.length >= 3) { const a0 = A[0], a1 = A[A.length - 1]; const dt = a1.aT - a0.aT; const dd = Math.hypot(a1.bx - a0.bx, a1.bz - a0.bz, a1.by - a0.by); if (dt > 0.05) v = +(dd / dt).toFixed(1); }
  ris[br].push(v);
  console.log(`  ${br.padEnd(5)} gi${gi} az.${k} v arco ${v == null ? 'n.g.' : v + ' u/s'} ${r && r.rv ? JSON.stringify(r.rv.slice(-1)) : ''}`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const V = ris.verde.filter(x => x != null), R = ris.rosso.filter(x => x != null);
if (V.length < 3) { console.log('❌ CIECO'); setTimeout(() => process.exit(2), 100); }
else { const ok = Math.max(...V) <= 32 && R.some(x => x > 40);
  console.log(`\nverde: v max ${Math.max(...V)} u/s · rosso: v max ${R.length ? Math.max(...R) : '—'} u/s (${R.filter(x => x > 40).length} oltre 40)`);
  console.log(ok ? '✅ rinvio-252 VERDE' : '❌ rinvio-252 ROSSO'); setTimeout(() => process.exit(ok ? 0 : 1), 100); }
