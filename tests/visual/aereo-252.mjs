#!/usr/bin/env node
/* [PO-252/6 giro 22] GUARDIANO: IL PALLONE NON TORNA INDIETRO A FINE COSTRUZIONE AEREA (banco PO-248 difetto #6: volee gi65 5/5, passo
   isolato di 3,0-3,1u attribuito a `buildup-aereo`). Stesso criterio del banco per un SALTO del pallone: passo fra due fotogrammi
   consecutivi con avanzamento di scena, fuori dagli stacchi neri, oltre 2,5u E oltre 2,5 volte il piu' grande dei due passi vicini
   (un volo veloce ma continuo non e' un salto). GLB acceso, pagina nuova per scena, volee gi65 con tre esiti.
   Verde: nessun salto isolato nelle fasi d'highlight; rosso __CPM_NO_AER252: almeno 2 esecuzioni con salto.                        */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, passiPalla } from './lib/scena-252.mjs';
const CASI = [[65, 'success', null], [65, 'fail', null], [65, 'fail', 'saved']];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { verde: [], rosso: [] };
for (const br of ['verde', 'rosso']) for (const [gi, out, kind] of CASI) {
  const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_AER252: 1 } : {});
  const r = await scena252(page, { gi, k: 0, out, kind, secondi: 3.5, prima: () => { window.__CPM_AER252 = []; }, raccogli: () => ({ fr: window.__S252.fr.slice(), aer: window.__CPM_AER252 || [] }) });
  await page.close();
  const P = passiPalla((r && r.fr) || []).map((p, i, A) => ({ ...p, vic: Math.max(A[i - 1] ? A[i - 1].d : 0, A[i + 1] ? A[i + 1].d : 0) }));
  const salti = P.filter(p => /^hl_/.test(String(p.ph || '')) && p.ds <= 0.051 && p.d > 2.5 && p.d > 2.5 * p.vic);
  ris[br].push(salti.length);
  console.log(`  ${br.padEnd(5)} gi${gi} ${(kind || out).padEnd(7)} salti isolati ${salti.length}${salti.length ? ' (' + salti.map(s => s.d.toFixed(2) + 'u vicini ≤ ' + s.vic.toFixed(2)).join('; ') + ')' : ''} · consegna ${JSON.stringify(r && r.aer)}`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const ok = ris.verde.length >= 2 && ris.verde.every(x => x === 0) && ris.rosso.filter(x => x > 0).length >= 2;
console.log(`\nverde: esecuzioni con salto ${ris.verde.filter(x => x > 0).length}/${ris.verde.length} · rosso: ${ris.rosso.filter(x => x > 0).length}/${ris.rosso.length}`);
console.log(ok ? '✅ aereo-252 VERDE' : '❌ aereo-252 ROSSO'); setTimeout(() => process.exit(ok ? 0 : 1), 100);
