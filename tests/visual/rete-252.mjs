#!/usr/bin/env node
/* [PO-252/2 giro 22] GUARDIANO: IL PALLONE ENTRA IN RETE SENZA TELETRASPORTO (banco PO-248 difetto #2: 4 gol su 13, palo → fondo rete
   in un fotogramma da 3,0-3,3u). Gol forzati (azione col premio «goal», successo) sulle scene del banco: tiro gi0/66/113, volee gi9.
   Misura, dalle MESH e in tempo di scena (campionatore per fotogramma, stacchi neri scartati), il PASSO PIU' GRANDE del pallone
   quando sta a ridosso della porta (x ≥ 46 in partenza e in arrivo) e dove finisce (dentro la rete: 48,6 ≤ x ≤ 49,4, |z| ≤ 3,35).
   Verde: passo max ≤ 1,5u in tutti i gol e pallone finale in rete; rosso __CPM_NO_RETE252 deve mostrare almeno un salto ≥ 2,5u.  */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, kDi, passiPalla } from './lib/scena-252.mjs';
const SCENE = [0, 66, 113, 9];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const ris = { verde: [], rosso: [] };
for (const br of ['verde', 'rosso']) for (const gi of SCENE) {
  const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_RETE252: 1 } : {});
  const k = await kDi(page, gi, 'goal');
  if (k < 0) { await page.close(); continue; }
  const r = await scena252(page, { gi, k, out: 'success', secondi: 5, raccogli: () => ({ fr: window.__S252.fr.slice(), out: window.__CPM_OUTCOME ? window.__CPM_OUTCOME.outKey : null }) });
  await page.close();
  if (!r || !r.fr) { console.log(`  ${br} gi${gi}: ${r && r.errore}`); continue; }
  const P = passiPalla(r.fr).filter(p => /^hl_/.test(String(p.ph || '')) && Math.abs(p.x) >= 46 && Math.abs(p.x0) >= 46 && p.ds <= 0.051);
  const max = P.reduce((m, p) => Math.max(m, p.d), 0);
  const ult = [...r.fr].reverse().find(f => f.b);
  const inRete = !!(ult && ult.b[0] >= 48.6 && ult.b[0] <= 49.45 && Math.abs(ult.b[2]) <= 3.35);
  ris[br].push({ gi, max: +max.toFixed(2), inRete, fine: ult ? ult.b.map(v => +v.toFixed(2)) : null, esito: r.out });
  console.log(`  ${br.padEnd(5)} gi${gi} esito ${r.out} · passo max a ridosso della porta ${max.toFixed(2)}u (${P.length} passi) · fine ${ult ? ult.b.map(v => v.toFixed(2)).join(',') : '—'} ${inRete ? 'IN RETE' : 'fuori rete'}`);
}
await Promise.race([b.close(), new Promise(r => setTimeout(r, 5000))]); srv.close();
const V = ris.verde.filter(x => x.esito === 'goal'), R = ris.rosso.filter(x => x.esito === 'goal');
if (V.length < 3) { console.log(`❌ CIECO: ${V.length} gol misurati`); setTimeout(() => process.exit(2), 100); }
else {
  const ok = V.every(x => x.max <= 1.5 && x.inRete) && R.some(x => x.max >= 2.5);
  console.log(`\nverde: passo max ${Math.max(...V.map(x => x.max)).toFixed(2)}u, in rete ${V.filter(x => x.inRete).length}/${V.length} · rosso: passo max ${R.length ? Math.max(...R.map(x => x.max)).toFixed(2) : '—'}u, in rete ${R.filter(x => x.inRete).length}/${R.length}`);
  console.log(ok ? '✅ rete-252 VERDE' : '❌ rete-252 ROSSO');
  setTimeout(() => process.exit(ok ? 0 : 1), 100);
}
