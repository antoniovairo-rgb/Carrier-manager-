/* [7.324.0] GUARDIANO STATICO — LA NEVE RESTA UN EVENTO RARISSIMO (collaudo PO, due gare dell'Europeo
   di fila imbiancate). Legge le tabelle meteo DAL SORGENTE (pattern no-calendar-year-test: lint statico,
   nessun browser) e ricalcola la probabilita' composta neve+grandine nel PEGGIOR caso stagionale su sede
   neutra (= le gare delle Nazionali): deve stare sotto il 2.5%% a partita. Un futuro rebalancing che
   rialzasse i moltiplicatori invernali fallirebbe qui, con la cifra stampata.

     node snow-rarity-test.mjs
*/
import { readFileSync } from 'fs';
const src = readFileSync(new URL('../../CARRIER-MANAGER-AV.html', import.meta.url), 'utf-8');

/* le righe della tabella contengono ef:{...} in mezzo: si parsa riga per riga, prendendo l'ULTIMO w: */
const wt = {};
for (const line of src.split('\n')) {
  const mid = line.match(/^\s*\{id:"(\w+)",\s*name:/); if (!mid) continue;
  const mw = line.match(/w:(\d+(?:\.\d+)?)[,}]/); if (!mw) continue;
  if (/tod:\[/.test(line) && !/"day"/.test(line)) continue; /* voci solo notte/tramonto: fuori dal pool diurno */
  wt[mid[1]] = +mw[1];
}
if (wt.snow == null || wt.hail == null || wt.sunny == null) { console.log('❌ tabella WEATHER_TYPES non trovata/parsata'); process.exit(2); }

/* le righe stagionali: oggetti return{...} dentro seasonalWeights */
const body = src.split('function seasonalWeights')[1]?.split('\n// Sprint 16')[0] || '';
const seasons = [...body.matchAll(/return\{([^}]*)\}/g)].map(m => {
  const o = {}; for (const kv of m[1].matchAll(/(\w+):([\d.]+)/g)) o[kv[1]] = +kv[2]; return o;
});
if (seasons.length < 4) { console.log('❌ stagioni non parsate:', seasons.length); process.exit(2); }

let fails = 0, worst = 0, dove = '';
seasons.forEach((se, i) => {
  const pool = Object.entries(wt).map(([id, w]) => w * (se[id] != null ? se[id] : 1));
  const tot = pool.reduce((a, b) => a + b, 0);
  const p = ((wt.snow * (se.snow != null ? se.snow : 1)) + (wt.hail * (se.hail != null ? se.hail : 1))) / tot * 100;
  if (p > worst) { worst = p; dove = `stagione #${i + 1}`; }
  console.log(`stagione #${i + 1} · P(neve+grandine) su sede neutra ${p.toFixed(2)}%`);
});
if (worst > 2.5) { fails++; console.log(`❌ ${dove}: ${worst.toFixed(2)}% supera il tetto del 2.5% a partita`); }
console.log(fails ? '\n❌ FAIL — la neve non è più rarissima' : `\n✅ PASS — peggior caso ${worst.toFixed(2)}% a partita (${dove}): la neve resta un evento rarissimo`);
process.exit(fails ? 2 : 0);
