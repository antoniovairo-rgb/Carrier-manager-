#!/usr/bin/env node
/* [PO-252 giro 22] SONDA DEL PATTINAMENTO DELL'EROE nella conclusione — strumento di diagnosi (non guardiano).
   Legge il testimone di dettaglio __CPM_PIEDI_EROE (src/12, blocco del 7.999.7): per ogni fotogramma con piede a terra che
   scorre (> 0,5 m/s) separa la RADICE che trasla (velocita' della radice > 0,5 m/s) dalla clip che muove il piede a radice
   ferma, e dice quale gesto/peso c'era. Uso: node sonda-piedi-252.mjs [gi,k,out ...]  (default: tiro gi0, testa gi1, cross gi16) */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
const casi = (process.argv.slice(2).filter(a => !a.startsWith('--')).length ? process.argv.slice(2).filter(a => !a.startsWith('--')) : ['0,0,success', '1,0,success', '16,0,success'])
  .map(s => { const [gi, k, out] = s.split(','); return { gi: +gi, k: +k, out: out || 'success' }; });
const rosso = process.argv.includes('--rosso');
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
for (const c of casi) {
  const page = await pagina252(b, port, Object.assign(rosso ? { __CPM_NO_PIEDI252: 1 } : {}, process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {}));
  const r = await scena252(page, { ...c, prima: () => { window.__CPM_PIEDI_REC = 1; window.__CPM_PIEDI_EROE = 1; window.__CPM_PIEDI = null; }, raccogli: () => window.__CPM_PIEDI });
  await page.close();
  if (process.argv.includes("--debug")) console.log(JSON.stringify(r).slice(0, 600));
  const E = (r && r.eroe) || [];
  const hl = E.filter(e => e[11]);
  const sk = hl.filter(e => e[10]);
  const rad = sk.filter(e => e[1] > 0.5).length;
  const perG = {};
  for (const e of hl) { const g = (e[7] > 0.3 ? e[6] : '') || (e[8] > 0.5 ? 'corsa' : 'fermo'); const o = perG[g] || (perG[g] = { n: 0, sk: 0, rad: 0, rv: 0 }); o.n++; o.rv += e[1]; if (e[10]) { o.sk++; if (e[1] > 0.5) o.rad++; } }
  console.log(`gi${c.gi} ${c.out}: fotogrammi hl ${hl.length} · pattinano ${sk.length} (${hl.length ? (sk.length / hl.length).toFixed(2) : '-'}) · di cui con radice in moto ${rad}`);
  for (const [g, o] of Object.entries(perG)) console.log(`   ${g.padEnd(10)} n ${o.n} · pattina ${o.sk} (radice ${o.rad}) · v radice media ${(o.rv / o.n).toFixed(2)} m/s`);
  if (process.argv.includes('--verbose')) for (const e of hl.slice(0, 120)) console.log('    ', JSON.stringify(e));
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close(); process.exitCode = process.exitCode || 0; setTimeout(() => process.exit(), 200);
