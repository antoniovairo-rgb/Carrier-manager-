/* [PO-252/7 giro 42] Sonda di ATTRIBUZIONE dell'eroe fuori quadro (voce 7 del banco 248): per ogni fotogramma di hl_result dopo la
   scelta, eroe nel quadro (ho), soggetto della regia (sb: 1 = pallone) e mani di camera del fotogramma (_tocc503), dal testimone
   __CPM_CAMJ42. GLB acceso, pagina nuova per scena (CPM_STESSA=1 per la sequenza del banco). */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, kDi } from './lib/scena-252.mjs';
const CASI = (process.env.CPM_CASI || '15:sbaglia,15:parata,78:sbaglia,66:parata,66:fuori,113:sbaglia').split(',').map(s => { const [g, e] = s.split(':'); return { gi: +g, e }; });
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const flags = process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {};
let page = null; const tot = { fr: 0, fuori: 0, fuoriSb: 0 };
for (const c of CASI) {
  if (!page || !process.env.CPM_STESSA) page = await pagina252(b, port, flags);
  const out = c.e === 'gol' || c.e === 'riesce' ? 'success' : 'fail';
  const kind = { parata: 'saved', fuori: 'wide', murata: 'blocked' }[c.e] || null;
  const k = c.e === 'gol' ? Math.max(0, await kDi(page, c.gi, 'goal')) : 0;
  const j = await scena252(page, { gi: c.gi, k, out, kind, secondi: 4, prima: () => { window.__CPM_CAMJ42 = []; }, raccogli: () => window.__CPM_CAMJ42 || [] });
  if (!process.env.CPM_STESSA) { await page.close(); page = null; }
  if (!Array.isArray(j)) { console.log(c.gi, c.e, j); continue; }
  const R = j.filter(f => f.ph === 'hl_result' && f.ho != null);
  const F = R.filter(f => f.ho === 0), Fsb = F.filter(f => f.sb === 1);
  const mani = {}; for (const f of F) { const h = f.h || 'nessuna'; mani[h] = (mani[h] || 0) + 1; }
  tot.fr += R.length; tot.fuori += F.length; tot.fuoriSb += Fsb.length;
  console.log(`gi${c.gi} ${c.e}: fuori quadro ${F.length}/${R.length} (${R.length ? (F.length / R.length * 100).toFixed(0) : 0}%) · di cui soggetto=pallone ${Fsb.length} · mani ${JSON.stringify(mani)}`);
}
console.log(`TOTALE fuori quadro ${tot.fuori}/${tot.fr} · soggetto=pallone ${tot.fuoriSb}`);
await b.close(); srv.close();
