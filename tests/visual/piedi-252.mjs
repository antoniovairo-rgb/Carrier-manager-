#!/usr/bin/env node
/* [PO-252/1 giro 22] GUARDIANO: I PIEDI DELL'EROE NON PATTINANO NELLA CONCLUSIONE (banco PO-248 difetto #1).
   Misura la stessa grandezza del banco (`skateEroe` = fotogrammi dell'eroe col piede a terra che scorre > 0,5 m/s / fotogrammi
   dell'eroe in quadro, testimone __CPM_PIEDI del 7.999.7) su quattro famiglie offensive, GLB acceso, una pagina nuova per scena
   (7.483), 4 s di TEMPO DI SCENA dopo la scelta. Due bracci: verde (il gioco) e rosso (__CPM_NO_PIEDI252, la stima lenta di prima).
   Verde se: mediana verde ≤ SOGLIA e mediana rossa ≥ verde + MARGINE (la prova che il guardiano vede il difetto).
   Uso: node piedi-252.mjs   (CPM_SOLO=verde|rosso per un braccio solo, senza giudizio)                                  */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, mediana } from './lib/scena-252.mjs';
const SCENE = [{ gi: 0, k: 0, nome: 'tiro' }, { gi: 1, k: 0, nome: 'testa' }, { gi: 16, k: 0, nome: 'cross' }, { gi: 3, k: 0, nome: 'passaggio' }];
const SOGLIA = +(process.env.CPM_SOGLIA || 0.36), MARGINE = 0.08;/* misurato giro 22: mediana verde 0,298 · rossa 0,488 */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const bracci = process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'];
const ris = {};
for (const br of bracci) {
  ris[br] = [];
  for (const sc of SCENE) {
    const page = await pagina252(b, port, { ...(br === 'rosso' ? { __CPM_NO_PIEDI252: 1 } : {}), ...(process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {}) });
    const r = await scena252(page, { gi: sc.gi, k: sc.k, out: 'success', prima: () => { window.__CPM_PIEDI_REC = 1; window.__CPM_PIEDI = null; }, raccogli: () => window.__CPM_PIEDI });
    await page.close();
    const e = r && r.perCorpo && r.perCorpo[0];
    const q = e && e.fr ? +(e.sk / e.fr).toFixed(3) : null;
    ris[br].push(q);
    console.log(`  ${br.padEnd(5)} gi${sc.gi} ${sc.nome.padEnd(9)} skate eroe ${q == null ? 'n.g.' : q.toFixed(3)} (${e ? e.sk + '/' + e.fr : '—'})`);
  }
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const med = Object.fromEntries(Object.entries(ris).map(([k, v]) => [k, mediana(v.filter(x => x != null))]));
console.log(`\nmediane: ${Object.entries(med).map(([k, v]) => k + ' ' + (v == null ? 'n.g.' : v.toFixed(3))).join(' · ')}`);
if (process.env.CPM_SOLO) process.exit(0);
const giud = ris.verde.filter(x => x != null).length;
if (giud < 3) { console.log(`❌ CIECO: solo ${giud} scene giudicate`); process.exit(2); }
const ok = med.verde <= SOGLIA && med.rosso >= med.verde + MARGINE;
console.log(ok ? `✅ piedi-252 VERDE (verde ≤ ${SOGLIA}, rosso ≥ verde + ${MARGINE})` : `❌ piedi-252 ROSSO (verde ${med.verde} soglia ${SOGLIA} · rosso ${med.rosso})`);
setTimeout(() => process.exit(ok ? 0 : 1), 100);
