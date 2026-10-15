/* [PO-252 giro 42] Sonda di ATTRIBUZIONE del salto isolato della camera (voce 9 del banco 248).
   GLB acceso, pagina nuova per scena, tempo di scena. Legge il testimone __CPM_CAMJ42 (posizione resa + mani del
   fotogramma). Un salto = passo > 2,5u con i vicini < 1/2,5 del passo, fuori dagli stacchi. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, kDi } from './lib/scena-252.mjs';
const CASI = (process.env.CPM_CASI || '0:sbaglia,66:parata,16:intercetto,0:gol,66:fuori').split(',').map(s => { const [g, e] = s.split(':'); return { gi: +g, e }; });
const RIP = +(process.env.CPM_RIP || 1);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const flags = process.env.CPM_FLAGS ? JSON.parse(process.env.CPM_FLAGS) : {};
let salti = 0, tot = 0;
let page = null;
for (const c of CASI) for (let r = 0; r < RIP; r++) {
  if (!page || !process.env.CPM_STESSA) page = await pagina252(b, port, flags);
  const out = c.e === 'gol' || c.e === 'riesce' ? 'success' : 'fail';
  const kind = { parata: 'save', fuori: 'wide', murata: 'block', intercetto: 'intercept' }[c.e] || null;
  const k = c.e === 'gol' ? Math.max(0, await kDi(page, c.gi, 'goal')) : 0;
  const res = await scena252(page, { gi: c.gi, k, out, kind, secondi: 4, prima: () => { window.__CPM_CAMJ42 = []; }, raccogli: () => window.__CPM_CAMJ42 || [] });
  if (!process.env.CPM_STESSA) { await page.close(); page = null; } tot++;
  if (!Array.isArray(res)) { console.log(c.gi, c.e, res); continue; }
  const st = []; for (let i = 1; i < res.length; i++) { const a = res[i - 1], z = res[i]; st.push({ d: Math.hypot(z.p[0] - a.p[0], z.p[1] - a.p[1], z.p[2] - a.p[2]), i }); }
  const trov = [];
  for (let j = 0; j < st.length; j++) { const s = st[j]; if (s.d <= 2.5) continue; const v = Math.max(st[j - 1] ? st[j - 1].d : 0, st[j + 1] ? st[j + 1].d : 0); if (s.d > 2.5 * v) { const f = res[s.i], f0 = res[s.i - 1]; trov.push(`passo ${s.d.toFixed(2)}u (vicini ≤ ${v.toFixed(2)}) sc ${f0.sc}→${f.sc} ph ${f.ph} mani[${f.h}] cs ${f.cs} sc2 ${f.sc2} | bersaglio ${f0.t}→${f.t} | prima[${f0.h}]`); } }
  for (let i = 1; i < res.length; i++) { const a = res[i - 1], z = res[i]; const dt = Math.hypot(z.t[0] - a.t[0], z.t[2] - a.t[2]); if (dt > 15) trov.push(`BERSAGLIO ${dt.toFixed(1)}u sc ${a.sc}→${z.sc} ph ${z.ph} mani[${a.h}]→[${z.h}] cs ${z.cs} sc2 ${z.sc2}\n     prima: ${a.tr}\n     dopo:  ${z.tr}`); }
  if (trov.length) salti++;
  console.log(`gi${c.gi} ${c.e} · ${res.length} fot. · ${trov.length ? trov.join(' ; ') : 'nessun salto'}`);
}
console.log(`SALTI: ${salti}/${tot}`);
await b.close(); srv.close();
