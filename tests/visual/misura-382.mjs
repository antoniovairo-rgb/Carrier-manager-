/* [giro 382] Sonda: distanza del difensore piu' vicino al punto del cross di gi148 all'armo dell'arco (la soglia 9u separa
   gesto 7.519 da movimento 252). Uso: node misura-382.mjs <ripetizioni> [FLAG=1 ...]. Non e' un guardiano. */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
const N = +(process.argv[2] || 2), flags = {}; for (const a of process.argv.slice(3)) { const [k, v] = a.split('='); flags[k] = isNaN(+v) ? v : +v; }
const GI = +(process.env.CPM_GI || 148);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const out = [];
for (let i = 0; i < N; i++) for (const e of ['riesce', 'sbaglia', 'intercetto']) {
  const page = await pagina252(b, port, flags);
  const r = await scena252(page, { gi: GI, out: e === 'riesce' ? 'success' : 'fail', kind: e === 'intercetto' ? 'intercepted' : null, secondi: 3,
    prima: () => { window.__CPM_REA519 = []; window.__CPM_REA42N = []; },
    raccogli: () => ({ rea: (window.__CPM_REA519 || []).slice(), n: (window.__CPM_REA42N || []).slice() }) });
  await page.close();
  const d = r && r.rea && r.rea[0] ? r.rea[0].d + (r.rea[0].mov ? 'm' : 'g') : r && r.n && r.n[0] ? r.n[0].d + 'n' : JSON.stringify(r).slice(0, 80);
  out.push(`${e}:${d}`); console.log(i, e, d);
}
await b.close(); srv.close(); console.log('RIEPILOGO', JSON.stringify(flags), out.join(' '));
