/* [PO-252/9 giro 42] Guardiano del salto isolato della camera. Causa misurata: la taglia (F6, 7.505) si spegneva in UN fotogramma
   quando il soggetto della regia passa al pallone (_subjBall50) e il bersaglio della camera saltava di 32-34u senza stacco.
   Si giudica il passo del bersaglio NEI FOTOGRAMMI IN CUI IL SOGGETTO CAMBIA (testimone __CPM_CAMJ42: bersaglio, soggetto,
   stacchi), fuori dagli stacchi, in hl_result. Sequenza della pagina del banco (gi0 murata → gi66 gol/sbaglia/parata, stessa
   pagina: il difetto nasceva dalla seconda esecuzione), due pagine per braccio, GLB acceso, tempo di scena.
   Verde: nessun passo oltre 12u ai cambi di soggetto (misurato 7,3u al massimo). Rosso (__CPM_NO_TAGLIA252): almeno un passo oltre 15u. Esce 2 se nessuno
   dei due bracci vede un cambio di soggetto (cieco). */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { pagina252, scena252, kDi } from './lib/scena-252.mjs';
const SEQ = [{ gi: 0, e: 'murata' }, { gi: 66, e: 'gol' }, { gi: 66, e: 'sbaglia' }, { gi: 66, e: 'parata' }];
const PAGINE = +(process.env.CPM_PAGINE || 2);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const esito = {};
for (const br of ['verde', 'rosso']) {
  let cambi = 0, maxP = 0, oltre15 = 0; const righe = [];
  for (let pg = 0; pg < PAGINE; pg++) {
    const page = await pagina252(b, port, br === 'rosso' ? { __CPM_NO_TAGLIA252: 1 } : {});
    for (const c of SEQ) {
      const out = c.e === 'gol' ? 'success' : 'fail';
      const kind = { parata: 'saved', murata: 'blocked' }[c.e] || null;
      const k = c.e === 'gol' ? Math.max(0, await kDi(page, c.gi, 'goal')) : 0;
      const j = await scena252(page, { gi: c.gi, k, out, kind, secondi: 4, prima: () => { window.__CPM_CAMJ42 = []; }, raccogli: () => window.__CPM_CAMJ42 || [] });
      if (!Array.isArray(j)) { righe.push(`gi${c.gi} ${c.e}: ${j && j.errore}`); continue; }
      for (let i = 1; i < j.length; i++) { const a = j[i - 1], z = j[i];
        if (z.ph !== 'hl_result' || a.sb === z.sb || z.cs || z.sc2) continue;
        cambi++; const d = Math.hypot(z.t[0] - a.t[0], z.t[2] - a.t[2]); if (d > maxP) maxP = d; if (d > 15) oltre15++;
        righe.push(`gi${c.gi} ${c.e}: soggetto ${a.sb ? 'palla→eroe' : 'eroe→palla'} · bersaglio ${d.toFixed(1)}u (peso taglia ${a.w}→${z.w})`); }
    }
    await page.close();
  }
  esito[br] = { cambi, maxP, oltre15 };
  console.log(`[${br}] cambi di soggetto ${cambi} · passo massimo ${maxP.toFixed(1)}u · oltre 15u: ${oltre15}\n  ` + righe.join('\n  '));
}
await b.close(); srv.close();
const V = esito.verde, R = esito.rosso;
if (!V.cambi || !R.cambi) { console.log('⚠️ camera-252 CIECO: nessun cambio di soggetto osservato'); process.exit(2); }
const okV = V.maxP <= 12, okR = R.oltre15 >= 1;
console.log(okV && okR ? '✅ camera-252 VERDE (e il rosso vede il salto)' : `❌ camera-252: verde ${okV ? 'ok' : 'KO'} · rosso ${okR ? 'vede' : 'CIECO'}`);
process.exit(okV && okR ? 0 : 1);
