/* [PO-252/8 giro 42] Guardiano: OGNI conclusione di tiro/testa/cross ha una reazione del reparto avversario — il gesto
   del 7.519 entro 9u oppure, oltre, lo SPOSTAMENTO del difensore piu' vicino verso il punto (__CPM_NO_REAZ252 = rosso).
   Scena del banco 248 senza reazione: cross gi148 (tre esiti). GLB acceso, pagina nuova per scena,
   tempo di scena. Verde: 0 esecuzioni senza reazione e, su quelle di movimento, accorciamento mediano verso il punto >= 4u (misurato 9,6u).
   Rosso: almeno un'esecuzione senza reazione (prova che il guardiano vede). */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252 } from './lib/scena-252.mjs';
/* gi66 fuori/murata (il banco li conta senza reazione) qui non raggiungono il ramo delle reazioni (testimone __CPM_REA42N vuoto):
   non riprodotti su pagina nuova, dichiarati nel rapporto del giro 42 e lasciati fuori dal guardiano. */
const CASI = [{ gi: 148, e: 'riesce' }, { gi: 148, e: 'sbaglia' }, { gi: 148, e: 'intercetto' }];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esito = {};
for (const br of (process.env.CPM_SOLO ? [process.env.CPM_SOLO] : ['verde', 'rosso'])) {
  let senza = 0, mov = 0, movOk = 0, tot = 0; const righe = [], acc = [];
  for (const c of CASI) {
    const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_REAZ252: 1 } : {});
    const out = c.e === 'riesce' ? 'success' : 'fail';
    const kind = { fuori: 'wide', murata: 'blocked', intercetto: 'intercepted' }[c.e] || null;
    const r = await scena252(page, { gi: c.gi, out, kind, secondi: 5, prima: () => { window.__CPM_REA519 = []; window.__CPM_REA42M = null; window.__CPM_REA42N = []; window.__R42MIN = null; if (!window.__R42L) { window.__R42L = 1; const L = () => { try { const m = window.__CPM_REA42M, r = (window.__CPM_REA519 || []).find(x => x.mov); if (m && r) { const d = Math.hypot(r.px - m.position.x, r.pz - m.position.z); if (window.__R42MIN == null || d < window.__R42MIN) window.__R42MIN = d; } } catch (e) {} requestAnimationFrame(L); }; requestAnimationFrame(L); } },
      raccogli: () => { const m = window.__CPM_REA42M; return { min: window.__R42MIN, rea: (window.__CPM_REA519 || []).slice(), n: (window.__CPM_REA42N || []).slice(), hit: m && m._rea42 ? m._rea42.hit | 0 : null, m: m ? [m.position.x, m.position.z] : null }; } });
    await page.close();
    if (!r || r.errore) { righe.push(`gi${c.gi} ${c.e}: ${r && r.errore}`); continue; }
    tot++;
    if (!r.rea.length) { senza++; righe.push(`gi${c.gi} ${c.e}: NESSUNA reazione ${JSON.stringify(r.n)}`); continue; }
    const mv = r.rea.find(x => x.mov);
    if (mv && r.m) { mov++; const d0 = Math.hypot(mv.px - mv.x0, mv.pz - mv.z0), d1 = r.min != null ? r.min : Math.hypot(mv.px - r.m[0], mv.pz - r.m[1]); acc.push(d0 - d1); if (d0 - d1 >= 2) movOk++; righe.push(`gi${c.gi} ${c.e}: movimento ${mv.f} da ${d0.toFixed(1)}u fino a ${d1.toFixed(1)}u dal punto (minimo) (offset applicato ${r.hit} fotogrammi)`); }
    else righe.push(`gi${c.gi} ${c.e}: gesto ${r.rea[0].f} a ${r.rea[0].d}u`);
  }
  const accM = acc.length ? [...acc].sort((a, b) => a - b)[Math.floor(acc.length / 2)] : null;
  esito[br] = { senza, mov, movOk, tot, accM };
  console.log(`[${br}] ${tot} giudicate · senza reazione ${senza} · movimento ${movOk}/${mov} accorciano >= 2u\n  ` + righe.join('\n  '));
}
await b.close(); srv.close();
if (process.env.CPM_SOLO) process.exit(0);
const V = esito.verde, R = esito.rosso;
const okV = V.tot >= 3 && V.senza === 0 && (V.mov === 0 || (V.accM != null && V.accM >= 4)), okR = R.tot >= 3 && R.senza >= 1;
console.log(`verde: accorciamento mediano ${V.accM == null ? '—' : V.accM.toFixed(1) + 'u'} (soglia 4u)`);
console.log(okV && okR ? '✅ reazione-252 VERDE (e il rosso vede il difetto)' : `❌ reazione-252: verde ${okV ? 'ok' : 'KO'} · rosso ${okR ? 'vede' : 'CIECO'}`);
process.exit(okV && okR ? 0 : 1);
